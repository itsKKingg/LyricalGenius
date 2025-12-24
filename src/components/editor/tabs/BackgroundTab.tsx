import { useProjectStore } from '../../../stores/projectStore'

const BACKGROUND_TYPES = [
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
  { value: 'albumArt', label: 'Album Art' },
  { value: 'visualizer', label: 'Visualizer' },
]

const GRADIENT_PRESETS = [
  { name: 'Purple Dream', colors: ['#1a1a2e', '#16213e', '#0f3460'] },
  { name: 'Sunset', colors: ['#ff006e', '#8338ec', '#3a86ff'] },
  { name: 'Ocean', colors: ['#667eea', '#764ba2', '#f093fb'] },
  { name: 'Forest', colors: ['#134e5e', '#71b280'] },
  { name: 'Fire', colors: ['#f12711', '#f5af19'] },
  { name: 'Brat', colors: ['#8ace00', '#bfff00'] },
]

export default function BackgroundTab() {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateSettings = useProjectStore(state => state.updateSettings)

  if (!currentProject) return null

  const { settings } = currentProject

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Background Type</label>
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUND_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => updateSettings({ backgroundType: type.value as any })}
              className={`
                px-3 py-2 rounded-lg border transition-colors text-sm
                ${settings.backgroundType === type.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {settings.backgroundType === 'gradient' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Gradient Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => updateSettings({ backgroundGradient: preset.colors })}
                  className="relative h-12 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-600 transition-colors group"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium bg-black/0 group-hover:bg-black/50 transition-colors">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Custom Colors</label>
            <div className="space-y-2">
              {settings.backgroundGradient.map((color, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newGradient = [...settings.backgroundGradient]
                      newGradient[index] = e.target.value
                      updateSettings({ backgroundGradient: newGradient })
                    }}
                    className="w-12 h-9 rounded border border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const newGradient = [...settings.backgroundGradient]
                      newGradient[index] = e.target.value
                      updateSettings({ backgroundGradient: newGradient })
                    }}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {settings.backgroundType === 'image' && (
        <div>
          <label className="block text-sm font-medium mb-2">Background Image</label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center text-gray-400 text-sm">
            <p>Drag & drop image or</p>
            <button className="mt-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              Browse Files
            </button>
          </div>
        </div>
      )}

      {settings.backgroundType === 'albumArt' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Background Blur: {settings.backgroundBlur}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.backgroundBlur}
            onChange={(e) => updateSettings({ backgroundBlur: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-2">
            Extracted from audio file metadata
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-gray-800">
        <label className="block text-sm font-medium mb-2">Solid Color Overlay</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
            className="w-12 h-10 rounded border border-gray-700 cursor-pointer"
          />
          <input
            type="text"
            value={settings.backgroundColor}
            onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}
