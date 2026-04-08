import { parseGitHubUrl } from "./githubService";

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

export const fetchRepoSkills = async (
	url: string,
	githubToken?: string,
): Promise<DiscoveredSkill[]> => {
	if (!parseGitHubUrl(url)) {
		throw new Error("Invalid GitHub URL");
	}

	const res = await fetch("/api/skills", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ repoUrl: url, githubToken, mode: "list" }),
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || "Failed to fetch repository skills");
	}

	return data.skills || [];
};

export const resolveSkillPathForHotItem = async (
	repoUrl: string,
	hotSkillName: string,
	githubToken?: string,
): Promise<HotSkillResolutionResult> => {
	const res = await fetch("/api/skills", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			repoUrl,
			hotSkillName,
			githubToken,
			mode: "resolve",
		}),
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || "Failed to resolve skill path");
	}

	return data;
};
