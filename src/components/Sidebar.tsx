import { useState } from 'react';
import { Upload, Type, Sparkles, Image, Music, Layout } from 'lucide-react';
import MediaTab from './tabs/MediaTab';
import CaptionTab from './tabs/CaptionTab';
import EffectsTab from './tabs/EffectsTab';
import StickersTab from './tabs/StickersTab';
import AudioTab from './tabs/AudioTab';
import TemplatesTab from './tabs/TemplatesTab';

type TabId = 'media' | 'caption' | 'effects' | 'stickers' | 'audio' | 'templates';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'media', label: 'Media', icon: <Upload size={20} /> },
  { id: 'caption', label: 'Text/Captions', icon: <Type size={20} /> },
  { id: 'effects', label: 'Effects', icon: <Sparkles size={20} /> },
  { id: 'stickers', label: 'Stickers', icon: <Image size={20} /> },
  { id: 'audio', label: 'Audio', icon: <Music size={20} /> },
  { id: 'templates', label: 'Templates', icon: <Layout size={20} /> },
];

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabId>('caption');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'media':
        return <MediaTab />;
      case 'caption':
        return <CaptionTab />;
      case 'effects':
        return <EffectsTab />;
      case 'stickers':
        return <StickersTab />;
      case 'audio':
        return <AudioTab />;
      case 'templates':
        return <TemplatesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col overflow-hidden border-r border-gray-800">
      {/* Tab Navigation */}
      <div className="flex flex-col gap-1 p-2 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
