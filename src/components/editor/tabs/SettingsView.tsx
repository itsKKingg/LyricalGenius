import React from 'react';
import { Moon, Sun, Monitor, Bell, Shield, Keyboard, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto py-12 px-6"
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your editor experience and account preferences</p>
      </div>

      <div className="space-y-8">
        {/* Appearance Section */}
        <section className="bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 flex items-center gap-3">
            <Monitor size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white mb-0.5">Theme Mode</p>
                <p className="text-xs text-slate-500">Switch between light and dark visual styles</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Sun size={14} /> Light
                </button>
                <button 
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${theme === 'dark' ? 'bg-[#0B0D10] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Moon size={14} /> Dark
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* General Settings Mock Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsCard icon={Bell} title="Notifications" description="Configure alert preferences" />
            <SettingsCard icon={Shield} title="Privacy" description="Manage your data and security" />
            <SettingsCard icon={Keyboard} title="Shortcuts" description="Customize editor hotkeys" />
            <SettingsCard icon={Zap} title="Performance" description="Optimize rendering settings" />
        </div>
      </div>
    </motion.div>
  );
};

const SettingsCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="p-6 bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-500 group-hover:text-indigo-500 transition-colors">
            <Icon size={20} />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);
