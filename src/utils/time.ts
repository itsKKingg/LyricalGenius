/**
 * Time formatting and conversion utilities
 */

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

export function formatTimecode(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
}

export function parseTimecode(timecode: string): number {
  const parts = timecode.split(':').map(Number)
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 4) {
    // HH:MM:SS:MS
    return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / 100
  }
  return 0
}

export function secondsToMs(seconds: number): number {
  return Math.round(seconds * 1000)
}

export function msToSeconds(ms: number): number {
  return ms / 1000
}
