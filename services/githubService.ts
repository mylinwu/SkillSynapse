import type { RepoContext, RepoInfo, SkillFeedItem, TreeItem } from "../types";

const GITHUB_API_BASE = "https://api.github.com";
const SKILLS_FEED_URL =
	"https://cdn.jsdelivr.net/gh/NeverSight/skills_feed@main/data/skills.json";

// Helper to extract owner and repo from URL
export const parseGitHubUrl = (
	url: string,
): { owner: string; repo: string } | null => {
	try {
		const urlObj = new URL(url);
		if (urlObj.hostname !== "github.com") return null;
		const parts = urlObj.pathname.split("/").filter(Boolean);
		if (parts.length < 2) return null;
		return { owner: parts[0], repo: parts[1] };
	} catch {
		return null;
	}
};

export const fetchHotSkills = async (): Promise<SkillFeedItem[]> => {
	try {
		const res = await fetch(SKILLS_FEED_URL);
		if (!res.ok) {
			throw new Error("Failed to load skills feed");
		}
		const data = await res.json();

		// Determine which array to use based on the JSON structure provided
		// Structure: { hot: [], trending: [], allTime: [], ... }
		let rawItems: Record<string, unknown>[] = [];

		if (data.hot && Array.isArray(data.hot) && data.hot.length > 0) {
			rawItems = data.hot;
		} else if (
			data.trending &&
			Array.isArray(data.trending) &&
			data.trending.length > 0
		) {
			rawItems = data.trending;
		} else if (data.allTime && Array.isArray(data.allTime)) {
			rawItems = data.allTime;
		} else if (Array.isArray(data)) {
			rawItems = data;
		}

		// Map data to SkillFeedItem interface
		return rawItems
			.filter((item) => item.source || item.url) // Ensure we have a source to build a URL
			.map((item) => {
				// The feed uses 'source' (e.g., "owner/repo") instead of a full URL
				const source = (item.source as string) || (item.repo as string);
				const fullUrl =
					source && !source.startsWith("http")
						? `https://github.com/${source}`
						: (item.url as string) || "";

				return {
					name:
						(item.name as string) ||
						(item.skillId as string) ||
						"Unknown Skill",
					url: fullUrl,
					// Use description if available, otherwise fall back to install stats or empty string
					description:
						(item.description as string) ||
						(item.installs
							? `${(item.installs as number).toLocaleString()} installs`
							: ""),
					tags: [], // Tags are not present in the top-level feed item
				};
			})
			.filter((item) => item.url?.includes("github.com"));
	} catch {
		console.warn("Could not fetch hot skills:");
		return [];
	}
};

// Format file tree
const formatFileTree = (items: TreeItem[], subPath?: string): string => {
	let relevantItems = items;
	if (subPath) {
		const prefix = subPath.endsWith("/") ? subPath : `${subPath}/`;
		relevantItems = items.filter(
			(item) => item.path.startsWith(prefix) || item.path === subPath,
		);

		// Make paths relative to subPath for cleaner output
		relevantItems = relevantItems
			.map((item) => ({
				...item,
				path: item.path.replace(prefix, ""),
			}))
			.filter((item) => item.path !== ""); // remove the root dir itself
	}

	// Basic filtering of irrelevant files for the AI
	const filtered = relevantItems.filter((item) => {
		const path = item.path.toLowerCase();
		return (
			!path.includes("node_modules/") &&
			!path.includes(".git/") &&
			!path.includes("dist/") &&
			!path.includes("build/") &&
			!path.endsWith(".lock") &&
			!path.endsWith(".png") &&
			!path.endsWith(".jpg")
		);
	});

	// Keep it somewhat small to avoid blowing up context window
	const paths = filtered
		.map((item) => `${item.type === "tree" ? "📁" : "📄"} ${item.path}`)
		.slice(0, 150);

	if (filtered.length > 150) {
		paths.push(`... and ${filtered.length - 150} more files`);
	}

	return paths.join("\n");
};

// Fetch repository details
export const fetchRepoContext = async (
	owner: string,
	repo: string,
	skillName?: string,
	githubToken?: string,
): Promise<RepoContext> => {
	const headers = buildGitHubHeaders(githubToken);

	// 1. Get Repo Info
	const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
		headers,
	});
	if (!repoRes.ok) {
		if (repoRes.status === 404)
			throw new Error("Repository not found or private.");
		if (repoRes.status === 403)
			throw new Error(
				githubToken
					? "GitHub API rate limit exceeded for this token. Please try again later or switch token."
					: "GitHub API rate limit exceeded. Please add a GitHub Token in Settings, then retry.",
			);
		throw new Error(`GitHub API Error: ${repoRes.statusText}`);
	}
	const repoJson = await repoRes.json();

	const info: RepoInfo = {
		owner: repoJson.owner.login,
		name: repoJson.name,
		description: repoJson.description,
		stars: repoJson.stargazers_count,
		language: repoJson.language,
		defaultBranch: repoJson.default_branch,
	};

	// 2. Get File Structure (Tree)
	// We fetch the full tree first to locate the skill directory if needed
	let fullFiles: TreeItem[] = [];
	try {
		const treeRes = await fetch(
			`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${info.defaultBranch}?recursive=1`,
			{ headers },
		);
		if (treeRes.ok) {
			const treeJson = await treeRes.json();
			fullFiles = treeJson.tree;
		}
	} catch {
		console.warn("Could not fetch file tree");
	}

	// 3. Locate Target Path (if skillName provided)
	let targetPath = "";
	let targetFiles = fullFiles;

	if (skillName && skillName.trim() !== "") {
		// Find a directory that matches the skill name
		// We prioritize exact matches on the folder name
		// Example: if skillName is "weather", we look for "weather" or "skills/weather" or "packages/weather"
		const matchingDir = fullFiles.find(
			(f) =>
				f.type === "tree" &&
				(f.path === skillName || f.path.endsWith(`/${skillName}`)),
		);

		if (matchingDir) {
			targetPath = matchingDir.path;
			// Filter files that are INSIDE this directory
			targetFiles = fullFiles.filter((f) =>
				f.path.startsWith(`${targetPath}/`),
			);
		} else {
			// Fallback: If strict directory not found, try fuzzy or just warn
			console.warn(
				`Directory for skill "${skillName}" not found. Falling back to root.`,
			);
			// Optional: throw error if strict mode is desired
			// throw new Error(`Could not find directory for skill: ${skillName}`);
		}
	}

	// Process Structure String
	const structure = formatFileTree(targetFiles, targetPath);

	// 4. Get README (Context Aware)
	let readme = "";
	try {
		// If targetPath exists, try to fetch README from that path first
		let readmePath = "readme"; // default API endpoint
		let isSubPath = false;

		if (targetPath) {
			// Look for a readme file in the file list for that path
			const readmeFile = targetFiles.find(
				(f) => f.path.toLowerCase() === `${targetPath}/readme.md`,
			);
			if (readmeFile) {
				readmePath = `contents/${readmeFile.path}`;
				isSubPath = true;
			}
		}

		const readmeRes = await fetch(
			`${GITHUB_API_BASE}/repos/${owner}/${repo}/${readmePath}`,
			{ headers },
		);
		if (readmeRes.ok) {
			const readmeJson = await readmeRes.json();
			readme = atob(readmeJson.content);
		} else if (targetPath && !isSubPath) {
			// If sub-directory readme fails/doesn't exist, maybe fallback to root readme?
			// Or just leave empty to encourage analyzing code.
			// Let's try root readme as context backup.
			const rootReadmeRes = await fetch(
				`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
				{ headers },
			);
			if (rootReadmeRes.ok) {
				const rootData = await rootReadmeRes.json();
				readme = `(Root README) \n${atob(rootData.content)}`;
			}
		}
	} catch {
		console.warn("Could not fetch README");
		readme = "No README available.";
	}

	// 5. Try to get package.json (Context Aware)
	let packageJson: string | undefined;
	try {
		let pkgPath = "contents/package.json";
		if (targetPath) {
			pkgPath = `contents/${targetPath}/package.json`;
		}

		const pkgRes = await fetch(
			`${GITHUB_API_BASE}/repos/${owner}/${repo}/${pkgPath}`,
			{ headers },
		);
		if (pkgRes.ok) {
			const pkgData = await pkgRes.json();
			packageJson = atob(pkgData.content);
		}
	} catch {
		// Ignore if not found
	}

	return {
		info,
		readme,
		structure,
		packageJson,
		subPath: targetPath,
	};
};
const buildGitHubHeaders = (githubToken?: string): HeadersInit => {
	const headers: HeadersInit = {
		Accept: "application/vnd.github.v3+json",
	};

	if (githubToken?.trim()) {
		headers.Authorization = `Bearer ${githubToken.trim()}`;
	}

	return headers;
};
