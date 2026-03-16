import { Check, Eye, EyeOff, Settings as SettingsIcon, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	ANALYSIS_PROMPT_PLACEHOLDERS,
	DEFAULT_ANALYSIS_PROMPT_TEMPLATE,
} from "../services/promptTemplate";
import type { Settings } from "../hooks/useSettings";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	settings: Settings;
	onSave: (settings: Partial<Settings>) => void;
}

const DEFAULT_MODELS = [
	{ id: "openrouter/free", name: "OpenrouterFree", provider: "OpenAI" },
];

interface OpenRouterModel {
	id: string;
	name: string;
	architecture?: {
		provider?: string;
	};
}

interface OpenRouterModelsResponse {
	data?: OpenRouterModel[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	settings,
	onSave,
}) => {
	const [apiKey, setApiKey] = useState(settings.apiKey);
	const [showApiKey, setShowApiKey] = useState(false);
	const [githubToken, setGitHubToken] = useState(settings.githubToken);
	const [showGitHubToken, setShowGitHubToken] = useState(false);
	const [model, setModel] = useState(settings.model);
	const [fontFamily, setFontFamily] = useState(settings.fontFamily);
	const [customCss, setCustomCss] = useState(settings.customCss);
	const [customPrompt, setCustomPrompt] = useState(settings.customPrompt);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [availableModels, setAvailableModels] = useState(DEFAULT_MODELS);
	const [isLoadingModels, setIsLoadingModels] = useState(false);

	useEffect(() => {
		const fetchModels = async () => {
			setIsLoadingModels(true);
			try {
				const response = await fetch("https://openrouter.ai/api/v1/models");
				const data = (await response.json()) as OpenRouterModelsResponse;
				if (data.data) {
					const models = data.data.map((m) => ({
						id: m.id,
						name: m.name,
						provider:
							m.architecture?.provider || m.id.split("/")[0] || "Unknown",
					}));
					setAvailableModels(models);
				}
			} catch (error) {
				console.error("Failed to fetch models:", error);
			} finally {
				setIsLoadingModels(false);
			}
		};

		if (isOpen && availableModels.length === DEFAULT_MODELS.length) {
			fetchModels();
		}
	}, [isOpen, availableModels.length]);

	useEffect(() => {
		setApiKey(settings.apiKey);
		setModel(settings.model);
		setGitHubToken(settings.githubToken);
		setFontFamily(settings.fontFamily);
		setCustomCss(settings.customCss);
		setCustomPrompt(settings.customPrompt);
	}, [settings]);

	if (!isOpen) return null;

	const handleSave = () => {
		onSave({
			apiKey,
			githubToken,
			model,
			fontFamily: fontFamily.trim() || settings.fontFamily,
			customCss: customCss.trim() || settings.customCss,
			customPrompt: customPrompt.trim() || DEFAULT_ANALYSIS_PROMPT_TEMPLATE,
		});
		onClose();
	};

	const filteredModels = availableModels.filter(
		(m: { id: string; name: string; provider: string }) =>
			m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			m.provider.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const selectedModelInfo = availableModels.find(
		(m: { id: string; name: string; provider: string }) => m.id === model,
	) || {
		id: model,
		name: model,
		provider: "Custom",
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-[80vw] flex flex-col h-[80vh] max-h-[85vh] relative overflow-visible">
				<div className="flex items-center justify-between p-6 border-b border-stone-100">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-stone-100 rounded-lg">
							<SettingsIcon className="w-5 h-5 text-stone-600" />
						</div>
						<h2 className="text-xl font-semibold text-stone-800">设置</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
					<div className="space-y-3">
						<label className="block text-sm font-medium text-stone-700">
							OpenRouter API Key
						</label>
						<div className="relative">
							<input
								type={showApiKey ? "text" : "password"}
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="sk-or-v1-..."
								className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl pl-4 pr-12 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-sm"
							/>
							<button
								type="button"
								onClick={() => setShowApiKey((prev) => !prev)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
								aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
							>
								{showApiKey ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
						<p className="text-xs text-stone-500">
							您的 API Key 将只保存在本地浏览器中，不会上传到服务器。
						</p>
					</div>

					<div className="space-y-3">
						<label className="block text-sm font-medium text-stone-700">
							GitHub Token (可选)
						</label>
						<div className="relative">
							<input
								type={showGitHubToken ? "text" : "password"}
								value={githubToken}
								onChange={(e) => setGitHubToken(e.target.value)}
								placeholder="ghp_xxx 或 github_pat_xxx"
								className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl pl-4 pr-12 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-sm"
							/>
							<button
								type="button"
								onClick={() => setShowGitHubToken((prev) => !prev)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
								aria-label={
									showGitHubToken ? "隐藏 GitHub Token" : "显示 GitHub Token"
								}
							>
								{showGitHubToken ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
						<p className="text-xs text-stone-500">
							用于提升 GitHub API 额度（避免 rate
							limit），同样仅保存在本地浏览器。
						</p>
					</div>

					<div className="space-y-3 relative">
						<label className="block text-sm font-medium text-stone-700">
							AI 模型选择
						</label>

						<div className="relative">
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="w-full flex items-center justify-between bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-4 py-3 text-sm text-stone-900 transition-all text-left shadow-sm hover:bg-stone-100"
							>
								<div className="flex flex-col">
									<span className="font-medium text-base">
										{selectedModelInfo.name}
									</span>
									<span className="text-xs text-stone-500 mt-0.5">
										{selectedModelInfo.id}
									</span>
								</div>
								<span
									className={`text-stone-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
								>
									▼
								</span>
							</button>

							{isDropdownOpen && (
								<>
									<div
										className="fixed inset-0 z-40"
										onClick={() => setIsDropdownOpen(false)}
									/>
									<div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] z-50 flex flex-col h-[300px]">
										<div className="p-3 border-b border-stone-100 bg-stone-50 rounded-t-xl">
											<input
												type="text"
												placeholder="搜索模型..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-400 shadow-sm"
												onClick={(e) => e.stopPropagation()}
											/>
										</div>
										<div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
											{isLoadingModels ? (
												<div className="p-6 text-center text-sm text-stone-500 flex flex-col items-center justify-center gap-3 h-full">
													<div className="w-6 h-6 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
													正在加载模型列表...
												</div>
											) : filteredModels.length > 0 ? (
												filteredModels.map(
													(m: {
														id: string;
														name: string;
														provider: string;
													}) => (
														<button
															key={m.id}
															className={
																"w-full text-left px-4 py-3 rounded-lg flex items-center justify-between hover:bg-stone-50 transition-colors mb-1 " +
																(m.id === model ? "bg-stone-100" : "")
															}
															onClick={() => {
																setModel(m.id);
																setIsDropdownOpen(false);
																setSearchQuery("");
															}}
														>
															<div>
																<div className="text-sm font-medium text-stone-900">
																	{m.name}
																</div>
																<div className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
																	<span className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-medium">
																		{m.provider}
																	</span>
																	{m.id}
																</div>
															</div>
															{m.id === model && (
																<Check className="w-5 h-5 text-stone-800" />
															)}
														</button>
													),
												)
											) : (
												<div className="p-6 text-center text-sm text-stone-500 flex items-center justify-center h-full">
													未找到匹配的模型
												</div>
											)}

											{searchQuery &&
												!filteredModels.find(
													(m: { id: string; name: string; provider: string }) =>
														m.id === searchQuery,
												) && (
													<button
														className="w-full text-left px-4 py-3 mt-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
														onClick={() => {
															setModel(searchQuery);
															setIsDropdownOpen(false);
														}}
													>
														<div className="text-sm font-medium text-blue-600">
															使用自定义模型 ID: "{searchQuery}"
														</div>
													</button>
												)}
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="block text-sm font-medium text-stone-700">
								报告分析提示词
							</label>
							<button
								type="button"
								onClick={() =>
									setCustomPrompt(DEFAULT_ANALYSIS_PROMPT_TEMPLATE)
								}
								className="text-xs font-medium text-stone-600 hover:text-stone-800 underline underline-offset-2"
							>
								重置为默认模板
							</button>
						</div>
						<textarea
							value={customPrompt}
							onChange={(e) => setCustomPrompt(e.target.value)}
							placeholder="可使用下方占位符动态注入仓库上下文"
							className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-sm min-h-56 font-mono"
							spellCheck={false}
						/>
						<div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
							<p className="text-xs font-medium text-stone-600">可用占位符</p>
							<div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1.5">
								{ANALYSIS_PROMPT_PLACEHOLDERS.map((item) => (
									<div key={item.key} className="text-xs text-stone-600">
										<code className="font-mono text-stone-800">{item.key}</code>
										：{item.description}
									</div>
								))}
							</div>
						</div>
						<p className="text-xs text-stone-500">
							保存分析时会自动替换占位符。默认已内置兜底模板；若清空此项，保存时会自动回退到默认模板。
						</p>
					</div>

					<div className="space-y-3">
						<label className="block text-sm font-medium text-stone-700">
							报告字体设置
						</label>
						<input
							type="text"
							value={fontFamily}
							onChange={(e) => setFontFamily(e.target.value)}
							placeholder='例如: "Microsoft YaHei", sans-serif'
							className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-sm"
						/>
						<p className="text-xs text-stone-500">
							支持 CSS font-family 格式，多种字体请用逗号分隔。
						</p>
					</div>

					<div className="space-y-3">
						<label className="block text-sm font-medium text-stone-700">
							报告自定义 CSS
						</label>
						<textarea
							value={customCss}
							onChange={(e) => setCustomCss(e.target.value)}
							className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-sm min-h-56 font-mono"
							spellCheck={false}
						/>
						<p className="text-xs text-stone-500">
							可覆盖报告区域的预设 class，留空时将回退默认模板。
						</p>
					</div>
				</div>

				<div className="p-5 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-xl transition-colors"
					>
						取消
					</button>
					<button
						onClick={handleSave}
						className="px-6 py-2.5 text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 rounded-xl transition-colors shadow-sm"
					>
						保存设置
					</button>
				</div>
			</div>
		</div>
	);
};
