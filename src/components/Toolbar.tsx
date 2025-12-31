import { Undo2, Redo2, Play, Pause, Download } from 'lucide-react';
import { useEditor } from '../hooks/useEditor';
import { usePlayback } from '../hooks/usePlayback';
import { useState } from 'react';
import ExportModal from './modals/ExportModal';

export default function Toolbar() {
  const { currentProject, updateProjectName, undo, redo, canUndo, canRedo } = useEditor();
  const { isPlaying, togglePlayback } = usePlayback();
  const [showExportModal, setShowExportModal] = useState(false);

  if (!currentProject) return null;

  return (
    <>
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* Left: Undo/Redo */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={20} />
          </button>
        </div>

        {/* Center: Project Title */}
        <div className="flex-1 flex justify-center px-4">
          <input
            type="text"
            value={currentProject.name}
            onChange={(e) => updateProjectName(e.target.value)}
            className="text-lg font-semibold text-center px-4 py-1 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors max-w-md"
            placeholder="Project Name"
          />
        </div>

        {/* Right: Play/Export */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                <span className="font-medium">Pause</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span className="font-medium">Play</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download size={20} />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </>
  );
}
