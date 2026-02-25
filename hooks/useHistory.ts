import { useState, useEffect } from 'react';
import { AnalysisReport } from '../types';

export function useHistory() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('skillsynapse_history');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('skillsynapse_history', JSON.stringify(reports));
  }, [reports]);

  const addReport = (report: AnalysisReport) => {
    setReports(prev => [report, ...prev]);
  };

  const updateReport = (id: string, updates: Partial<AnalysisReport>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return { reports, addReport, updateReport, removeReport, setReports };
}