import { Preset } from '../types'

export const PRESETS: Preset[] = [
  {
    id: 'tiktok-hook',
    name: '2025 TikTok Hook',
    description: 'Bold, punchy text with kinetic animations',
    thumbnail: '🎯',
    settings: {
      fontFamily: 'Inter',
      fontSize: 56,
      fontWeight: 900,
      textColor: '#ffffff',
      textStroke: true,
      textStrokeWidth: 3,
      textStrokeColor: '#000000',
      textGlow: true,
      animationStyle: 'bounce',
      animationDuration: 200,
      captionPosition: 'center',
      backgroundType: 'gradient',
      backgroundGradient: ['#ff006e', '#8338ec', '#3a86ff'],
      visualizerStyle: 'circular',
      visualizerIntensity: 70,
    }
  },
  {
    id: 'reels-emotional',
    name: 'Reels Emotional',
    description: 'Soft, elegant fades for heartfelt lyrics',
    thumbnail: '💜',
    settings: {
      fontFamily: 'Georgia',
      fontSize: 44,
      fontWeight: 400,
      textColor: '#f8f9fa',
      textStroke: false,
      textShadow: true,
      animationStyle: 'fade',
      animationDuration: 500,
      captionPosition: 'center',
      backgroundType: 'gradient',
      backgroundGradient: ['#2d3561', '#c05299', '#ff6c00'],
      visualizerStyle: 'wave',
      visualizerIntensity: 30,
    }
  },
  {
    id: 'brat-summer',
    name: 'Brat Summer',
    description: 'Lime green, maximalist, chaotic energy',
    thumbnail: '🟩',
    settings: {
      fontFamily: 'Arial',
      fontSize: 52,
      fontWeight: 900,
      textColor: '#000000',
      textStroke: false,
      animationStyle: 'slide',
      animationDuration: 150,
      captionPosition: 'bottom',
      backgroundType: 'gradient',
      backgroundGradient: ['#8ace00', '#bfff00'],
      visualizerStyle: 'bars',
      visualizerIntensity: 90,
      visualizerColor: '#000000',
    }
  },
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill',
    description: 'Mellow vibes with subtle grain',
    thumbnail: '🌙',
    settings: {
      fontFamily: 'Courier New',
      fontSize: 40,
      fontWeight: 400,
      textColor: '#ffeaa7',
      textStroke: false,
      textShadow: true,
      animationStyle: 'typewriter',
      animationDuration: 400,
      captionPosition: 'bottom',
      backgroundType: 'gradient',
      backgroundGradient: ['#0f0c29', '#302b63', '#24243e'],
      visualizerStyle: 'wave',
      visualizerIntensity: 40,
    }
  },
  {
    id: 'neon-club',
    name: 'Neon Club',
    description: 'High-energy EDM with strobing effects',
    thumbnail: '⚡',
    settings: {
      fontFamily: 'Impact',
      fontSize: 60,
      fontWeight: 900,
      textColor: '#00ffff',
      textStroke: true,
      textStrokeWidth: 4,
      textStrokeColor: '#ff00ff',
      textGlow: true,
      animationStyle: 'scale',
      animationDuration: 100,
      captionPosition: 'center',
      backgroundType: 'gradient',
      backgroundGradient: ['#000000', '#1a0033', '#330066'],
      visualizerStyle: 'circular',
      visualizerIntensity: 100,
      visualizerColor: '#ff00ff',
    }
  },
]

export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find(p => p.id === id)
}
