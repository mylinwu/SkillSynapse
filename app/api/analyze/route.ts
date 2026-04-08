import { NextResponse } from "next/server";
import { generateSkillAnalysis } from "../../../services/server/aiService";
import {
	fetchRepoContext,
	parseGitHubUrl,
} from "../../../services/server/githubService";

export const maxDuration = 180;

interface AnalyzePayload {
	repoUrl?: string;
	skillName?: string;
	apiKey?: string;
	githubToken?: string;
	model?: string;
	customPrompt?: string;
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as AnalyzePayload;
		if (!body.repoUrl?.trim()) {
			return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
		}

		const parsed = parseGitHubUrl(body.repoUrl);
		if (!parsed) {
			return NextResponse.json(
				{ error: "Invalid GitHub repository URL" },
				{ status: 400 },
			);
		}

		const context = await fetchRepoContext(
			parsed.owner,
			parsed.repo,
			body.skillName,
			body.githubToken,
		);
		const markdown = await generateSkillAnalysis(
			context,
			body.apiKey,
			body.model,
			body.customPrompt,
		);

		return NextResponse.json({ markdown });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to analyze repository";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
