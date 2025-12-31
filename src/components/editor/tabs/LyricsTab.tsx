import { useState } from 'react'
import { Plus, Edit2, Trash2, AlertCircle, Wand2, Loader2, X, Upload } from 'lucide-react'
import { useProjectStore } from '../../../stores/projectStore'
import { LyricLine } from '../../../types'
import { transcribeAudio } from '../../../api/transcribe'
import { msToSeconds } from '../../../utils/time'

export default function LyricsTab() {
  const currentProject = useProjectStore(state => state.currentProject)
  const updateLyrics = useProjectStore(state => state.updateLyrics)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Auto-transcribe state
  const [showAutoTranscribe, setShowAutoTranscribe] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [transcriptionProgress, setTranscriptionProgress] = useState(0)
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('en')
  const [error, setError] = useState<string | null>(null)

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

  const handleAutoTranscribe = async () => {
    const audioToProcess = selectedAudioFile || currentProject.audioFile

    if (!audioToProcess) {
      setError('Please select an audio file first')
      return
    }

    setTranscribing(true)
    setError(null)
    setTranscriptionProgress(10)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => {
          if (prev < 70) return prev + 10
          return prev
        })
      }, 500)

      const result = await transcribeAudio(audioToProcess, language)

      clearInterval(progressInterval)
      setTranscriptionProgress(90)

      // Convert API response to LyricLine format
      const newLyrics: LyricLine[] = result.segments.map((segment) => ({
        id: crypto.randomUUID(),
        text: segment.text,
        startTime: msToSeconds(segment.startMs),
        endTime: msToSeconds(segment.endMs),
        confidence: segment.confidence,
      }))

      updateLyrics(newLyrics)
      setTranscriptionProgress(100)

      // Close modal after a short delay
      setTimeout(() => {
        setShowAutoTranscribe(false)
        setTranscribing(false)
        setTranscriptionProgress(0)
        setSelectedAudioFile(null)
      }, 1000)

    } catch (err) {
      console.error('Transcription failed:', err)
      setError(err instanceof Error ? err.message : 'Transcription failed')
      setTranscribing(false)
      setTranscriptionProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedAudioFile(file)
      setError(null)
    }
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
          onClick={() => setShowAutoTranscribe(true)}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Wand2 className="w-4 h-4" />
          Auto Lyrics
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Upload or select audio to auto-generate timed lyrics
        </p>
      </div>

      {/* Auto-Transcribe Modal */}
      {showAutoTranscribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h2 className="font-semibold">Auto Lyrics Generator</h2>
              </div>
              <button
                onClick={() => !transcribing && setShowAutoTranscribe(false)}
                disabled={transcribing}
                className="p-1 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {!transcribing && transcriptionProgress === 0 && (
                <>
                  {/* File Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Audio File</label>
                    {currentProject.audioFile && !selectedAudioFile && (
                      <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 mb-2">
                        <p className="text-sm text-gray-300 mb-1">Current Project Audio:</p>
                        <p className="text-xs text-gray-500 truncate">{currentProject.audioFile.name}</p>
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        disabled={transcribing}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label
                        htmlFor="audio-upload"
                        className={`
                          flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed
                          transition-colors cursor-pointer
                          ${selectedAudioFile
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">
                          {selectedAudioFile
                            ? selectedAudioFile.name
                            : 'Or upload a different file'
                          }
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={transcribing}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-900/30 border border-red-800">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={handleAutoTranscribe}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate Lyrics
                  </button>
                </>
              )}

              {/* Progress State */}
              {transcribing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-medium">Transcribing Audio...</p>
                    <p className="text-sm text-gray-400">
                      This may take a few moments
                    </p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${transcriptionProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-gray-500">
                    {transcriptionProgress}% complete
                  </p>
                </div>
              )}

              {/* Success State */}
              {transcriptionProgress === 100 && !transcribing && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-green-400">Lyrics Generated!</p>
                    <p className="text-sm text-gray-400">
                      {currentProject.lyrics.length} lyric lines created
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
