import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Aesthetic } from '../../types';

interface AestheticsListViewProps {
  aesthetics: Aesthetic[];
  onCreate: () => void;
  onSelect: (id: string) => void;
}

export const AestheticsListView: React.FC<AestheticsListViewProps> = ({ aesthetics, onCreate, onSelect }) => {
  return (
    <div className="max-w-[1600px] mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Aesthetics</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your visual themes and content libraries</p>
        </div>
        <button 
            onClick={onCreate}
            className="flex items-center gap-2 bg-[#0f1115] text-white px-4 py-2 rounded-lg hover:bg-[#252830] transition-colors font-medium text-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
            <Plus size={16} />
            New Aesthetic
        </button>
      </div>

      {aesthetics.length === 0 ? (
        <div className="h-96 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-black/20">
            <FolderOpen size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No aesthetics yet</p>
            <p className="text-sm mb-6">Create your first aesthetic board to get started</p>
            <button 
                onClick={onCreate}
                className="text-blue-500 hover:underline font-medium"
            >
                Create new aesthetic
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aesthetics.map((aesthetic) => (
                <div 
                    key={aesthetic.id} 
                    onClick={() => onSelect(aesthetic.id)}
                    className="group bg-white dark:bg-[#1A1D23] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer flex flex-col h-full"
                >
                    <div className="aspect-video bg-gray-100 dark:bg-black/40 relative overflow-hidden">
                        {aesthetic.thumbnail ? (
                            <img src={aesthetic.thumbnail} alt={aesthetic.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
                                <span className="text-4xl font-light italic opacity-20">Aa</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{aesthetic.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{aesthetic.description}</p>
                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
                             <div className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-black/20 px-2 py-1 rounded">
                                {aesthetic.theme || 'Default'}
                             </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Create New Card (optional convenience) */}
            <div 
                onClick={onCreate}
                className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-[#1A1D23] hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer min-h-[300px] transition-all"
            >
                <Plus size={32} className="mb-2 opacity-50" />
                <span className="font-medium">Create New</span>
            </div>
        </div>
      )}
    </div>
  );
};