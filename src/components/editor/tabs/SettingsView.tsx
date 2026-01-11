import React from 'react';
import { Settings, Bell, Moon, Save, User, Sun } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsViewProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ToggleItem = ({ label, description, icon: Icon, isChecked, onChange }: any) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white mb-4 dark:bg-[#1A1D23] dark:border-gray-700">
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 dark:bg-black/30 dark:text-gray-300">
            <Icon size={20} />
        </div>
        <div>
            <h4 className="font-medium text-slate-900 dark:text-white">{label}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
        <input 
            type="checkbox" 
            checked={isChecked}
            onChange={onChange}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-blue-600 dark:border-gray-600 dark:checked:border-blue-500" 
        />
        <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${isChecked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></label>
    </div>
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, onToggleTheme }) => {
  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your preferences and account details.</p>
      </div>

      <div className="space-y-8">
        <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-gray-500">General</h3>
            <ToggleItem 
                icon={currentTheme === 'dark' ? Moon : Sun} 
                label="Dark Mode" 
                description="Use dark theme for the workspace and sidebar."
                isChecked={currentTheme === 'dark'}
                onChange={onToggleTheme}
            />
            <ToggleItem 
                icon={Save} 
                label="Auto-Save" 
                description="Automatically save changes every 5 seconds." 
                isChecked={true}
                onChange={() => {}}
            />
        </section>

        <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-gray-500">Notifications</h3>
            <ToggleItem 
                icon={Bell} 
                label="Push Notifications" 
                description="Get notified when bulk exports are ready."
                isChecked={false}
                onChange={() => {}}
            />
        </section>

        <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-gray-500">Account</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-4 dark:bg-[#1A1D23] dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    LG
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">Lyrical Genius User</h4>
                    <p className="text-gray-500 dark:text-gray-400">Pro Plan • user@example.com</p>
                </div>
                <Button variant="outline" className="dark:text-white dark:border-gray-600 dark:hover:bg-gray-800">Manage Subscription</Button>
            </div>
        </section>
      </div>
    </div>
  );
};