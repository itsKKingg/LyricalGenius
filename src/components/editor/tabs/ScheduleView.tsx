import React from 'react';
import { Plus, Bell, Settings, Type, List, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

export const ScheduleView: React.FC = () => {
  const days = ['Sun Jan 11', 'Mon Jan 12', 'Tue Jan 13', 'Wed Jan 14', 'Thu Jan 15', 'Fri Jan 16', 'Sat Jan 17'];

  return (
    <div className="flex flex-col h-screen animate-fade-in bg-white dark:bg-workspaceDark">
       {/* Top Bar */}
      <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
             <div className="flex gap-1">
                <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50 rounded bg-white border border-slate-200">-7d</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50 rounded bg-white border border-slate-200">-1d</button>
             </div>
             <div className="text-xs text-slate-500 px-2 mx-2">
                Viewing calendar between Jan 11 - Jan 17
             </div>
             <div className="flex gap-1">
                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded">+1d</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded">+7d</button>
                <button className="px-3 py-1 text-xs font-bold text-slate-900 bg-white border border-transparent hover:bg-slate-50 rounded">Today</button>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="primary" className="bg-blue-400 hover:bg-blue-500 text-white border-transparent rounded-full px-4 flex items-center gap-2 text-xs font-semibold shadow-none">
                 Drag a post to an account to schedule it!
                 <ChevronDown size={14} />
             </Button>
          </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-8 max-w-[1800px] mx-auto w-full">
         <div className="mb-8">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Schedule your content</h1>
             <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm">
                 Drag and drop finalized videos & slideshows to send them to your TikTok inbox 
                 <span className="text-slate-400">(System Notifications → Your content from LyricalGenius is ready)</span>
             </p>
         </div>

         <div className="flex gap-4 mb-8">
             <Button variant="primary" className="bg-[#0f1115] hover:bg-[#252830] text-white font-semibold" icon={<Plus size={16}/>}>Connect TikTok account</Button>
             <Button variant="secondary" className="bg-white border-slate-200 text-slate-700" icon={<ExternalLink size={16}/>}>Where does my content go when sent to TikTok?</Button>
         </div>

         <div className="flex gap-6 h-full min-h-0">
             {/* Left Panel */}
             <div className="w-64 shrink-0 flex flex-col gap-4">
                 <div className="flex items-center justify-between mb-2">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aesthetic</label>
                     <div className="flex bg-white rounded border border-slate-200 overflow-hidden">
                         <button className="px-2 py-1 bg-slate-900 text-white text-xs font-bold">Video</button>
                         <button className="px-2 py-1 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50">Slides</button>
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" checked readOnly className="rounded text-blue-600 focus:ring-blue-500"/>
                    <span className="text-xs text-slate-600">Show edits from other weeks</span>
                 </div>
                 
                 <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                     Finalize your video edits to have them show up here for scheduling!
                 </p>

                 <div className="flex items-center gap-2 mb-4">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     <span className="font-bold text-slate-900">heyitskkingg</span>
                 </div>

                 <Button variant="primary" className="w-full justify-start bg-[#0f1115] text-white" icon={<Bell size={16}/>}>Enable notifications</Button>
                 <Button variant="secondary" className="w-full justify-start border-slate-200" icon={<Settings size={16}/>}>Account settings</Button>
                 <Button variant="secondary" className="w-full justify-start border-slate-200" icon={<Type size={16}/>}>Caption posts</Button>
                 <Button variant="secondary" className="w-full justify-start border-slate-200 bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100" icon={<List size={16}/>}>Reorder posts</Button>
             </div>

             {/* Calendar Grid */}
             <div className="flex-1 border border-slate-200 rounded-lg bg-white flex overflow-hidden">
                 {days.map((day, i) => (
                     <div key={day} className={`flex-1 flex flex-col border-r border-slate-100 last:border-r-0 min-w-[140px]`}>
                         <div className="p-3 text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50/50 text-center">
                             {day}
                         </div>
                         <div className="flex-1 p-2 space-y-2 bg-slate-50/10">
                             {[1, 2, 3].map(slot => (
                                 <div key={slot} className="border border-dashed border-slate-200 rounded-lg p-3 text-center h-20 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                                     <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-medium">Empty slot {slot}</span>
                                     {slot === 1 && <span className="text-[9px] text-slate-300 mt-1">next: 8:00 AM</span>}
                                 </div>
                             ))}
                         </div>
                     </div>
                 ))}
             </div>
         </div>
         
         {/* Footer Tip */}
         <div className="mt-6 p-4 bg-orange-50 border border-dashed border-orange-200 rounded-lg text-sm text-orange-800">
             <span className="font-bold">Tip: Schedule more posts this week</span>
             <br/>
             <span className="opacity-80">Drag and drop approved edits from the left into a day to create posts - or select multiple videos / slideshows and try the scheduler!</span>
         </div>
      </div>
    </div>
  );
};