import { Sparkles, FolderOpen, Palette, Settings } from 'lucide-react'
import { PRESETS } from '../../utils/presets'
import { useProjectStore } from '../../stores/projectStore'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const updateSettings = useProjectStore(state => state.updateSettings)

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId)
    if (preset) {
      updateSettings({ ...preset.settings, preset: presetId })
    }
  }

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <button
          onClick={() => navigate('/projects')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <FolderOpen className="w-5 h-5" />
          Projects
        </button>
        <button
          disabled
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 cursor-not-allowed text-sm"
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>

      <div className="h-px bg-gray-800 mx-4" />

      {/* Presets */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-sm">Viral Presets</h3>
        </div>

        <div className="space-y-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-purple-600 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{preset.thumbnail}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm group-hover:text-purple-400 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {preset.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Create Custom Preset */}
        <button
          disabled
          className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-700 text-gray-500 cursor-not-allowed text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Save Custom Preset
        </button>
      </div>
    </aside>
  )
}
