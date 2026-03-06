import { useEffect, useState } from "react";

export interface Settings {
	apiKey: string;
	githubToken: string;
	model: string;
	fontFamily: string;
	customCss: string;
}

const DEFAULT_REPORT_CUSTOM_CSS = `.ss-report-root {}

.ss-report-content {}

.ss-report-header {}

.ss-report-title {}

.ss-report-skill-tag {}

.ss-report-repo-link {}

.ss-report-timestamp {}

.ss-markdown-root {}

.ss-md-h1 {}

.ss-md-h2 {}

.ss-md-h3 {}

.ss-md-p {}

.ss-md-ul {}

.ss-md-ol {}

.ss-md-li {}

.ss-md-blockquote {}

.ss-md-a {}

.ss-md-pre-wrap {}

.ss-md-pre {}

.ss-md-code-inline {}

.ss-md-code-block {}`;

export function useSettings() {
	const [settings, setSettings] = useState<Settings>({
		apiKey: "",
		githubToken: "",
		model: "",
		fontFamily:
			'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
		customCss: DEFAULT_REPORT_CUSTOM_CSS,
	});

	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// Load from localStorage on mount
		const savedApiKey = localStorage.getItem("skill_synapse_api_key");
		const savedModel = localStorage.getItem("skill_synapse_model");
		const savedGitHubToken = localStorage.getItem("skill_synapse_github_token");
		const savedFontFamily = localStorage.getItem("skill_synapse_font_family");
		const savedCustomCss = localStorage.getItem("skill_synapse_custom_css");

		const defaultModel =
			process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL || "openrouter/free";
		const defaultFontFamily =
			'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

		const initialSettings = {
			apiKey: savedApiKey || process.env.NEXT_PUBLIC_DEFAULT_API_KEY || "",
			githubToken:
				savedGitHubToken || process.env.NEXT_PUBLIC_DEFAULT_GITHUB_TOKEN || "",
			model: savedModel || defaultModel,
			fontFamily: savedFontFamily || defaultFontFamily,
			customCss: savedCustomCss || DEFAULT_REPORT_CUSTOM_CSS,
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

		if (newSettings.githubToken !== undefined) {
			localStorage.setItem(
				"skill_synapse_github_token",
				newSettings.githubToken,
			);
		}

		if (newSettings.model !== undefined) {
			localStorage.setItem("skill_synapse_model", newSettings.model);
		}

		if (newSettings.customCss !== undefined) {
			localStorage.setItem("skill_synapse_custom_css", newSettings.customCss);
		}
	};

	return { settings, updateSettings, isLoaded };
}
