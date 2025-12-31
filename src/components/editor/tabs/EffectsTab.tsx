import { useProjectStore } from '../../../stores/projectStore'
import TemplateGallery from '../../TemplateGallery'
import type { ProjectSettings } from '../../../types'

const ANIMATION_STYLES = [
  { value: 'none' as const, label: 'None' },
  { value: 'fade' as const, label: 'Fade' },
  { value: 'scale' as const, label: 'Scale' },
  { value: 'slide' as const, label: 'Slide' },
  { value: 'bounce' as const, label: 'Bounce' },
  { value: 'typewriter' as const, label: 'Typewriter' },
  { value: 'karaoke' as const, label: 'Karaoke' },
]

const VISUALIZER_STYLES = [
  { value: 'none' as const, label: 'None' },
  { value: 'circular' as const, label: 'Circular' },
  { value: 'wave' as const, label: 'Wave' },
  { value: 'bars' as const, label: 'Bars' },
  { value: 'mirror' as const, label: 'Mirror' },
]

export default function EffectsTab() {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateSettings = useProjectStore(state => state.updateSettings)

  if (!currentProject) return null

  const { settings } = currentProject

  return (
    <div className="p-4 space-y-6">
      {/* Template Gallery */}
      <div className="pb-4 border-b border-gray-800">
        <TemplateGallery />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Custom Animation</h3>

        <label className="block text-sm font-medium mb-2">Animation Style</label>
        <div className="grid grid-cols-2 gap-2">
          {ANIMATION_STYLES.map(style => (
            <button
              key={style.value}
              onClick={() => updateSettings({ animationStyle: style.value as ProjectSettings['animationStyle'] })}
              className={`
                px-3 py-2 rounded-lg border transition-colors text-xs
                ${settings.animationStyle === style.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Animation Duration: {settings.animationDuration}ms
        </label>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          value={settings.animationDuration}
          onChange={(e) => updateSettings({ animationDuration: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="pt-4 border-t border-gray-800">
        <h3 className="text-sm font-semibold mb-3">Audio Visualizer</h3>

        <label className="block text-sm font-medium mb-2">Visualizer Style</label>
        <div className="grid grid-cols-2 gap-2">
          {VISUALIZER_STYLES.map(style => (
            <button
              key={style.value}
              onClick={() => updateSettings({ visualizerStyle: style.value as ProjectSettings['visualizerStyle'] })}
              className={`
                px-3 py-2 rounded-lg border transition-colors text-xs
                ${settings.visualizerStyle === style.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {settings.visualizerStyle !== 'none' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Intensity: {settings.visualizerIntensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.visualizerIntensity}
              onChange={(e) => updateSettings({ visualizerIntensity: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Visualizer Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.visualizerColor}
                onChange={(e) => updateSettings({ visualizerColor: e.target.value })}
                className="w-12 h-10 rounded border border-gray-700 cursor-pointer"
              />
              <input
                type="text"
                value={settings.visualizerColor}
                onChange={(e) => updateSettings({ visualizerColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none font-mono text-sm"
              />
            </div>
          </div>
        </>
      )}

      <div className="pt-4 border-t border-gray-800">
        <h3 className="text-sm font-semibold mb-3">Watermark</h3>
        
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={settings.watermarkEnabled}
            onChange={(e) => updateSettings({ watermarkEnabled: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">Enable Watermark</span>
        </label>

        {settings.watermarkEnabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Text</label>
              <input
                type="text"
                value={settings.watermarkText}
                onChange={(e) => updateSettings({ watermarkText: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'topLeft' as const, label: 'Top Left' },
                  { value: 'topRight' as const, label: 'Top Right' },
                  { value: 'bottomLeft' as const, label: 'Bottom Left' },
                  { value: 'bottomRight' as const, label: 'Bottom Right' },
                ].map(pos => (
                  <button
                    key={pos.value}
                    onClick={() => updateSettings({ watermarkPosition: pos.value as ProjectSettings['watermarkPosition'] })}
                    className={`
                      px-3 py-2 rounded-lg border transition-colors text-xs
                      ${settings.watermarkPosition === pos.value
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
              <label className="block text-sm font-medium mb-2">
                Opacity: {Math.round(settings.watermarkOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.watermarkOpacity}
                onChange={(e) => updateSettings({ watermarkOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
