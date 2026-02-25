import React from 'react';

interface ErrorStateProps {
  message: string;
  onClose: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-stone-400">
       <div className="w-12 h-12 mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
       </div>
       <h2 className="text-lg font-medium mb-2 text-stone-800 dark:text-stone-200">分析失败</h2>
       <p className="text-center max-w-md text-sm mb-6 text-stone-500 dark:text-stone-400">{message}</p>
       <button 
         onClick={onClose}
         className="px-4 py-2 bg-stone-100 dark:bg-[#2c2c2f] hover:bg-stone-200 dark:hover:bg-[#3f3f42] rounded text-sm text-stone-600 dark:text-stone-300 transition-colors"
       >
         关闭报告
       </button>
    </div>
  );
};

export default ErrorState;