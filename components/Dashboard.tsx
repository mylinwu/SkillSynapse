import React, { memo } from 'react';
// @ts-ignore
import { FixedSizeGrid as Grid, areEqual } from 'react-window';
// @ts-ignore
import AutoSizerSource from 'react-virtualized-auto-sizer';
import { SkillFeedItem } from '../types';

// Fix: Cast AutoSizer to any to resolve "is not a valid JSX element type" error
const AutoSizer = AutoSizerSource as any;

interface DashboardProps {
  hotSkills: SkillFeedItem[];
  isLoadingSkills: boolean;
  onRefreshSkills: () => void;
  onAnalyze: (url: string) => void;
}

// Extract Cell component outside to prevent re-creation on every render
// Use memo/areEqual to prevent unnecessary re-renders of cells
const Cell = memo(({ columnIndex, rowIndex, style, data }: any) => {
  const { items, columnCount, onAnalyze } = data;
  const index = rowIndex * columnCount + columnIndex;
  
  if (index >= items.length) {
    return null;
  }

  const skill = items[index];

  return (
    <div style={style} className="p-1">
      <button
        onClick={() => onAnalyze(skill.url)}
        className="group w-full h-full flex flex-col text-left p-2 bg-white dark:bg-[#242628] hover:bg-stone-50 dark:hover:bg-[#2c2c2f] border border-stone-200 dark:border-stone-800 rounded-lg transition-all shadow-sm hover:shadow-md hover:border-blue-500/30 active:scale-[0.98]"
      >
        <div className="flex items-center justify-between w-full mb-0.5">
          <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {skill.name}
          </h4>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
           </span>
        </div>
        <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-tight flex-1">
          {skill.description}
        </p>
      </button>
    </div>
  );
}, areEqual);

const Dashboard: React.FC<DashboardProps> = ({ hotSkills, isLoadingSkills, onRefreshSkills, onAnalyze }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-4 md:px-8 py-6">
       {/* Hero Section */}
       <div className="flex flex-col items-center justify-center py-6 text-center shrink-0">
         <div className="w-10 h-10 mb-3 rounded-xl bg-stone-100 dark:bg-[#2c2c2f] border border-stone-200 dark:border-stone-700/50 flex items-center justify-center shadow-sm">
           <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
         </div>
         <h2 className="text-lg font-serif text-stone-800 dark:text-stone-100 mb-1">Skills 概览</h2>
         <p className="text-stone-500 dark:text-stone-400 font-light text-xs max-w-sm">Deep 分析代码结构与应用场景</p>
       </div>

       {/* Popular Skills Section - Virtualized */}
       <div className="flex-1 flex flex-col min-h-0 w-full mt-2">
         <div className="flex items-center justify-between mb-3 shrink-0 px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">热门技能库 ({hotSkills.length})</h3>
            <button 
              onClick={onRefreshSkills}
              disabled={isLoadingSkills}
              className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors disabled:opacity-50 uppercase tracking-wide font-medium"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isLoadingSkills ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M20 20v-5h-.058M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
               </svg>
               Refresh
            </button>
         </div>
         
         {hotSkills.length === 0 && !isLoadingSkills ? (
           <div className="text-center py-10 text-stone-400 text-sm bg-stone-50 dark:bg-[#1e1e20] rounded-xl border border-stone-200 dark:border-stone-800/50">
             暂无推荐数据，请尝试刷新。
           </div>
         ) : (
           <div className="flex-1 w-full min-h-0">
             <AutoSizer>
              {({ height, width }: { height: number, width: number }) => {
                // Responsive column calculation
                const getColumnCount = (w: number) => {
                  if (w < 640) return 1;      // Mobile
                  if (w < 1024) return 2;     // Tablet
                  if (w < 1280) return 3;     // Laptop
                  return 4;                   // Desktop
                };
                const columnCount = getColumnCount(width);
                
                // Subtract scrollbar width (approx 12px) to prevent right border cutoff
                const safeWidth = width - 12;
                const columnWidth = Math.floor(safeWidth / columnCount);
                const rowHeight = 52; // Compact height

                return (
                  <Grid
                    className="no-scrollbar"
                    columnCount={columnCount}
                    columnWidth={columnWidth}
                    height={height}
                    rowCount={Math.ceil(hotSkills.length / columnCount)}
                    rowHeight={rowHeight}
                    width={width}
                    itemData={{ items: hotSkills, columnCount, onAnalyze }}
                    overscanRowCount={5} // Pre-render 5 rows for smoother scrolling
                    style={{ overflowX: 'hidden', overflowY: 'auto', willChange: 'transform' }}
                  >
                    {Cell}
                  </Grid>
                );
              }}
             </AutoSizer>
           </div>
         )}
       </div>
    </div>
  );
};

export default Dashboard;