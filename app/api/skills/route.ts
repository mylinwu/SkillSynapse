import { NextResponse } from "next/server";
import {
	fetchRepoSkills,
	parseGitHubUrl,
	resolveSkillPathForHotItem,
} from "../../../services/server/githubService";

export const maxDuration = 120;

interface SkillsPayload {
	repoUrl?: string;
	hotSkillName?: string;
	githubToken?: string;
	mode?: "list" | "resolve";
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as SkillsPayload;
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

		if (body.mode === "resolve") {
			if (!body.hotSkillName?.trim()) {
				return NextResponse.json(
					{ error: "hotSkillName is required in resolve mode" },
					{ status: 400 },
				);
			}
			const resolved = await resolveSkillPathForHotItem(
				parsed.owner,
				parsed.repo,
				body.hotSkillName,
				body.githubToken,
			);
			return NextResponse.json(resolved);
		}

		const skills = await fetchRepoSkills(
			parsed.owner,
			parsed.repo,
			body.githubToken,
		);
		return NextResponse.json({ skills });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch repository skills";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
