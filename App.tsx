import React, { useState } from 'react';
import { AnalysisReport } from './types';
import { fetchRepoContext, parseGitHubUrl } from './services/githubService';
import { generateSkillAnalysis } from './services/geminiService';
import HistorySidebar from './components/HistorySidebar';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useHistory } from './hooks/useHistory';
import { useHotSkills } from './hooks/useHotSkills';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ReportContainer from './components/ReportContainer';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { reports, addReport, updateReport, removeReport } = useHistory();
  const { hotSkills, isLoading: isLoadingSkills, refreshSkills } = useHotSkills();
  
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [inputSkillName, setInputSkillName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      markdown: '',
      status: 'loading'
    };

    addReport(newReport);
    setCurrentReportId(newId);
    
    if (!urlOverride) {
      setInputUrl('');
      setInputSkillName('');
    }
    
    setIsProcessing(true);

    try {
      // 1. Fetch Repo Context (with optional skillName)
      const context = await fetchRepoContext(owner, repo, targetSkill);
      
      // 2. Generate Analysis with AI
      const markdown = await generateSkillAnalysis(context);

      // 3. Update Report
      updateReport(newId, { status: 'success', markdown });
    } catch (error: any) {
      console.error(error);
      updateReport(newId, { status: 'error', errorMessage: error.message || "发生未知错误" });
    } finally {
      setIsProcessing(false);
    }
  };

  const activeReport = reports.find(r => r.id === currentReportId);

  const renderContent = () => {
    if (!activeReport) {
      return (
        <Dashboard 
          hotSkills={hotSkills}
          isLoadingSkills={isLoadingSkills}
          onRefreshSkills={refreshSkills}
          onAnalyze={handleAnalyze}
        />
      );
    }

    if (activeReport.status === 'loading') {
      return <LoadingState skillName={activeReport.skillName} />;
    }

    if (activeReport.status === 'error') {
       return (
        <ErrorState 
          message={activeReport.errorMessage || '未知错误'} 
          onClose={() => removeReport(activeReport.id)} 
        />
       );
    }

    return <ReportContainer report={activeReport} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#1c1917] text-stone-800 dark:text-stone-200 font-sans transition-colors duration-300">
      
      <HistorySidebar 
        reports={reports}
        currentReportId={currentReportId}
        onSelectReport={(r) => setCurrentReportId(r.id)}
        onNewAnalysis={() => setCurrentReportId(null)}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative bg-[#FAFAF8] dark:bg-[#1c1917] transition-colors duration-300">
        <Header 
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          inputSkillName={inputSkillName}
          setInputSkillName={setInputSkillName}
          onAnalyze={() => handleAnalyze()}
          isProcessing={isProcessing}
          theme={theme}
          toggleTheme={toggleTheme}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}