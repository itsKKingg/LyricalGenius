import type { TranscriptionRequest, TranscriptionResponse, ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function transcribeAudio(
  audioFile: File | Blob,
  language: string = 'en'
): Promise<TranscriptionResponse> {
  try {
    // Convert audio file to base64
    const reader = new FileReader();
    const audioData = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioFile);
    });

    const request: TranscriptionRequest = {
      audioData,
      language,
      model: 'gemini-2.0-flash',
    };

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Transcription failed');
    }

    const data: TranscriptionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}
