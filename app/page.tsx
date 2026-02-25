"use client";

import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import ErrorState from "../components/ErrorState";
// Components
import Header from "../components/Header";
import HistorySidebar from "../components/HistorySidebar";
import LoadingState from "../components/LoadingState";
import ReportContainer from "../components/ReportContainer";
import { SettingsModal } from "../components/SettingsModal";
// Hooks
import { useHistory } from "../hooks/useHistory";
import { useHotSkills } from "../hooks/useHotSkills";
import { useSettings } from "../hooks/useSettings";
import { generateSkillAnalysis } from "../services/aiService";
import { fetchRepoContext, parseGitHubUrl } from "../services/githubService";
import type { AnalysisReport } from "../types";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Home() {
	const { reports, addReport, updateReport, removeReport } = useHistory();
	const {
		hotSkills,
		isLoading: isLoadingSkills,
		refreshSkills,
	} = useHotSkills();
	const { settings, updateSettings, isLoaded } = useSettings();

	const [currentReportId, setCurrentReportId] = useState<string | null>(null);
	const [inputUrl, setInputUrl] = useState("");
	const [inputSkillName, setInputSkillName] = useState("");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleAnalyze = async (urlOverride?: string) => {
		const targetUrl = urlOverride || inputUrl;
		const targetSkill = urlOverride ? undefined : inputSkillName;

		if (!targetUrl.trim()) return;

		const parsed = parseGitHubUrl(targetUrl);
		if (!parsed) {
			alert("请输入有效的 GitHub URL (例如: https://github.com/owner/repo)");
			return;
		}

		const { owner, repo } = parsed;
		const newId = generateId();

		// Create optimistic report entry
		const newReport: AnalysisReport = {
			id: newId,
			repoUrl: targetUrl,
			repoName: `${owner}/${repo}`,
			skillName: targetSkill,
			timestamp: Date.now(),
			markdown: "",
			status: "loading",
		};

		addReport(newReport);
		setCurrentReportId(newId);

		if (!urlOverride) {
			setInputUrl("");
			setInputSkillName("");
		}

		setIsProcessing(true);

		try {
			// 1. Fetch Repo Context (with optional skillName)
			const context = await fetchRepoContext(owner, repo, targetSkill);

			// 2. Generate Analysis with AI using settings
			const markdown = await generateSkillAnalysis(
				context,
				settings.apiKey,
				settings.model,
			);

			// 3. Update Report
			updateReport(newId, { status: "success", markdown });
		} catch (error) {
			console.error(error);
			updateReport(newId, {
				status: "error",
				errorMessage: error instanceof Error ? error.message : "发生未知错误",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const activeReport = reports.find((r) => r.id === currentReportId);

	const renderContent = () => {
		if (!isLoaded || !mounted) {
			return (
				<div className="flex-1 flex items-center justify-center text-stone-500">
					加载中...
				</div>
			);
		}

		if (!activeReport) {
			return (
				<Dashboard
					hotSkills={hotSkills}
					isLoadingSkills={isLoadingSkills}
					onRefreshSkills={refreshSkills}
					onAnalyze={handleAnalyze}
					inputUrl={inputUrl}
					setInputUrl={setInputUrl}
					inputSkillName={inputSkillName}
					setInputSkillName={setInputSkillName}
					onAnalyzeClick={() => handleAnalyze()}
					isProcessing={isProcessing}
				/>
			);
		}

		if (activeReport.status === "loading") {
			return <LoadingState skillName={activeReport.skillName} />;
		}

		if (activeReport.status === "error") {
			return (
				<ErrorState
					message={activeReport.errorMessage || "未知错误"}
					onClose={() => removeReport(activeReport.id)}
				/>
			);
		}

		return <ReportContainer report={activeReport} />;
	};

	if (!mounted) {
		return null; // Avoid hydration mismatch by not rendering anything on the server
	}

	return (
		<div className="flex h-screen overflow-hidden bg-[#f9f9f9] text-stone-800 font-sans">
			<HistorySidebar
				reports={reports}
				currentReportId={currentReportId}
				onSelectReport={(r) => setCurrentReportId(r.id)}
				onNewAnalysis={() => setCurrentReportId(null)}
				isOpen={isSidebarOpen}
				toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
			/>

			<div className="flex-1 flex flex-col h-full overflow-hidden w-full relative bg-white m-2 ml-0 rounded-2xl shadow-sm border border-stone-200/50">
				<Header
					toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
					onOpenSettings={() => setIsSettingsOpen(true)}
				/>

				<main className="flex-1 flex flex-col overflow-hidden relative">
					{renderContent()}
				</main>
			</div>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				settings={settings}
				onSave={updateSettings}
			/>
		</div>
	);
}
