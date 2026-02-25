import type React from "react";

interface LoadingStateProps {
	skillName?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ skillName }) => {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full">
			<div className="relative w-12 h-12 mb-8">
				<div className="absolute top-0 left-0 w-full h-full border-2 border-stone-200 dark:border-stone-800 rounded-full"></div>
				<div className="absolute top-0 left-0 w-full h-full border-t-2 border-stone-500 dark:border-stone-200 rounded-full animate-spin"></div>
			</div>
			<h2 className="text-xl font-medium text-stone-800 dark:text-stone-200 tracking-tight">
				正在深入分析...
			</h2>
			<p className="mt-3 text-stone-500 text-sm font-light">
				获取上下文信息并生成技术报告
			</p>
			{skillName && (
				<p className="mt-1 text-stone-400 text-xs font-mono bg-stone-100 dark:bg-[#2c2c2f] px-2 py-1 rounded">
					Targeting: {skillName}
				</p>
			)}
		</div>
	);
};

export default LoadingState;
