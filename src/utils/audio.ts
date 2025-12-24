export async function extractAudioMetadata(file: File): Promise<{
  duration: number
  albumArt?: string
}> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration
      URL.revokeObjectURL(url)
      resolve({ duration })
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio file'))
    })
    
    audio.src = url
  })
}

export async function generateWaveformData(
  audioBuffer: AudioBuffer,
  samples: number = 1000
): Promise<number[]> {
  const rawData = audioBuffer.getChannelData(0)
  const blockSize = Math.floor(rawData.length / samples)
  const waveformData: number[] = []
  
  for (let i = 0; i < samples; i++) {
    const start = blockSize * i
    let sum = 0
    
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[start + j])
    }
    
    waveformData.push(sum / blockSize)
  }
  
  return waveformData
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()
  return await audioContext.decodeAudioData(arrayBuffer)
}

export async function detectBeats(audioBuffer: AudioBuffer): Promise<number[]> {
  const data = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const beats: number[] = []
  
  const windowSize = Math.floor(sampleRate * 0.05)
  const threshold = 0.5
  
  for (let i = windowSize; i < data.length - windowSize; i += windowSize) {
    let sum = 0
    for (let j = i; j < i + windowSize; j++) {
      sum += Math.abs(data[j])
    }
    const avg = sum / windowSize
    
    if (avg > threshold) {
      const time = i / sampleRate
      if (beats.length === 0 || time - beats[beats.length - 1] > 0.2) {
        beats.push(time)
      }
    }
  }
  
  return beats
}

export class AudioPlayer {
  private audio: HTMLAudioElement
  private analyser: AnalyserNode | null = null
  private audioContext: AudioContext | null = null
  private source: MediaElementAudioSourceNode | null = null
  
  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'
  }
  
  async load(url: string): Promise<void> {
    this.audio.src = url
    await this.audio.load()
  }
  
  play(): void {
    this.audio.play()
  }
  
  pause(): void {
    this.audio.pause()
  }
  
  stop(): void {
    this.audio.pause()
    this.audio.currentTime = 0
  }
  
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }
  
  setCurrentTime(time: number): void {
    this.audio.currentTime = time
  }
  
  getCurrentTime(): number {
    return this.audio.currentTime
  }
  
  getDuration(): number {
    return this.audio.duration
  }
  
  onTimeUpdate(callback: (time: number) => void): void {
    this.audio.addEventListener('timeupdate', () => {
      callback(this.audio.currentTime)
    })
  }
  
  onEnded(callback: () => void): void {
    this.audio.addEventListener('ended', callback)
  }
  
  getAnalyser(): AnalyserNode | null {
    if (!this.analyser) {
      try {
        this.audioContext = new AudioContext()
        this.source = this.audioContext.createMediaElementSource(this.audio)
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 2048
        this.source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)
      } catch (error) {
        console.error('Failed to create audio analyser:', error)
        return null
      }
    }
    return this.analyser
  }
  
  destroy(): void {
    this.audio.pause()
    this.audio.src = ''
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}
