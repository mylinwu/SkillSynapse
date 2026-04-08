import type { RepoContext, RepoInfo, TreeItem } from "../../types";

const GITHUB_API_BASE = "https://api.github.com";

const decodeBase64 = (content: string): string =>
	Buffer.from(content, "base64").toString("utf-8");

const buildGitHubHeaders = (githubToken?: string): HeadersInit => {
	const headers: HeadersInit = {
		Accept: "application/vnd.github.v3+json",
	};

	if (githubToken?.trim()) {
		headers.Authorization = `Bearer ${githubToken.trim()}`;
	}

	return headers;
};

const formatFileTree = (items: TreeItem[], subPath?: string): string => {
	let relevantItems = items;
	if (subPath) {
		const prefix = subPath.endsWith("/") ? subPath : `${subPath}/`;
		relevantItems = items.filter(
			(item) => item.path.startsWith(prefix) || item.path === subPath,
		);

		relevantItems = relevantItems
			.map((item) => ({
				...item,
				path: item.path.replace(prefix, ""),
			}))
			.filter((item) => item.path !== "");
	}

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

	const paths = filtered
		.map((item) => `${item.type === "tree" ? "📁" : "📄"} ${item.path}`)
		.slice(0, 150);

	if (filtered.length > 150) {
		paths.push(`... and ${filtered.length - 150} more files`);
	}

	return paths.join("\n");
};

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

export interface DiscoveredSkill {
	name: string;
	path: string;
	description?: string;
}

export interface HotSkillResolutionResult {
	matchedSkillPath?: string;
	hasMultipleSkills: boolean;
	skills: DiscoveredSkill[];
}

const normalizeSkillToken = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const tryMatchSkillByHotName = (
	hotSkillName: string,
	skills: DiscoveredSkill[],
): DiscoveredSkill | undefined => {
	const token = normalizeSkillToken(hotSkillName);
	if (!token) return undefined;

	const tokenParts = token.split("-").filter(Boolean);

	return skills.find((skill) => {
		const skillNameToken = normalizeSkillToken(skill.name);
		const pathLeafToken = normalizeSkillToken(skill.path.split("/").pop() || "");
		if (skillNameToken === token || pathLeafToken === token) return true;
		if (skillNameToken.includes(token) || pathLeafToken.includes(token)) return true;

		return tokenParts.every(
			(part) => skillNameToken.includes(part) || pathLeafToken.includes(part),
		);
	});
};

export const fetchRepoSkills = async (
	owner: string,
	repo: string,
	githubToken?: string,
): Promise<DiscoveredSkill[]> => {
	const headers = buildGitHubHeaders(githubToken);
	const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
		headers,
	});
	if (!repoRes.ok) {
		if (repoRes.status === 403) {
			throw new Error(
				githubToken
					? "GitHub API rate limit exceeded for this token. Please try another token later."
					: "GitHub API rate limit exceeded. Please add a GitHub Token in Settings, then retry.",
			);
		}
		throw new Error("Failed to fetch repository info");
	}
	const repoJson = await repoRes.json();
	const defaultBranch = repoJson.default_branch;

	const treeRes = await fetch(
		`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
		{ headers },
	);
	if (!treeRes.ok) {
		if (treeRes.status === 403) {
			throw new Error(
				githubToken
					? "GitHub API rate limit exceeded for this token. Please try another token later."
					: "GitHub API rate limit exceeded. Please add a GitHub Token in Settings, then retry.",
			);
		}
		throw new Error("Failed to fetch repository tree");
	}
	const treeJson = await treeRes.json();
	const tree: TreeItem[] = treeJson.tree;

	const skills: DiscoveredSkill[] = [];
	const skillDirs = tree.filter((item) => {
		if (item.type !== "tree") return false;
		const match = item.path.match(/^(?:skills|packages)\/([^/]+)$/i);
		return match !== null;
	});

	for (const dir of skillDirs) {
		const name = dir.path.split("/").pop() || "";
		const pkgItem = tree.find((item) => item.path === `${dir.path}/package.json`);
		let description: string | undefined;

		if (pkgItem) {
			try {
				const pkgRes = await fetch(
					`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${pkgItem.path}`,
					{ headers },
				);
				if (pkgRes.ok) {
					const pkgData = await pkgRes.json();
					const pkgContent = JSON.parse(decodeBase64(pkgData.content));
					description = pkgContent.description;
				}
			} catch {
				// ignore
			}
		}

		skills.push({ name, path: dir.path, description });
	}

	if (skills.length === 0) {
		skills.push({
			name: repo,
			path: "",
			description: repoJson.description || "Root repository",
		});
	}

	return skills;
};

export const resolveSkillPathForHotItem = async (
	owner: string,
	repo: string,
	hotSkillName: string,
	githubToken?: string,
): Promise<HotSkillResolutionResult> => {
	const skills = await fetchRepoSkills(owner, repo, githubToken);
	if (skills.length <= 1) {
		return {
			matchedSkillPath: undefined,
			hasMultipleSkills: false,
			skills,
		};
	}

	const matchedSkill = tryMatchSkillByHotName(hotSkillName, skills);

	return {
		matchedSkillPath: matchedSkill?.path,
		hasMultipleSkills: true,
		skills,
	};
};

export const fetchRepoContext = async (
	owner: string,
	repo: string,
	skillName?: string,
	githubToken?: string,
): Promise<RepoContext> => {
	const headers = buildGitHubHeaders(githubToken);

	const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
		headers,
	});
	if (!repoRes.ok) {
		if (repoRes.status === 404) throw new Error("Repository not found or private.");
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

	let targetPath = "";
	let targetFiles = fullFiles;

	if (skillName && skillName.trim() !== "") {
		const matchingDir = fullFiles.find(
			(f) =>
				f.type === "tree" &&
				(f.path === skillName || f.path.endsWith(`/${skillName}`)),
		);

		if (matchingDir) {
			targetPath = matchingDir.path;
			targetFiles = fullFiles.filter((f) => f.path.startsWith(`${targetPath}/`));
		}
	}

	const structure = formatFileTree(targetFiles, targetPath);

	let readme = "";
	try {
		let readmePath = "readme";
		let isSubPath = false;

		if (targetPath) {
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
			readme = decodeBase64(readmeJson.content);
		} else if (targetPath && !isSubPath) {
			const rootReadmeRes = await fetch(
				`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
				{ headers },
			);
			if (rootReadmeRes.ok) {
				const rootData = await rootReadmeRes.json();
				readme = `(Root README) \n${decodeBase64(rootData.content)}`;
			}
		}
	} catch {
		readme = "No README available.";
	}

	let packageJson: string | undefined;
	try {
		let pkgPath = "contents/package.json";
		if (targetPath) {
			pkgPath = `contents/${targetPath}/package.json`;
		}

		const pkgRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/${pkgPath}`, {
			headers,
		});
		if (pkgRes.ok) {
			const pkgData = await pkgRes.json();
			packageJson = decodeBase64(pkgData.content);
		}
	} catch {
		// ignore
	}

	return {
		info,
		readme,
		structure,
		packageJson,
		subPath: targetPath,
	};
};
