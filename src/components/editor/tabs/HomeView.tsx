import React from 'react';
import { Button } from '../ui/Button';
import { Plus, ArrowRight } from 'lucide-react';

export const HomeView: React.FC<{ onCreate: () => void, onViewAesthetics: () => void }> = ({ onCreate, onViewAesthetics }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Welcome to LyricalGenius</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Create privacy-first lyric videos with a professional, artist-friendly workflow.
          Start by creating an aesthetic board to curate your visual universe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1A1D23] p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">New Aesthetic</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Start fresh with a new visual theme for your lyrics.</p>
            <Button onClick={onCreate} className="w-full dark:bg-white dark:text-black dark:hover:bg-gray-200">Create Aesthetic</Button>
        </div>

        <div className="bg-white dark:bg-[#1A1D23] p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ArrowRight size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">My Aesthetics</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">View and manage your existing aesthetic boards.</p>
            <Button variant="secondary" onClick={onViewAesthetics} className="w-full dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">View All</Button>
        </div>
      </div>
    </div>
  );
};