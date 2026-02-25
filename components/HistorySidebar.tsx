import React from 'react';
import { AnalysisReport } from '../types';

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
  toggleSidebar
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-stone-900/20 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-[#F2F2F0] dark:bg-[#202023] border-r border-stone-200 dark:border-stone-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full font-sans">
          <div className="p-6">
            <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-700 dark:bg-stone-300"></span>
              SkillSynapse
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 pl-4">智能代码分析工具</p>
          </div>

          <div className="px-4 mb-2">
            <button 
              onClick={() => {
                onNewAnalysis();
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className="w-full py-2.5 px-4 bg-white dark:bg-[#2c2c2f] hover:bg-stone-50 dark:hover:bg-[#3f3f42] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700/50 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              新建分析
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 mt-4">
            <h3 className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3 ml-1">历史记录</h3>
            
            {reports.length === 0 && (
              <div className="text-center text-stone-400 dark:text-stone-600 text-xs py-8">
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
                className={`w-full text-left p-2.5 rounded-md text-sm transition-all group relative ${
                  currentReportId === report.id 
                    ? 'bg-white dark:bg-[#2c2c2f] text-stone-900 dark:text-stone-100 shadow-sm ring-1 ring-stone-200 dark:ring-0' 
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-[#2c2c2f]/50 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <div className="font-normal truncate flex items-center gap-1.5">
                  <span className="truncate">{report.repoName}</span>
                </div>
                {report.skillName && (
                    <div className="text-[10px] text-blue-500 dark:text-blue-400 font-medium truncate mt-0.5">
                       ↳ {report.skillName}
                    </div>
                )}
                <div className="text-[10px] text-stone-400 dark:text-stone-600 mt-1 flex justify-between items-center">
                  <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                  {report.status === 'loading' && <span className="text-amber-600 dark:text-amber-500/80">分析中...</span>}
                  {report.status === 'error' && <span className="text-red-600 dark:text-red-500/80">失败</span>}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-stone-200 dark:border-stone-800">
             <div className="text-[10px] text-stone-400 dark:text-stone-600 text-center font-mono">
               Powered by Gemini 2.0
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;