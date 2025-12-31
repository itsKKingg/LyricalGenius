import { useEditor } from '../hooks/useEditor';
import type { Caption } from '../types';

export default function PropertiesPanel() {
  const { currentProject, selectedClips, updateCaption } = useEditor();

  if (!currentProject || selectedClips.length === 0) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        <p className="text-sm text-gray-500">Select a clip to edit its properties</p>
      </div>
    );
  }

  // Get the first selected clip
  const selectedClipId = selectedClips[0];
  let selectedCaption: Caption | null = null;

  // Find the clip
  for (const track of currentProject.tracks) {
    if (track.type === 'caption') {
      const found = track.clips.find((c) => c.id === selectedClipId) as Caption | undefined;
      if (found) {
        selectedCaption = found;
        break;
      }
    }
  }

  if (!selectedCaption) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        <p className="text-sm text-gray-500">Only caption properties are currently supported</p>
      </div>
    );
  }

  const handleStyleUpdate = (updates: Partial<Caption['style']>) => {
    updateCaption(selectedCaption!.id, {
      style: { ...selectedCaption!.style, ...updates },
    });
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Caption Properties</h3>

        {/* Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
          <textarea
            value={selectedCaption.text}
            onChange={(e) => updateCaption(selectedCaption!.id, { text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
          />
        </div>

        {/* Timing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start (ms)</label>
            <input
              type="number"
              value={selectedCaption.startMs}
              onChange={(e) => updateCaption(selectedCaption!.id, { startMs: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End (ms)</label>
            <input
              type="number"
              value={selectedCaption.endMs}
              onChange={(e) => updateCaption(selectedCaption!.id, { endMs: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select
            value={selectedCaption.style.fontFamily}
            onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Impact, sans-serif">Impact</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size: {selectedCaption.style.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="120"
            value={selectedCaption.style.fontSize}
            onChange={(e) => handleStyleUpdate({ fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
          <div className="flex gap-2">
            {(['normal', 'bold', 'bolder'] as const).map((weight) => (
              <button
                key={weight}
                onClick={() => handleStyleUpdate({ fontWeight: weight })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCaption.style.fontWeight === weight
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {weight === 'normal' ? 'Regular' : weight === 'bold' ? 'Bold' : 'Extra'}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
          <input
            type="color"
            value={selectedCaption.style.color}
            onChange={(e) => handleStyleUpdate({ color: e.target.value })}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => handleStyleUpdate({ alignment: align })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCaption.style.alignment === align
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        {/* Outline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outline Width: {selectedCaption.style.outlineWidth || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={selectedCaption.style.outlineWidth || 0}
            onChange={(e) => handleStyleUpdate({ outlineWidth: Number(e.target.value) })}
            className="w-full mb-2"
          />
          <input
            type="color"
            value={selectedCaption.style.outlineColor || '#000000'}
            onChange={(e) => handleStyleUpdate({ outlineColor: e.target.value })}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>

        {/* Shadow */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shadow Blur: {selectedCaption.style.shadowBlur || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={selectedCaption.style.shadowBlur || 0}
            onChange={(e) => handleStyleUpdate({ shadowBlur: Number(e.target.value) })}
            className="w-full mb-2"
          />
          <input
            type="color"
            value={selectedCaption.style.shadowColor || '#000000'}
            onChange={(e) => handleStyleUpdate({ shadowColor: e.target.value })}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position Y: {selectedCaption.style.positionY}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedCaption.style.positionY}
            onChange={(e) => handleStyleUpdate({ positionY: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
