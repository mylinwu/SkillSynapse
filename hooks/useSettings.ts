import { useEffect, useState } from "react";

export interface Settings {
	apiKey: string;
	model: string;
}

export function useSettings() {
	const [settings, setSettings] = useState<Settings>({
		apiKey: "",
		model: "",
	});

	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// Load from localStorage on mount
		const savedApiKey = localStorage.getItem("skill_synapse_api_key");
		const savedModel = localStorage.getItem("skill_synapse_model");

		const defaultModel =
			process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL || "google/gemini-2.5-pro";

		const initialSettings = {
			apiKey: savedApiKey || process.env.NEXT_PUBLIC_DEFAULT_API_KEY || "",
			model: savedModel || defaultModel,
		};

		// Use a small timeout to avoid synchronous setState warning in effect
		const timer = setTimeout(() => {
			setSettings(initialSettings);
			setIsLoaded(true);
		}, 0);

		return () => clearTimeout(timer);
	}, []);

	const updateSettings = (newSettings: Partial<Settings>) => {
		const updated = { ...settings, ...newSettings };
		setSettings(updated);

		if (newSettings.apiKey !== undefined) {
			localStorage.setItem("skill_synapse_api_key", newSettings.apiKey);
		}

		if (newSettings.model !== undefined) {
			localStorage.setItem("skill_synapse_model", newSettings.model);
		}
	};

	return { settings, updateSettings, isLoaded };
}
