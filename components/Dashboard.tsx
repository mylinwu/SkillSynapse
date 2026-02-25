"use client";

import { ArrowUp } from "lucide-react";
import type React from "react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Grid } from "react-window";
import type { SkillFeedItem } from "../types";

interface DashboardProps {
	hotSkills: SkillFeedItem[];
	isLoadingSkills: boolean;
	onRefreshSkills: () => void;
	onAnalyze: (url: string) => void;
	inputUrl: string;
	setInputUrl: (val: string) => void;
	inputSkillName: string;
	setInputSkillName: (val: string) => void;
	onAnalyzeClick: () => void;
	isProcessing: boolean;
}

interface CellData {
	items: SkillFeedItem[];
	columnCount: number;
	onAnalyze: (url: string) => void;
}

type CellComponentProps = {
	columnIndex: number;
	rowIndex: number;
	style: React.CSSProperties;
	ariaAttributes: {
		"aria-colindex": number;
		role: "gridcell";
	};
} & CellData;

const Cell = ({
	columnIndex,
	rowIndex,
	style,
	items,
	columnCount,
	onAnalyze,
	ariaAttributes,
}: CellComponentProps): React.ReactElement | null => {
	const index = rowIndex * columnCount + columnIndex;

	if (index >= items.length) {
		return null;
	}

	const skill = items[index];

	return (
		<div style={style} className="p-1.5" {...ariaAttributes}>
			<button
				onClick={() => onAnalyze(skill.url)}
				className="group w-full h-full flex flex-col text-left p-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
			>
				<div className="flex items-center justify-between w-full mb-1">
					<h4 className="font-semibold text-sm text-stone-800 truncate pr-2 group-hover:text-blue-600 transition-colors">
						{skill.name}
					</h4>
				</div>
				<p className="text-xs text-stone-500 line-clamp-2 leading-relaxed flex-1">
					{skill.description}
				</p>
			</button>
		</div>
	);
};

const Dashboard: React.FC<DashboardProps> = ({
	hotSkills,
	isLoadingSkills,
	onRefreshSkills,
	onAnalyze,
	inputUrl,
	setInputUrl,
	inputSkillName,
	setInputSkillName,
	onAnalyzeClick,
	isProcessing,
}) => {
	return (
		<div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 md:px-8 py-10">
			<div className="flex-1 flex flex-col justify-center items-center">
				<h2 className="text-3xl font-semibold text-stone-800 mb-8">
					有什么可以帮忙的？
				</h2>

				<div className="w-full max-w-3xl relative flex flex-col gap-2 bg-[#f4f4f4] rounded-2xl p-3 border border-stone-200/60 shadow-sm focus-within:ring-2 focus-within:ring-stone-200 transition-all">
					<input
						type="text"
						placeholder="输入 GitHub 仓库 URL (例如: owner/repo)"
						className="w-full bg-transparent border-none text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-0 px-2 py-2"
						value={inputUrl}
						onChange={(e) => setInputUrl(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onAnalyzeClick()}
					/>

					<div className="flex items-center justify-between mt-2 px-2">
						<input
							type="text"
							placeholder="Skill 目录名称 (可选)"
							className="w-1/3 bg-white border border-stone-200 focus:border-stone-300 rounded-lg px-3 py-1.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none transition-all shadow-sm"
							value={inputSkillName}
							onChange={(e) => setInputSkillName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && onAnalyzeClick()}
							title="输入仓库中的子目录名称（例如: packages/skill-name）以聚焦分析"
						/>

						<button
							onClick={onAnalyzeClick}
							disabled={isProcessing || !inputUrl}
							className={`p-2 rounded-xl flex items-center justify-center transition-all ${
								inputUrl && !isProcessing
									? "bg-black text-white hover:bg-stone-800 shadow-sm"
									: "bg-stone-200 text-stone-400 cursor-not-allowed"
							}`}
						>
							<ArrowUp className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>

			{/* Popular Skills Section */}
			<div className="h-[300px] flex flex-col w-full mt-12">
				<div className="flex items-center justify-between mb-4 px-2">
					<h3 className="text-sm font-medium text-stone-600">探索热门 Skill</h3>
					<button
						onClick={onRefreshSkills}
						disabled={isLoadingSkills}
						className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-50 font-medium"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={`h-3.5 w-3.5 ${isLoadingSkills ? "animate-spin" : ""}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.058M20 20v-5h-.058M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
							/>
						</svg>
						换一换
					</button>
				</div>

				{hotSkills.length === 0 && !isLoadingSkills ? (
					<div className="text-center py-10 text-stone-400 text-sm bg-stone-50 rounded-xl border border-stone-200">
						暂无推荐数据，请尝试刷新。
					</div>
				) : (
					<div className="flex-1 w-full min-h-0">
						<AutoSizer
							renderProp={({
								height,
								width,
							}: {
								height?: number;
								width?: number;
							}) => {
								if (width === undefined || height === undefined) return null;
								const getColumnCount = (w: number) => {
									if (w < 640) return 1;
									if (w < 1024) return 2;
									return 3;
								};
								const columnCount = getColumnCount(width);
								const safeWidth = width - 12;
								const columnWidth = Math.floor(safeWidth / columnCount);
								const rowHeight = 90;

								return (
									<Grid<CellData>
										className="no-scrollbar"
										columnCount={columnCount}
										columnWidth={columnWidth}
										rowCount={Math.ceil(hotSkills.length / columnCount)}
										rowHeight={rowHeight}
										cellProps={{ items: hotSkills, columnCount, onAnalyze }}
										overscanCount={2}
										style={{
											width,
											height,
											overflowX: "hidden",
											overflowY: "auto",
										}}
										cellComponent={Cell}
									/>
								);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
