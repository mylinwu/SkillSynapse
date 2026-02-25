import { useCallback, useEffect, useState } from "react";
import { fetchHotSkills } from "../services/githubService";
import type { SkillFeedItem } from "../types";

export function useHotSkills() {
	const [hotSkills, setHotSkills] = useState<SkillFeedItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const refreshSkills = useCallback(async () => {
		setIsLoading(true);
		try {
			const skills = await fetchHotSkills();
			if (skills.length > 0) {
				setHotSkills(skills);
				localStorage.setItem("skillsynapse_hot_skills", JSON.stringify(skills));
			}
		} catch {
			// fallback to mock data or empty on error
			setHotSkills([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const loadSkills = async () => {
			const savedSkills = localStorage.getItem("skillsynapse_hot_skills");
			if (savedSkills) {
				try {
					const parsed = JSON.parse(savedSkills);
					if (Array.isArray(parsed) && parsed.length > 0) {
						setHotSkills(parsed);
						return;
					}
				} catch {
					console.warn("Invalid cached skills, refetching...");
				}
			}
			await refreshSkills();
		};
		loadSkills();
	}, [refreshSkills]);

	return { hotSkills, isLoading, refreshSkills };
}
