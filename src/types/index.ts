export interface Project {
  id: string
  name: string
  audioUrl: string
  audioFile: File | null
  duration: number
  waveformData: number[]
  lyrics: LyricLine[]
  settings: ProjectSettings
  createdAt: number
  updatedAt: number
  thumbnail?: string
  albumArt?: string
}

export interface LyricLine {
  id: string
  text: string
  startTime: number
  endTime: number
  words?: LyricWord[]
  confidence?: number
}

export interface LyricWord {
  text: string
  startTime: number
  endTime: number
  confidence?: number
}

export interface ProjectSettings {
  videoFormat: '9:16' | '1:1' | '16:9'
  resolution: '1080p' | '720p' | '480p'
  fps: 30 | 60
  
  // Text styling
  fontFamily: string
  fontSize: number
  fontWeight: number
  textColor: string
  textAlign: 'left' | 'center' | 'right'
  textStroke: boolean
  textStrokeWidth: number
  textStrokeColor: string
  textShadow: boolean
  textGlow: boolean
  letterSpacing: number
  lineHeight: number
  
  // Animations
  animationStyle: 'fade' | 'scale' | 'slide' | 'bounce' | 'typewriter' | 'karaoke' | 'none'
  animationDuration: number
  
  // Caption positioning
  captionPosition: 'bottom' | 'center' | 'top'
  captionYOffset: number
  
  // Background
  backgroundType: 'gradient' | 'image' | 'albumArt' | 'video' | 'visualizer'
  backgroundColor: string
  backgroundGradient: string[]
  backgroundImage?: string
  backgroundBlur: number
  
  // Visualizer
  visualizerStyle: 'circular' | 'wave' | 'bars' | 'mirror' | 'none'
  visualizerIntensity: number
  visualizerColor: string
  
  // Watermark
  watermarkEnabled: boolean
  watermarkText: string
  watermarkPosition: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  watermarkOpacity: number
  
  // Audio
  volume: number
  
  // Preset
  preset?: string
}

export interface Preset {
  id: string
  name: string
  description: string
  thumbnail: string
  settings: Partial<ProjectSettings>
}

export interface ExportOptions {
  format: 'mp4' | 'gif'
  quality: 'high' | 'medium' | 'low'
  startTime?: number
  endTime?: number
}

export interface BatchJob {
  id: string
  projects: Project[]
  sharedSettings: Partial<ProjectSettings>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  currentIndex: number
}
