import { useEffect, useState } from "react";
import type { AnalysisReport } from "../types";

export function useHistory() {
	const [reports, setReports] = useState<AnalysisReport[]>([]);

	useEffect(() => {
		const saved = localStorage.getItem("skill_synapse_history");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				const timer = setTimeout(() => setReports(parsed), 0);
				return () => clearTimeout(timer);
			} catch (e) {
				console.error("Failed to parse history", e);
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("skillsynapse_history", JSON.stringify(reports));
	}, [reports]);

	const addReport = (report: AnalysisReport) => {
		setReports((prev) => [report, ...prev]);
	};

	const updateReport = (id: string, updates: Partial<AnalysisReport>) => {
		setReports((prev) =>
			prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
		);
	};

	const removeReport = (id: string) => {
		setReports((prev) => prev.filter((r) => r.id !== id));
	};

	return { reports, addReport, updateReport, removeReport, setReports };
}
