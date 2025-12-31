/**
 * Vercel Serverless Function: Audio Transcription
 * Proxies requests to Google Gemini API
 */

import { NextRequest, NextResponse } from 'next/server'

interface TranscriptionRequestBody {
  audioData: string
  language?: string
  model?: string
}

interface TranscriptionSegment {
  text: string
  startMs: number
  endMs: number
  confidence?: number
}

interface TranscriptionResponse {
  segments: TranscriptionSegment[]
  fullText: string
  confidence: number
}

export async function POST(req: NextRequest) {
  try {
    const body: TranscriptionRequestBody = await req.json()
    const { audioData, language = 'en', model = 'gemini-2.0-flash' } = body

    if (!audioData) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'audioData is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured')
      return NextResponse.json(
        { error: 'Configuration Error', message: 'Transcription service not configured' },
        { status: 500 }
      )
    }

    // Call Google Gemini API for audio transcription
    // Note: This is a placeholder implementation
    // You'll need to use the actual Gemini API endpoints for audio processing

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              inline_data: {
                mime_type: 'audio/mpeg',
                data: audioData.split(',')[1], // Remove data URL prefix
              }
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json(
        { error: 'Transcription Failed', message: 'Failed to process audio' },
        { status: response.status }
      )
    }

    const result = await response.json()

    // Parse Gemini response and convert to our format
    // This depends on the actual Gemini API response structure
    const transcriptionResult = parseGeminiResponse(result)

    return NextResponse.json(transcriptionResult)

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred during transcription' },
      { status: 500 }
    )
  }
}

/**
 * Parse Gemini API response and convert to transcription format
 */
function parseGeminiResponse(_result: unknown): TranscriptionResponse {
  // TODO: Implement actual parsing based on Gemini API response structure
  // This is a placeholder that returns mock data

  const mockSegments: TranscriptionSegment[] = [
    { text: "Don't you", startMs: 0, endMs: 500, confidence: 0.95 },
    { text: "ever let it go", startMs: 500, endMs: 1200, confidence: 0.98 },
    { text: "I won't let it go", startMs: 1200, endMs: 2000, confidence: 0.97 },
  ]

  return {
    segments: mockSegments,
    fullText: mockSegments.map(s => s.text).join(' '),
    confidence: 0.96,
  }
}

// For Vercel Edge Runtime
export const runtime = 'edge'
