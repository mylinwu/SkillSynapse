import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { buildAnalysisPrompt } from "./promptTemplate";
import type { RepoContext } from "../types";
import {
	DEFAULT_ANALYSIS_PROMPT_TEMPLATE,
	renderAnalysisPromptTemplate,
} from "./promptTemplate";

export const generateSkillAnalysis = async (
	context: RepoContext,
	apiKey?: string,
	modelName?: string,
	customPrompt?: string,
): Promise<string> => {
	try {
		const openrouter = createOpenRouter({
			apiKey: apiKey || process.env.NEXT_PUBLIC_DEFAULT_API_KEY,
		});

		let repoUrl = `https://github.com/${context.info.owner}/${context.info.name}`;
		let title = context.info.name;

		if (context.subPath) {
			repoUrl += `/tree/${context.info.defaultBranch}/${context.subPath}`;
			title += ` / ${context.subPath.split("/").pop()}`;
		}

		const promptTemplate =
			customPrompt?.trim() || DEFAULT_ANALYSIS_PROMPT_TEMPLATE;

		const prompt = renderAnalysisPromptTemplate({
			template: promptTemplate,
			repoUrl,
			title,
			context,
		});

		const { text } = await generateText({
			model: openrouter(
				modelName ||
					process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL ||
					"openrouter/free",
			),
			system:
				"你是一个精确、专业的技术分析师。请严格按照用户的模板输出 Markdown 报告，不要添加任何开场白或结束语。使用中文。直接输出最终报告内容，不要输出思考过程。",
			prompt: prompt,
		});

		return text || "无法生成分析报告。";
	} catch (error) {
		console.error("AI API Error:", error);
		throw new Error(
			error instanceof Error ? error.message : "无法连接到 AI 服务。",
		);
	}
};
