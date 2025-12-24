import { useState } from 'react'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useProjectStore } from '../../../stores/projectStore'
import { LyricLine } from '../../../types'

export default function LyricsTab() {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateLyrics = useProjectStore(state => state.updateLyrics)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  if (!currentProject) return null

  const handleAddLine = () => {
    const newLine: LyricLine = {
      id: crypto.randomUUID(),
      text: 'New lyric line',
      startTime: currentProject.lyrics.length > 0 
        ? currentProject.lyrics[currentProject.lyrics.length - 1].endTime 
        : 0,
      endTime: currentProject.lyrics.length > 0 
        ? currentProject.lyrics[currentProject.lyrics.length - 1].endTime + 3 
        : 3,
      confidence: 1,
    }
    updateLyrics([...currentProject.lyrics, newLine])
  }

  const handleEdit = (line: LyricLine) => {
    setEditingId(line.id)
    setEditText(line.text)
  }

  const handleSave = (id: string) => {
    const updatedLyrics = currentProject.lyrics.map(line =>
      line.id === id ? { ...line, text: editText } : line
    )
    updateLyrics(updatedLyrics)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    const updatedLyrics = currentProject.lyrics.filter(line => line.id !== id)
    updateLyrics(updatedLyrics)
  }

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: number) => {
    const updatedLyrics = currentProject.lyrics.map(line =>
      line.id === id ? { ...line, [field]: value } : line
    )
    updateLyrics(updatedLyrics)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Lyrics</h3>
        <button
          onClick={handleAddLine}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Line
        </button>
      </div>

      {currentProject.lyrics.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No lyrics yet</p>
          <p className="text-xs mt-1">Add lines manually or use auto-transcription</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentProject.lyrics.map((line, index) => (
            <div
              key={line.id}
              className="p-3 rounded-lg bg-gray-800 border border-gray-700 space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 font-mono w-6">
                  {index + 1}
                </span>
                
                {editingId === line.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => handleSave(line.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(line.id)}
                    className="flex-1 px-2 py-1 bg-gray-900 rounded border border-gray-600 focus:border-purple-500 outline-none text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="flex-1 text-sm">{line.text}</p>
                )}

                <button
                  onClick={() => handleEdit(line)}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                
                <button
                  onClick={() => handleDelete(line.id)}
                  className="p-1 rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <label className="text-gray-500">Start:</label>
                  <input
                    type="number"
                    value={line.startTime.toFixed(2)}
                    onChange={(e) => handleTimeChange(line.id, 'startTime', parseFloat(e.target.value))}
                    step="0.1"
                    className="w-16 px-1 py-0.5 bg-gray-900 rounded border border-gray-700 focus:border-purple-500 outline-none font-mono"
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <label className="text-gray-500">End:</label>
                  <input
                    type="number"
                    value={line.endTime.toFixed(2)}
                    onChange={(e) => handleTimeChange(line.id, 'endTime', parseFloat(e.target.value))}
                    step="0.1"
                    className="w-16 px-1 py-0.5 bg-gray-900 rounded border border-gray-700 focus:border-purple-500 outline-none font-mono"
                  />
                </div>

                {line.confidence !== undefined && line.confidence < 0.8 && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-400 text-xs">
                    Low confidence
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-gray-800">
        <button
          disabled
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed text-sm flex items-center justify-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Auto-Transcribe (Coming Soon)
        </button>
      </div>
    </div>
  )
}

function Wand2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  )
}
