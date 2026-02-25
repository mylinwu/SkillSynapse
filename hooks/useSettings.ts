import { useEffect, useState } from "react";

export interface Settings {
	apiKey: string;
	model: string;
	fontFamily: string;
}

export function useSettings() {
	const [settings, setSettings] = useState<Settings>({
		apiKey: "",
		model: "",
		fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
	});

	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// Load from localStorage on mount
		const savedApiKey = localStorage.getItem("skill_synapse_api_key");
		const savedModel = localStorage.getItem("skill_synapse_model");
		const savedFontFamily = localStorage.getItem("skill_synapse_font_family");

		const defaultModel =
			process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL || "openrouter/free";
		const defaultFontFamily = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

		const initialSettings = {
			apiKey: savedApiKey || process.env.NEXT_PUBLIC_DEFAULT_API_KEY || "",
			model: savedModel || defaultModel,
			fontFamily: savedFontFamily || defaultFontFamily,
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

		if (newSettings.fontFamily !== undefined) {
			localStorage.setItem("skill_synapse_font_family", newSettings.fontFamily);
		}

		if (newSettings.model !== undefined) {
			localStorage.setItem("skill_synapse_model", newSettings.model);
		}
	};

	return { settings, updateSettings, isLoaded };
}
