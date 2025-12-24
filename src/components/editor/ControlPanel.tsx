import { useState } from 'react'
import { Type, Image, Wand2, Download, Layers } from 'lucide-react'
import LyricsTab from './tabs/LyricsTab'
import TextTab from './tabs/TextTab'
import BackgroundTab from './tabs/BackgroundTab'
import EffectsTab from './tabs/EffectsTab'
import ExportTab from './tabs/ExportTab'

type Tab = 'lyrics' | 'text' | 'background' | 'effects' | 'export'

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('lyrics')

  const tabs = [
    { id: 'lyrics' as const, label: 'Lyrics', icon: Layers },
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'background' as const, label: 'Background', icon: Image },
    { id: 'effects' as const, label: 'Effects', icon: Wand2 },
    { id: 'export' as const, label: 'Export', icon: Download },
  ]

  return (
    <aside className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id 
                ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800' 
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'lyrics' && <LyricsTab />}
        {activeTab === 'text' && <TextTab />}
        {activeTab === 'background' && <BackgroundTab />}
        {activeTab === 'effects' && <EffectsTab />}
        {activeTab === 'export' && <ExportTab />}
      </div>
    </aside>
  )
}
