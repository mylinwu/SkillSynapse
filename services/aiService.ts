export const generateSkillAnalysis = async (params: {
	repoUrl: string;
	skillName?: string;
	apiKey?: string;
	model?: string;
	customPrompt?: string;
	githubToken?: string;
}): Promise<string> => {
	const res = await fetch("/api/analyze", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || "无法连接到分析服务。");
	}

	return data.markdown || "无法生成分析报告。";
};
