import { LyricLine } from '../types'

export const DEMO_LYRICS: LyricLine[] = [
  {
    id: '1',
    text: "I'm gonna take my time",
    startTime: 0.5,
    endTime: 2.5,
    confidence: 0.95,
  },
  {
    id: '2',
    text: 'Walking through the city lights',
    startTime: 2.8,
    endTime: 5.0,
    confidence: 0.92,
  },
  {
    id: '3',
    text: 'Every step feels right',
    startTime: 5.3,
    endTime: 7.2,
    confidence: 0.89,
  },
  {
    id: '4',
    text: 'Dancing in the moonlight',
    startTime: 7.5,
    endTime: 9.8,
    confidence: 0.94,
  },
  {
    id: '5',
    text: "We're gonna make it tonight",
    startTime: 10.0,
    endTime: 12.5,
    confidence: 0.91,
  },
  {
    id: '6',
    text: 'Nothing can stop us now',
    startTime: 12.8,
    endTime: 15.0,
    confidence: 0.88,
  },
  {
    id: '7',
    text: 'Living in the moment',
    startTime: 15.3,
    endTime: 17.5,
    confidence: 0.93,
  },
  {
    id: '8',
    text: 'This is our time to shine',
    startTime: 17.8,
    endTime: 20.0,
    confidence: 0.96,
  },
]

export function generateDemoWaveform(duration: number, samples: number = 1000): number[] {
  const waveform: number[] = []
  
  for (let i = 0; i < samples; i++) {
    const progress = i / samples
    const time = progress * duration
    
    // Create a more interesting waveform with multiple frequency components
    const bass = Math.sin(time * 2) * 0.3
    const mid = Math.sin(time * 4) * 0.4
    const high = Math.sin(time * 8) * 0.2
    const noise = Math.random() * 0.1
    
    const value = Math.abs(bass + mid + high + noise)
    waveform.push(Math.min(1, value))
  }
  
  return waveform
}
