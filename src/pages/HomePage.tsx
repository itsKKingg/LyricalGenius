import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Mic, Sparkles, Lock, Zap } from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import { extractAudioMetadata, decodeAudioFile, generateWaveformData } from '../utils/audio'

export default function HomePage() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createNewProject = useProjectStore(state => state.createNewProject)
  const updateProject = useProjectStore(state => state.updateProject)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (MP3, WAV, M4A, OGG)')
      return
    }

    setIsProcessing(true)
    try {
      const audioUrl = URL.createObjectURL(file)
      const { duration } = await extractAudioMetadata(file)
      const audioBuffer = await decodeAudioFile(file)
      const waveformData = await generateWaveformData(audioBuffer)
      
      const project = await createNewProject(file, audioUrl)
      updateProject({
        duration,
        waveformData,
      })
      
      navigate(`/editor/${project.id}`)
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Failed to process audio file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            LyricalGenius
          </h1>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          My Projects
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-3xl w-full">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Create Viral{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Lyric Videos
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Professional-grade editor. 100% client-side. No uploads. No subscriptions.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-16 cursor-pointer transition-all
              ${isDragging 
                ? 'border-purple-500 bg-purple-500/10 scale-105' 
                : 'border-gray-700 bg-gray-900/50 hover:border-purple-600 hover:bg-gray-900'
              }
              ${isProcessing ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {isProcessing ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-300">Processing audio...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 animate-glow">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Drop your song here</h3>
                <p className="text-gray-400 mb-4">or click to browse</p>
                <p className="text-sm text-gray-500">MP3, WAV, M4A, OGG supported</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
          </div>

          {/* Alternative Input */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              disabled
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed"
            >
              <Mic className="w-5 h-5" />
              Record from Microphone
              <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Soon</span>
            </button>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <Lock className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold mb-2">100% Private</h4>
              <p className="text-sm text-gray-400">
                All processing happens in your browser. Your music never leaves your device.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <Zap className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-400">
                Powered by WebAssembly and modern browser APIs for instant results.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold mb-2">Viral Presets</h4>
              <p className="text-sm text-gray-400">
                Curated styles for TikTok, Reels, and YouTube Shorts. One-click apply.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        Made with ❤️ for independent artists · No sign-up required · Open source
      </footer>
    </div>
  )
}
