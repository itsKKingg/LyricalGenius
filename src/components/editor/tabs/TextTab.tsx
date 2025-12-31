import { useProjectStore } from '../../../stores/projectStore'

const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact', 'Comic Sans MS', 'Verdana']
const POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
]
const ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

export default function TextTab() {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateSettings = useProjectStore(state => state.updateSettings)

  if (!currentProject) return null

  const { settings } = currentProject

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Font Family</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSettings({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
        >
          {FONTS.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Font Size: {settings.fontSize}px
        </label>
        <input
          type="range"
          min="20"
          max="120"
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Font Weight: {settings.fontWeight}
        </label>
        <input
          type="range"
          min="100"
          max="900"
          step="100"
          value={settings.fontWeight}
          onChange={(e) => updateSettings({ fontWeight: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => updateSettings({ textColor: e.target.value })}
            className="w-12 h-10 rounded border border-gray-700 cursor-pointer"
          />
          <input
            type="text"
            value={settings.textColor}
            onChange={(e) => updateSettings({ textColor: e.target.value })}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Position</label>
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map(pos => (
            <button
              key={pos.value}
              onClick={() => updateSettings({ captionPosition: pos.value as 'top' | 'center' | 'bottom' })}
              className={`
                px-3 py-2 rounded-lg border transition-colors text-sm
                ${settings.captionPosition === pos.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Alignment</label>
        <div className="grid grid-cols-3 gap-2">
          {ALIGNMENTS.map(align => (
            <button
              key={align.value}
              onClick={() => updateSettings({ textAlign: align.value as 'left' | 'center' | 'right' })}
              className={`
                px-3 py-2 rounded-lg border transition-colors text-sm
                ${settings.textAlign === align.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {align.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.textStroke}
            onChange={(e) => updateSettings({ textStroke: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">Text Stroke</span>
        </label>
        
        {settings.textStroke && (
          <div className="mt-3 pl-6 space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Width: {settings.textStrokeWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.textStrokeWidth}
                onChange={(e) => updateSettings({ textStrokeWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <input
                type="color"
                value={settings.textStrokeColor}
                onChange={(e) => updateSettings({ textStrokeColor: e.target.value })}
                className="w-12 h-8 rounded border border-gray-700 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.textShadow}
            onChange={(e) => updateSettings({ textShadow: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">Text Shadow</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.textGlow}
            onChange={(e) => updateSettings({ textGlow: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">Text Glow</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Letter Spacing: {settings.letterSpacing}px
        </label>
        <input
          type="range"
          min="-5"
          max="20"
          value={settings.letterSpacing}
          onChange={(e) => updateSettings({ letterSpacing: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  )
}
