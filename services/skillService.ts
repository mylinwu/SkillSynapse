import type { TreeItem } from "../types";
import { parseGitHubUrl } from "./githubService";

const GITHUB_API_BASE = "https://api.github.com";

const buildGitHubHeaders = (githubToken?: string): HeadersInit => {
	const headers: HeadersInit = {
		Accept: "application/vnd.github.v3+json",
	};

	if (githubToken?.trim()) {
		headers.Authorization = `Bearer ${githubToken.trim()}`;
	}

	return headers;
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
		const pathLeafToken = normalizeSkillToken(
			skill.path.split("/").pop() || "",
		);
		if (skillNameToken === token || pathLeafToken === token) return true;
		if (skillNameToken.includes(token) || pathLeafToken.includes(token))
			return true;

		return tokenParts.every(
			(part) => skillNameToken.includes(part) || pathLeafToken.includes(part),
		);
	});
};

/**
 * 分析仓库目录结构，找出所有可能的 skills
 * 规则：
 * 1. 查找包含 package.json 且 name 包含 "skill" 或有特定标识的目录
 * 2. 查找特定目录（如 packages/, skills/ 等）下的子目录
 */
export const fetchRepoSkills = async (
	url: string,
	githubToken?: string,
): Promise<DiscoveredSkill[]> => {
	const parsed = parseGitHubUrl(url);
	if (!parsed) {
		throw new Error("Invalid GitHub URL");
	}

	const { owner, repo } = parsed;
	const headers = buildGitHubHeaders(githubToken);

	try {
		// 1. 获取默认分支
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

		// 2. 获取完整的文件树
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

		// 3. 启发式查找 skills
		// 策略 A: 查找 skills/ 或 packages/ 目录下的所有直接子目录
		const skillDirs = tree.filter((item) => {
			if (item.type !== "tree") return false;
			// 匹配 skills/xxx 或 packages/xxx，排除更深层级的目录
			const match = item.path.match(/^(?:skills|packages)\/([^/]+)$/i);
			return match !== null;
		});

		for (const dir of skillDirs) {
			const name = dir.path.split("/").pop() || "";
			// 尝试读取 package.json 获取描述（如果存在）
			const pkgItem = tree.find(
				(item) => item.path === `${dir.path}/package.json`,
			);
			let description: string | undefined;

			if (pkgItem) {
				try {
					const pkgRes = await fetch(
						`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${pkgItem.path}`,
						{ headers },
					);
					if (pkgRes.ok) {
						const pkgData = await pkgRes.json();
						const pkgContent = JSON.parse(atob(pkgData.content));
						description = pkgContent.description;
					}
				} catch (_e) {
					// 忽略错误，继续
				}
			}

			skills.push({
				name,
				path: dir.path,
				description,
			});
		}

		// 如果没有找到任何 skills，可以把根目录作为一个 fallback
		if (skills.length === 0) {
			skills.push({
				name: repo,
				path: "",
				description: repoJson.description || "Root repository",
			});
		}

		return skills;
	} catch (error) {
		console.error("Error fetching repo skills:", error);
		throw error;
	}
};

export const resolveSkillPathForHotItem = async (
	repoUrl: string,
	hotSkillName: string,
	githubToken?: string,
): Promise<HotSkillResolutionResult> => {
	const skills = await fetchRepoSkills(repoUrl, githubToken);
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
