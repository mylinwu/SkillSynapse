"use client";

import { LoaderCircle, X } from "lucide-react";
import type React from "react";
import type { DiscoveredSkill } from "../services/skillService";

interface SkillSelectorModalProps {
	isOpen: boolean;
	onClose: () => void;
	skills: DiscoveredSkill[];
	onSelect: (skillPath: string) => void;
	isLoading: boolean;
}

export const SkillSelectorModal: React.FC<SkillSelectorModalProps> = ({
	isOpen,
	onClose,
	skills,
	onSelect,
	isLoading,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
			<div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
				<div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
					<h3 className="font-semibold text-stone-800 text-lg">
						选择要分析的 Skill
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 text-stone-400 hover:text-stone-600 transition-colors rounded-lg hover:bg-stone-100"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-4 max-h-[60vh] overflow-y-auto bg-stone-50/30">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-12 text-stone-500">
							<LoaderCircle
								className="h-8 w-8 animate-spin text-stone-400 mb-3"
								aria-hidden="true"
							/>
							<p className="text-sm font-medium">正在分析仓库结构...</p>
							<p className="text-xs text-stone-400 mt-1">
								这可能需要几秒钟时间
							</p>
						</div>
					) : skills.length === 0 ? (
						<div className="text-center py-10 text-stone-500 text-sm">
							未在此仓库中找到任何 Skills
						</div>
					) : (
						<div className="grid gap-3">
							{skills.map((skill) => (
								<button
									key={skill.path}
									type="button"
									onClick={() => onSelect(skill.path)}
									className="flex flex-col text-left p-4 bg-white border border-stone-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all group"
								>
									<div className="flex items-center justify-between w-full mb-1">
										<h4 className="font-medium text-stone-800 group-hover:text-blue-600 transition-colors">
											{skill.name}
										</h4>
										<span className="text-xs font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
											{skill.path || "/ (根目录)"}
										</span>
									</div>
									{skill.description ? (
										<p className="text-sm text-stone-500 line-clamp-2 mt-1">
											{skill.description}
										</p>
									) : (
										<p className="text-sm text-stone-400 italic mt-1">
											暂无描述
										</p>
									)}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
