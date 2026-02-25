import React from 'react';

interface HeaderProps {
  inputUrl: string;
  setInputUrl: (val: string) => void;
  inputSkillName: string;
  setInputSkillName: (val: string) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  inputUrl,
  setInputUrl,
  inputSkillName,
  setInputSkillName,
  onAnalyze,
  isProcessing,
  theme,
  toggleTheme,
  toggleSidebar
}) => {
  return (
    <header className="bg-[#FAFAF8]/90 dark:bg-[#1c1917]/90 backdrop-blur-md sticky top-0 z-10 border-b border-stone-200/50 dark:border-stone-800/50 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
        <button 
          className="lg:hidden p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
          onClick={toggleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex-1 flex gap-2 relative group items-stretch h-[42px]">
          {/* Repo URL Input */}
          <div className="relative flex-[2]">
            <input
              type="text"
              placeholder="GitHub URL (e.g. owner/repo)"
              className="w-full h-full bg-white dark:bg-[#2c2c2f] border border-stone-200 dark:border-stone-800 focus:border-stone-300 dark:focus:border-stone-600 rounded-lg pl-4 pr-4 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none transition-all shadow-sm focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-800"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
            />
          </div>

          {/* Skill Name Input (Optional) */}
          <div className="relative flex-[1] hidden md:block">
            <input
              type="text"
              placeholder="Skill (可选)"
              className="w-full h-full bg-white dark:bg-[#2c2c2f] border border-stone-200 dark:border-stone-800 focus:border-stone-300 dark:focus:border-stone-600 rounded-lg pl-4 pr-14 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none transition-all shadow-sm focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-800"
              value={inputSkillName}
              onChange={(e) => setInputSkillName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
              title="输入仓库中的子目录名称（例如: packages/skill-name）以聚焦分析"
            />
          </div>

          <button
            onClick={onAnalyze}
            disabled={isProcessing || !inputUrl}
            className="px-6 py-2.5 bg-stone-800 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium rounded-md transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md hover:shadow-lg border border-transparent dark:border-stone-300/50 whitespace-nowrap h-full flex items-center justify-center active:scale-[0.98]"
          >
            分析
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          title={theme === 'dark' ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;