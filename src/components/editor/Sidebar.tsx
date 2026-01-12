import React, { useState } from 'react';
import {
  Rocket,
  Layers,
  Video,
  Image as ImageIcon,
  Share2,
  LayoutGrid,
  Settings,
  Type,
  Palette,
  HelpCircle,
  Plus
} from 'lucide-react';
import { ViewType, Aesthetic } from '../../app/editor/types';

interface SidebarProps {
  currentView: ViewType;
  activeAestheticId: string | null;
  aesthetics: Aesthetic[];
  onNavigate: (view: ViewType, aestheticId?: string) => void;
  onCreateAesthetic: () => void;
  activeTab?: 'editor' | 'pexels' | 'pinterest';
  setActiveTab?: (tab: 'editor' | 'pexels' | 'pinterest') => void;
}

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  isExpanded?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  isActive = false, 
  hasDropdown = false, 
  onClick,
  isExpanded = false
}) => (
  <div 
    onClick={onClick}
    className={`
      group relative flex items-center justify-between px-4 py-3 mb-1 cursor-pointer transition-all
      ${isActive 
        ? 'bg-blue-50/50 text-indigo-600 dark:bg-slate-800/50 dark:text-indigo-400' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/30'}
    `}
  >
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full" />
    )}
    
    <div className="flex items-center gap-3">
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
    </div>
    {hasDropdown && (
      <span className={`text-xs text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
        ▼
      </span>
    )}
  </div>
);

interface SubItemProps {
  label: string;
  isActive?: boolean;
  image?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const SubItem: React.FC<SubItemProps> = ({ 
  label, 
  isActive = false, 
  image,
  onClick 
}) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-2 ml-4 mr-2 rounded-lg cursor-pointer mb-1 transition-colors border border-transparent
      ${isActive 
        ? 'bg-white border-slate-200 text-indigo-600 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/30'}
    `}
  >
    {image ? (
      <img src={image} alt="thumbnail" className="w-5 h-5 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
    ) : (
      <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
      </div>
    )}
    <span className="text-sm truncate font-medium">{label}</span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeAestheticId,
  aesthetics,
  onNavigate,
  onCreateAesthetic,
  activeTab = 'editor',
  setActiveTab
}) => {
  const [aestheticsOpen, setAestheticsOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  return (
    <div className="w-[260px] h-screen bg-slate-50 border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 dark:bg-[#0B0D10] dark:border-slate-800 transition-colors">
      {/* Header */}
      <div 
        className="h-16 flex items-center px-6 mb-2 cursor-pointer"
        onClick={() => onNavigate('HOME')}
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-500/20 shadow-lg">
          <span className="text-white font-bold text-xl italic">L</span>
        </div>
        <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">LyricalGenius</span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        <SidebarItem 
          icon={Rocket} 
          label="Get started" 
          isActive={currentView === 'HOME'} 
          onClick={() => onNavigate('HOME')}
        />
        
        <div className="mt-6 mb-2 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-600">Workspace</div>
        <SidebarItem 
          icon={Layers} 
          label="Aesthetics" 
          hasDropdown 
          isExpanded={aestheticsOpen}
          isActive={currentView === 'AESTHETICS'}
          onClick={() => {
            setAestheticsOpen(!aestheticsOpen);
            onNavigate('AESTHETICS');
          }}
        />
        
        {aestheticsOpen && (
          <div className="animate-fade-in-down mb-4">
            {aesthetics.map((aesthetic) => (
              <SubItem
                key={aesthetic.id}
                label={aesthetic.name}
                image={aesthetic.thumbnail}
                isActive={currentView === 'WORKSPACE' && activeAestheticId === aesthetic.id}
                onClick={(e) => {
                  e?.stopPropagation();
                  onNavigate('WORKSPACE', aesthetic.id);
                }}
              />
            ))}
            <div
              onClick={onCreateAesthetic}
              className="flex items-center gap-3 px-4 py-2 ml-4 mr-2 rounded-lg cursor-pointer mb-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-800/30 transition-colors group"
            >
               <div className="w-5 h-5 flex items-center justify-center border border-dashed border-current rounded-md">
                  <Plus size={12} />
               </div>
               <span className="text-sm font-medium">Create new</span>
            </div>

            {/* Workspace Tabs - Only show when in WORKSPACE view */}
            {currentView === 'WORKSPACE' && setActiveTab && (
              <div className="mt-4 mb-2 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-600">Workspace Tabs</div>
            )}
            {currentView === 'WORKSPACE' && setActiveTab && (
              <div className="animate-fade-in-down mb-4">
                <SubItem
                  label="Editor"
                  isActive={activeTab === 'editor'}
                  onClick={() => setActiveTab('editor')}
                />
                <SubItem
                  label="Pexels"
                  isActive={activeTab === 'pexels'}
                  onClick={() => setActiveTab('pexels')}
                />
                <SubItem
                  label="Pinterest"
                  isActive={activeTab === 'pinterest'}
                  onClick={() => setActiveTab('pinterest')}
                />
              </div>
            )}
          </div>
        )}
        
        <div className="mt-2 mb-2 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-600">Create content</div>
        <SidebarItem 
          icon={Video} 
          label="Videos" 
          isActive={currentView === 'VIDEOS'}
          onClick={() => onNavigate('VIDEOS')}
        />
        <SidebarItem 
          icon={ImageIcon} 
          label="Slideshows" 
          isActive={currentView === 'SLIDESHOWS'}
          onClick={() => onNavigate('SLIDESHOWS')}
        />
        <SidebarItem 
          icon={Share2} 
          label="Send to TikTok" 
          isActive={currentView === 'SEND_TO_TIKTOK'}
          onClick={() => onNavigate('SEND_TO_TIKTOK')}
        />

        <div 
          className="mt-6 mb-2 px-6 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          <span>Advanced Features</span>
          <span className={`transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
        
        {advancedOpen && (
          <div className="animate-fade-in-down">
            <SidebarItem 
              icon={LayoutGrid} 
              label="View all media" 
              isActive={currentView === 'PEXELS'}
              onClick={() => onNavigate('PEXELS')}
            />
            <SidebarItem 
              icon={Palette} 
              label="Clipper" 
              isActive={currentView === 'TEXT_EDITOR'}
              onClick={() => onNavigate('TEXT_EDITOR')}
            />
             <SidebarItem 
              icon={Type} 
              label="Bulk export videos" 
              isActive={currentView === 'PINTEREST'}
              onClick={() => onNavigate('PINTEREST')}
            />
            <SidebarItem 
              icon={Settings} 
              label="External edits" 
              isActive={currentView === 'SETTINGS'}
              onClick={() => onNavigate('SETTINGS')}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer">
          <HelpCircle size={14} />
          <span>questions? check out the <span className="underline">docs</span></span>
        </div>
      </div>
    </div>
  );
};