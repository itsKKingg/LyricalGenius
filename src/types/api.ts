/**
 * API response types
 */

export interface TranscriptionRequest {
  audioData: string // base64-encoded audio
  language?: string
  model?: string
}

export interface TranscriptionSegment {
  text: string
  startMs: number
  endMs: number
  confidence?: number
}

export interface TranscriptionResponse {
  segments: TranscriptionSegment[]
  fullText: string
  confidence: number
}

export interface TranscriptionError {
  error: string
  message: string
}

export type TranscriptionResult = TranscriptionResponse | TranscriptionError
