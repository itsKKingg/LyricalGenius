import { useRef, useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'

export default function Timeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const currentProject = useProjectStore(state => state.currentProject)
  const isPlaying = useProjectStore(state => state.isPlaying)
  const currentTime = useProjectStore(state => state.currentTime)
  const setIsPlaying = useProjectStore(state => state.setIsPlaying)
  const setCurrentTime = useProjectStore(state => state.setCurrentTime)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentProject) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = 100

    renderTimeline(ctx, canvas.width, canvas.height, currentProject.waveformData, currentProject.duration, currentTime)
  }, [currentProject, currentTime])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentProject || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    const newTime = ratio * currentProject.duration

    setCurrentTime(newTime)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
    setIsPlaying(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !currentProject || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    const newTime = ratio * currentProject.duration

    setCurrentTime(newTime)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const skipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 5))
  }

  const skipForward = () => {
    if (!currentProject) return
    setCurrentTime(Math.min(currentProject.duration, currentTime + 5))
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!currentProject) return null

  return (
    <div className="h-40 border-t border-gray-800 bg-gray-900 flex flex-col">
      {/* Controls */}
      <div className="h-12 flex items-center justify-center gap-4 border-b border-gray-800">
        <button
          onClick={skipBackward}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={togglePlayPause}
          className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        
        <button
          onClick={skipForward}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <div className="ml-8 font-mono text-sm text-gray-400">
          {formatTime(currentTime)} / {formatTime(currentProject.duration)}
        </div>
      </div>

      {/* Waveform */}
      <div ref={containerRef} className="flex-1 relative cursor-pointer">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

function renderTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  waveformData: number[],
  duration: number,
  currentTime: number
) {
  ctx.clearRect(0, 0, width, height)

  // Background
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, width, height)

  // Waveform
  if (waveformData.length > 0) {
    const barWidth = width / waveformData.length
    const maxHeight = height * 0.8
    const centerY = height / 2

    waveformData.forEach((value, i) => {
      const barHeight = value * maxHeight
      const x = i * barWidth
      const y = centerY - barHeight / 2

      const progress = (i / waveformData.length) * duration
      const isPast = progress <= currentTime

      ctx.fillStyle = isPast ? '#8b5cf6' : '#374151'
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }

  // Playhead
  const playheadX = (currentTime / duration) * width
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(playheadX, 0)
  ctx.lineTo(playheadX, height)
  ctx.stroke()

  // Playhead handle
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(playheadX, 10, 6, 0, Math.PI * 2)
  ctx.fill()
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
