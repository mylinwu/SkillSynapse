import { useCallback, useEffect, useState } from "react";
import { deleteReport, getAllReports, saveReport } from "../services/db";
import type { AnalysisReport } from "../types";

const HISTORY_STORAGE_KEY = "skill_synapse_history";

export function useHistory() {
	const [reports, setReports] = useState<AnalysisReport[]>([]);

	useEffect(() => {
		const initData = async () => {
			try {
				let dbReports = await getAllReports();

				// 如果 IndexedDB 中没有数据，尝试从 localStorage 迁移
				if (dbReports.length === 0) {
					const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
					if (saved) {
						try {
							const parsed = JSON.parse(saved) as AnalysisReport[];
							if (Array.isArray(parsed) && parsed.length > 0) {
								dbReports = parsed;
								// 将旧数据保存到 IndexedDB
								await Promise.all(parsed.map((report) => saveReport(report)));
								// 迁移完成后清理 localStorage
								localStorage.removeItem(HISTORY_STORAGE_KEY);
							}
						} catch (e) {
							console.error("Failed to parse history from localStorage", e);
						}
					}
				}

				// 确保按时间倒序排列
				dbReports.sort((a, b) => b.timestamp - a.timestamp);
				setReports(dbReports);
			} catch (error) {
				console.error("Failed to initialize history data", error);
			}
		};

		initData();
	}, []);

	const addReport = useCallback((report: AnalysisReport) => {
		setReports((prev) => [report, ...prev]);
		saveReport(report).catch(console.error);
	}, []);

	const updateReport = useCallback(
		(id: string, updates: Partial<AnalysisReport>) => {
			setReports((prev) => {
				const newReports = prev.map((r) => {
					if (r.id === id) {
						const updated = { ...r, ...updates };
						saveReport(updated).catch(console.error);
						return updated;
					}
					return r;
				});
				return newReports;
			});
		},
		[],
	);

	const removeReport = useCallback((id: string) => {
		setReports((prev) => prev.filter((r) => r.id !== id));
		deleteReport(id).catch(console.error);
	}, []);

	return { reports, addReport, updateReport, removeReport, setReports };
}
