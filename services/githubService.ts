import type { SkillFeedItem } from "../types";

const SKILLS_FEED_URL =
	"https://cdn.jsdelivr.net/gh/NeverSight/skills_feed@main/data/skills.json";

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
		if (!res.ok) throw new Error("Failed to load skills feed");
		const data = await res.json();

		let rawItems: Record<string, unknown>[] = [];
		if (data.hot && Array.isArray(data.hot) && data.hot.length > 0) {
			rawItems = data.hot;
		} else if (data.trending && Array.isArray(data.trending) && data.trending.length > 0) {
			rawItems = data.trending;
		} else if (data.allTime && Array.isArray(data.allTime)) {
			rawItems = data.allTime;
		} else if (Array.isArray(data)) {
			rawItems = data;
		}

		return rawItems
			.filter((item) => item.source || item.url)
			.map((item) => {
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
					description:
						(item.description as string) ||
						(item.installs
							? `${(item.installs as number).toLocaleString()} installs`
							: ""),
					tags: [],
				};
			})
			.filter((item) => item.url?.includes("github.com"));
	} catch {
		return [];
	}
};
