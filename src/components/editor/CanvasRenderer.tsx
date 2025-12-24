import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'
import { Project } from '../../types'
import { AudioPlayer } from '../../utils/audio'

interface CanvasRendererProps {
  width: number
  height: number
  project: Project
  currentTime: number
  audioPlayer: AudioPlayer | null
}

const CanvasRenderer = forwardRef<HTMLCanvasElement, CanvasRendererProps>(
  ({ width, height, project, currentTime, audioPlayer }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number>()

    useImperativeHandle(ref, () => canvasRef.current!)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const render = () => {
        ctx.clearRect(0, 0, width, height)

        // Background
        renderBackground(ctx, width, height, project, audioPlayer)

        // Lyrics
        renderLyrics(ctx, width, height, project, currentTime)

        // Watermark
        if (project.settings.watermarkEnabled) {
          renderWatermark(ctx, width, height, project)
        }

        animationFrameRef.current = requestAnimationFrame(render)
      }

      render()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [width, height, project, currentTime, audioPlayer])

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    )
  }
)

CanvasRenderer.displayName = 'CanvasRenderer'

function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Project,
  audioPlayer: AudioPlayer | null
) {
  const { backgroundType, backgroundColor, backgroundGradient, visualizerStyle } = project.settings

  if (backgroundType === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    backgroundGradient.forEach((color, i) => {
      gradient.addColorStop(i / (backgroundGradient.length - 1), color)
    })
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  // Visualizer
  if (visualizerStyle !== 'none' && audioPlayer) {
    renderVisualizer(ctx, width, height, project, audioPlayer)
  }
}

function renderVisualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Project,
  audioPlayer: AudioPlayer
) {
  const analyser = audioPlayer.getAnalyser()
  if (!analyser) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  const { visualizerStyle, visualizerIntensity, visualizerColor } = project.settings
  const intensity = visualizerIntensity / 100

  ctx.globalAlpha = 0.7 * intensity

  switch (visualizerStyle) {
    case 'circular':
      renderCircularVisualizer(ctx, width, height, dataArray, visualizerColor)
      break
    case 'wave':
      renderWaveVisualizer(ctx, width, height, dataArray, visualizerColor)
      break
    case 'bars':
      renderBarsVisualizer(ctx, width, height, dataArray, visualizerColor)
      break
    case 'mirror':
      renderMirrorVisualizer(ctx, width, height, dataArray, visualizerColor)
      break
  }

  ctx.globalAlpha = 1
}

function renderCircularVisualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  color: string
) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.3
  const bars = 64

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2
    const dataIndex = Math.floor((i / bars) * dataArray.length)
    const value = dataArray[dataIndex] / 255
    const barLength = value * radius * 0.5

    const x1 = centerX + Math.cos(angle) * radius
    const y1 = centerY + Math.sin(angle) * radius
    const x2 = centerX + Math.cos(angle) * (radius + barLength)
    const y2 = centerY + Math.sin(angle) * (radius + barLength)

    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

function renderWaveVisualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  color: string
) {
  const sliceWidth = width / dataArray.length
  let x = 0

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 255
    const y = height / 2 + (v * height * 0.3 * (i % 2 === 0 ? 1 : -1))

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    x += sliceWidth
  }

  ctx.stroke()
}

function renderBarsVisualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  color: string
) {
  const bars = 32
  const barWidth = width / bars
  const bottomY = height * 0.8

  for (let i = 0; i < bars; i++) {
    const dataIndex = Math.floor((i / bars) * dataArray.length)
    const value = dataArray[dataIndex] / 255
    const barHeight = value * height * 0.5

    ctx.fillStyle = color
    ctx.fillRect(i * barWidth, bottomY - barHeight, barWidth - 2, barHeight)
  }
}

function renderMirrorVisualizer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  color: string
) {
  const bars = 32
  const barWidth = width / bars
  const centerY = height / 2

  for (let i = 0; i < bars; i++) {
    const dataIndex = Math.floor((i / bars) * dataArray.length)
    const value = dataArray[dataIndex] / 255
    const barHeight = value * height * 0.25

    ctx.fillStyle = color
    ctx.fillRect(i * barWidth, centerY - barHeight / 2, barWidth - 2, barHeight)
  }
}

function renderLyrics(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Project,
  currentTime: number
) {
  const { lyrics, settings } = project
  const currentLine = lyrics.find(
    line => currentTime >= line.startTime && currentTime <= line.endTime
  )

  if (!currentLine) return

  const {
    fontFamily,
    fontSize,
    fontWeight,
    textColor,
    textAlign,
    textStroke,
    textStrokeWidth,
    textStrokeColor,
    textShadow,
    textGlow,
    captionPosition,
    captionYOffset,
    animationStyle,
    animationDuration,
  } = settings

  // Calculate animation progress
  const progress = (currentTime - currentLine.startTime) / (animationDuration / 1000)
  const animProgress = Math.min(1, Math.max(0, progress))

  // Set font
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = textAlign as CanvasTextAlign
  ctx.textBaseline = 'middle'

  // Calculate position
  let x = width / 2
  if (textAlign === 'left') x = width * 0.1
  if (textAlign === 'right') x = width * 0.9

  let y = height / 2
  if (captionPosition === 'top') y = captionYOffset
  if (captionPosition === 'bottom') y = height - captionYOffset

  // Apply animation
  ctx.save()
  applyAnimation(ctx, x, y, animProgress, animationStyle)

  // Text shadow
  if (textShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 3
  }

  // Text glow
  if (textGlow) {
    ctx.shadowColor = textColor
    ctx.shadowBlur = 20
  }

  // Stroke
  if (textStroke) {
    ctx.strokeStyle = textStrokeColor
    ctx.lineWidth = textStrokeWidth
    ctx.strokeText(currentLine.text, x, y)
  }

  // Fill
  ctx.fillStyle = textColor
  ctx.fillText(currentLine.text, x, y)

  ctx.restore()
}

function applyAnimation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  style: string
) {
  ctx.translate(x, y)

  switch (style) {
    case 'fade':
      ctx.globalAlpha = progress
      break
    case 'scale':
      const scale = 0.5 + progress * 0.5
      ctx.scale(scale, scale)
      break
    case 'slide':
      ctx.translate(0, (1 - progress) * -50)
      break
    case 'bounce':
      const bounce = Math.sin(progress * Math.PI) * 10
      ctx.translate(0, -bounce)
      break
  }

  ctx.translate(-x, -y)
}

function renderWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Project
) {
  const { watermarkText, watermarkPosition, watermarkOpacity } = project.settings

  if (!watermarkText) return

  ctx.save()
  ctx.globalAlpha = watermarkOpacity
  ctx.font = '16px Inter'
  ctx.fillStyle = '#ffffff'

  const padding = 20
  const textWidth = ctx.measureText(watermarkText).width

  let x = padding
  let y = padding

  switch (watermarkPosition) {
    case 'topRight':
      x = width - textWidth - padding
      break
    case 'bottomLeft':
      y = height - padding
      break
    case 'bottomRight':
      x = width - textWidth - padding
      y = height - padding
      break
  }

  ctx.fillText(watermarkText, x, y)
  ctx.restore()
}

export default CanvasRenderer
