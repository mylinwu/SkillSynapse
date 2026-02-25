import type React from "react";
import type { AnalysisReport } from "../types";
import MarkdownView from "./MarkdownView";

interface ReportContainerProps {
	report: AnalysisReport;
}

const ReportContainer: React.FC<ReportContainerProps> = ({ report }) => {
	return (
		<div className="h-full w-full overflow-y-auto px-4 md:px-8 py-6 scroll-smooth">
			<div className="max-w-3xl mx-auto pb-24 pt-4">
				<div className="mb-10 pb-6 border-b border-stone-200 dark:border-stone-800 flex items-end justify-between">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-serif text-stone-900 dark:text-white tracking-tight">
								{report.repoName}
							</h1>
							{report.skillName && (
								<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
									/{report.skillName}
								</span>
							)}
						</div>
						<a
							href={report.repoUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 text-sm font-mono mt-2 block transition-colors"
						>
							{report.repoUrl} ↗
						</a>
					</div>
					<div className="text-right text-xs text-stone-400 dark:text-stone-600 font-mono">
						{new Date(report.timestamp).toLocaleDateString()}
					</div>
				</div>
				<MarkdownView content={report.markdown} />
			</div>
		</div>
	);
};

export default ReportContainer;
