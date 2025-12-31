import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { AudioPlayer } from '../../utils/audio'
import CanvasRenderer from './CanvasRenderer'

export default function VideoPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioPlayerRef = useRef<AudioPlayer | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1080, height: 1920 })
  
  const currentProject = useProjectStore(state => state.currentProject)
  const isPlaying = useProjectStore(state => state.isPlaying)
  const currentTime = useProjectStore(state => state.currentTime)
  const setIsPlaying = useProjectStore(state => state.setIsPlaying)
  const setCurrentTime = useProjectStore(state => state.setCurrentTime)

  useEffect(() => {
    if (!currentProject) return

    const audioPlayer = new AudioPlayer()
    audioPlayerRef.current = audioPlayer

    audioPlayer.load(currentProject.audioUrl)
    audioPlayer.setVolume(currentProject.settings.volume)
    
    audioPlayer.onTimeUpdate((time) => {
      setCurrentTime(time)
    })

    audioPlayer.onEnded(() => {
      setIsPlaying(false)
    })

    return () => {
      audioPlayer.destroy()
    }
  }, [currentProject?.id])

  useEffect(() => {
    if (!audioPlayerRef.current) return

    if (isPlaying) {
      audioPlayerRef.current.play()
    } else {
      audioPlayerRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!currentProject) return

    const format = currentProject.settings.videoFormat
    switch (format) {
      case '9:16':
        setDimensions({ width: 1080, height: 1920 })
        break
      case '1:1':
        setDimensions({ width: 1080, height: 1080 })
        break
      case '16:9':
        setDimensions({ width: 1920, height: 1080 })
        break
    }
  }, [currentProject?.settings.videoFormat])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!currentProject) return null

  const aspectRatio = dimensions.height / dimensions.width
  const displayWidth = Math.min(600, window.innerWidth * 0.5)
  const displayHeight = displayWidth * aspectRatio

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      {/* Canvas Container */}
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl border border-gray-800"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <CanvasRenderer
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          project={currentProject}
          currentTime={currentTime}
          audioPlayer={audioPlayerRef.current}
          isPlaying={isPlaying}
        />

        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Time Display */}
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-black/50 backdrop-blur text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(currentProject.duration)}
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
