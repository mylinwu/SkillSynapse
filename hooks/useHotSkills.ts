import { useState, useEffect, useCallback } from 'react';
import { SkillFeedItem } from '../types';
import { fetchHotSkills } from '../services/githubService';

export function useHotSkills() {
  const [hotSkills, setHotSkills] = useState<SkillFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const skills = await fetchHotSkills();
      if (skills.length > 0) {
        setHotSkills(skills);
        localStorage.setItem('skillsynapse_hot_skills', JSON.stringify(skills));
      }
    } catch (e) {
      console.error("Failed to refresh skills", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadSkills = async () => {
      const savedSkills = localStorage.getItem('skillsynapse_hot_skills');
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHotSkills(parsed);
            return;
          }
        } catch (e) {
          console.warn("Invalid cached skills, refetching...");
        }
      }
      await refreshSkills();
    };
    loadSkills();
  }, [refreshSkills]);

  return { hotSkills, isLoading, refreshSkills };
}