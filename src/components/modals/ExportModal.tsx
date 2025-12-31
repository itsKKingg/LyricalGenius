import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';

interface ExportModalProps {
  onClose: () => void;
}

const exportPresets = [
  {
    id: 'tiktok',
    name: 'TikTok',
    format: 'MP4',
    resolution: '1080x1920',
    fps: 30,
    aspectRatio: '9:16',
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reels',
    format: 'MP4',
    resolution: '1080x1920',
    fps: 30,
    aspectRatio: '9:16',
  },
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    format: 'MP4',
    resolution: '1080x1920',
    fps: 30,
    aspectRatio: '9:16',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    format: 'MP4',
    resolution: '1920x1080',
    fps: 30,
    aspectRatio: '16:9',
  },
  {
    id: 'custom',
    name: 'Custom',
    format: 'MP4',
    resolution: 'Custom',
    fps: 30,
    aspectRatio: 'Custom',
  },
];

export default function ExportModal({ onClose }: ExportModalProps) {
  const { currentProject } = useEditor();
  const [selectedPreset, setSelectedPreset] = useState('tiktok');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!currentProject) return;

    setExporting(true);

    try {
      // This is a placeholder for the actual export logic
      // In production, this would use MediaRecorder API or server-side rendering
      alert('Export functionality is a placeholder. In production, this would render the video using MediaRecorder API or server-side processing.');
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Export Video</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              {exportPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedPreset === preset.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{preset.name}</h4>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>Format: {preset.format}</p>
                    <p>Resolution: {preset.resolution}</p>
                    <p>FPS: {preset.fps}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>High (Recommended)</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>MP4</option>
                  <option>WebM</option>
                  <option>MOV</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Export Video</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
