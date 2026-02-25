import { MessageSquare, Plus } from "lucide-react";
import type React from "react";
import type { AnalysisReport } from "../types";

interface HistorySidebarProps {
	reports: AnalysisReport[];
	currentReportId: string | null;
	onSelectReport: (report: AnalysisReport) => void;
	onNewAnalysis: () => void;
	isOpen: boolean;
	toggleSidebar: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
	reports,
	currentReportId,
	onSelectReport,
	onNewAnalysis,
	isOpen,
	toggleSidebar,
}) => {
	return (
		<>
			{/* Mobile Overlay */}
			<div
				className={`fixed inset-0 z-20 bg-stone-900/20 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
				onClick={toggleSidebar}
			/>

			{/* Sidebar Panel */}
			<aside
				className={`fixed top-0 left-0 z-30 h-full w-[260px] bg-[#f9f9f9] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex flex-col h-full font-sans pt-3 px-3">
					<div className="mb-4 mt-1 px-2 flex items-center justify-between">
						<h1 className="text-base font-semibold text-stone-800 tracking-tight flex items-center gap-2">
							SkillSynapse
						</h1>
					</div>

					<div className="mb-4">
						<button
							onClick={() => {
								onNewAnalysis();
								if (window.innerWidth < 1024) toggleSidebar();
							}}
							className="w-full py-2 px-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-lg font-medium text-sm transition-all flex items-center justify-between shadow-sm"
						>
							<span className="flex items-center gap-2">
								<span className="bg-stone-100 p-1 rounded-md">
									<Plus className="w-4 h-4" />
								</span>
								新建分析
							</span>
						</button>
					</div>

					<div className="flex-1 overflow-y-auto pb-4 space-y-1 mt-2 -mx-1 px-1 custom-scrollbar">
						<h3 className="text-xs font-medium text-stone-500 mb-2 ml-2">
							最近记录
						</h3>

						{reports.length === 0 && (
							<div className="text-center text-stone-400 text-xs py-8">
								暂无分析报告
							</div>
						)}

						{reports.map((report) => (
							<button
								key={report.id}
								onClick={() => {
									onSelectReport(report);
									if (window.innerWidth < 1024) toggleSidebar();
								}}
								className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group flex items-start gap-3 ${
									currentReportId === report.id
										? "bg-white text-stone-900 shadow-sm border border-stone-200/60"
										: "text-stone-600 hover:bg-stone-200/50 border border-transparent"
								}`}
							>
								<MessageSquare className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate text-stone-800">
										{report.repoName}
									</div>
									{report.skillName && (
										<div className="text-xs text-stone-500 truncate mt-0.5">
											{report.skillName}
										</div>
									)}
								</div>
							</button>
						))}
					</div>
				</div>
			</aside>
		</>
	);
};

export default HistorySidebar;
