import React from 'react';
import { Film } from 'lucide-react';

export const PinterestView: React.FC = () => {
  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in h-[calc(100vh-64px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bulk export videos</h1>
        <p className="text-slate-500 dark:text-slate-400">Batch processing and export tools.</p>
      </div>
      
      <div className="flex flex-col items-center justify-center h-96 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
         <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
            <Film size={32} />
         </div>
         <p className="text-slate-900 dark:text-white font-medium mb-1">No exports in progress</p>
         <p className="text-sm text-slate-500 dark:text-slate-400">Select videos to begin a bulk export.</p>
      </div>
    </div>
  );
};