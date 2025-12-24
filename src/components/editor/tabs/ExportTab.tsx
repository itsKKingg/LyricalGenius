import { useState } from 'react'
import { Download, Film, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useProjectStore } from '../../../stores/projectStore'

const VIDEO_FORMATS = [
  { value: '9:16', label: 'TikTok/Reels (9:16)', description: '1080x1920' },
  { value: '1:1', label: 'Instagram Square (1:1)', description: '1080x1080' },
  { value: '16:9', label: 'YouTube (16:9)', description: '1920x1080' },
]

const RESOLUTIONS = [
  { value: '1080p', label: '1080p (Full HD)' },
  { value: '720p', label: '720p (HD)' },
  { value: '480p', label: '480p (SD)' },
]

const FPS_OPTIONS = [
  { value: 30, label: '30 FPS' },
  { value: 60, label: '60 FPS' },
]

export default function ExportTab() {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateSettings = useProjectStore(state => state.updateSettings)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  if (!currentProject) return null

  const { settings } = currentProject

  const handleExport = async (format: 'mp4' | 'gif') => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          return 0
        }
        return prev + 10
      })
    }, 300)

    // TODO: Implement actual video export using canvas + MediaRecorder API
    console.log(`Exporting ${format}...`)
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Video Format</h3>
        <div className="space-y-2">
          {VIDEO_FORMATS.map(format => (
            <button
              key={format.value}
              onClick={() => updateSettings({ videoFormat: format.value as any })}
              className={`
                w-full text-left p-3 rounded-lg border transition-colors
                ${settings.videoFormat === format.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              <div className="font-medium text-sm">{format.label}</div>
              <div className="text-xs text-gray-400 mt-1">{format.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Resolution</h3>
        <div className="space-y-2">
          {RESOLUTIONS.map(res => (
            <button
              key={res.value}
              onClick={() => updateSettings({ resolution: res.value as any })}
              className={`
                w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm
                ${settings.resolution === res.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Frame Rate</h3>
        <div className="grid grid-cols-2 gap-2">
          {FPS_OPTIONS.map(fps => (
            <button
              key={fps.value}
              onClick={() => updateSettings({ fps: fps.value as any })}
              className={`
                px-3 py-2 rounded-lg border transition-colors text-sm
                ${settings.fps === fps.value
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {fps.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-800 space-y-3">
        <button
          onClick={() => handleExport('mp4')}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Film className="w-5 h-5" />
          )}
          {isExporting ? `Exporting... ${exportProgress}%` : 'Export as MP4'}
        </button>

        <button
          onClick={() => handleExport('gif')}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
          Export as GIF
        </button>

        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-gray-500 cursor-not-allowed rounded-lg font-medium"
        >
          <Download className="w-5 h-5" />
          Generate Thumbnails
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded ml-2">Soon</span>
        </button>
      </div>

      {isExporting && (
        <div className="mt-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 space-y-1">
          <p>✓ All processing happens in your browser</p>
          <p>✓ Your audio never leaves your device</p>
          <p>✓ No watermarks, completely free</p>
        </div>
      </div>
    </div>
  )
}
