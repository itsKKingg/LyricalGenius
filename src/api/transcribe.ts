/**
 * Audio transcription API utilities
 */

import {
  TranscriptionRequest,
  TranscriptionResponse,
  TranscriptionError,
} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Transcribe audio file using Gemini API
 */
export async function transcribeAudio(
  audioFile: File,
  _language: string = 'en'
): Promise<TranscriptionResponse> {
  try {
    // Convert audio file to base64
    const base64Audio = await fileToBase64(audioFile)

    const requestBody: TranscriptionRequest = {
      audioData: base64Audio,
      language: _language,
      model: 'gemini-2.0-flash',
    }

    // For development, if API_BASE_URL is not configured, use a mock
    if (API_BASE_URL === '/api' && !import.meta.env.PROD) {
      console.warn('API not configured, using mock transcription')
      return mockTranscribe()
    }

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData: TranscriptionError = await response.json()
      throw new Error(errorData.message || 'Transcription failed')
    }

    const data: TranscriptionResponse = await response.json()
    return data
  } catch (error) {
    console.error('Transcription error:', error)
    throw error
  }
}

/**
 * Convert File object to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Mock transcription for development/testing
 * TODO: Remove when real API is available
 */
async function mockTranscribe(): Promise<TranscriptionResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock segments
  const mockSegments = [
    { text: "Don't you", startMs: 0, endMs: 500, confidence: 0.95 },
    { text: "ever let it go", startMs: 500, endMs: 1200, confidence: 0.98 },
    { text: "I won't let it go", startMs: 1200, endMs: 2000, confidence: 0.97 },
    { text: "We're gonna sing", startMs: 2000, endMs: 2800, confidence: 0.99 },
    { text: "and we're gonna dance", startMs: 2800, endMs: 3800, confidence: 0.96 },
    { text: "All night long", startMs: 3800, endMs: 4500, confidence: 0.98 },
    { text: "Until the break of dawn", startMs: 4500, endMs: 5500, confidence: 0.94 },
    { text: "Feel the rhythm", startMs: 5500, endMs: 6200, confidence: 0.97 },
    { text: "Feel the beat", startMs: 6200, endMs: 6900, confidence: 0.98 },
    { text: "Move your body", startMs: 6900, endMs: 7600, confidence: 0.96 },
    { text: "Feel the heat", startMs: 7600, endMs: 8300, confidence: 0.99 },
    { text: "Don't stop moving", startMs: 8300, endMs: 9100, confidence: 0.95 },
    { text: "Keep on grooving", startMs: 9100, endMs: 10000, confidence: 0.97 },
  ]

  return {
    segments: mockSegments,
    fullText: mockSegments.map(s => s.text).join(' '),
    confidence: 0.96,
  }
}
