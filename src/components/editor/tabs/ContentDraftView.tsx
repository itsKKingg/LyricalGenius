import React from 'react';
import { Plus, PenLine, LayoutGrid, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface ContentDraftViewProps {
  type: 'video' | 'slideshow';
  aestheticName: string;
  onCreateClick: () => void;
}

export const ContentDraftView: React.FC<ContentDraftViewProps> = ({ 
  type, 
  aestheticName, 
  onCreateClick 
}) => {
  return (
    <div className="flex flex-col h-screen animate-fade-in relative">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-100 bg-white dark:bg-workspaceDark dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
             {/* Dates - Mocked */}
             <div className="flex gap-1">
                <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50 rounded">-7d</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50 rounded">-1d</button>
             </div>
             <div className="text-xs text-slate-400 px-2 border-l border-r border-slate-100 mx-2">
                Viewing content created between Jan 5 - Jan 11
             </div>
             <div className="flex gap-1">
                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded">+1d</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50 rounded">+7d</button>
                <button className="px-3 py-1 text-xs font-bold text-slate-900 hover:bg-slate-50 rounded">Today</button>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="primary" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 flex items-center gap-2 text-xs">
                 Brainstorm, draft, and approve a video to proceed
                 <ChevronDown size={14} />
             </Button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
         <div className="max-w-7xl mx-auto">
             
             {/* Header */}
             <div className="flex items-start gap-4 mb-8">
                <img 
                    src={`https://ui-avatars.com/api/?name=${aestheticName}&background=random`} 
                    alt="Aesthetic" 
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                />
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{aestheticName}</h1>
                        <ChevronDown size={20} className="text-slate-400 cursor-pointer"/>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Draft and approve {type}s</p>
                </div>
                <div className="ml-auto text-xs text-slate-400 pt-2">
                    Click the icon next to the page name to <span className="underline cursor-pointer hover:text-slate-600">switch aesthetics</span>!
                </div>
             </div>

             {/* Empty State / Drop Zone */}
             <div 
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-[600px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={onCreateClick}
             >
                 <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                     <Plus size={32} className="text-slate-600 dark:text-slate-300" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create a {type} edit</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center mb-6">
                     Click here to get started by creating ideas from your videos and audio tracks.
                 </p>
                 <p className="text-sm font-medium text-slate-900 dark:text-slate-300 underline cursor-pointer hover:text-blue-600">
                     Or, click here to create multiple edits at once
                 </p>
             </div>

             {/* Bottom Actions */}
             <div className="flex justify-center mt-6 gap-3">
                 <Button variant="secondary" icon={<PenLine size={16}/>} className="bg-white border-slate-200 shadow-sm text-slate-700">Edit aesthetic</Button>
                 <Button variant="secondary" icon={<LayoutGrid size={16}/>} className="bg-white border-slate-200 shadow-sm text-slate-700">Upload your own videos</Button>
             </div>
         </div>
      </div>
    </div>
  );
};