import type { VoiceoverRequest, VoiceoverResponse, ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function generateVoiceover(
  text: string,
  voiceId?: string
): Promise<VoiceoverResponse> {
  try {
    const request: VoiceoverRequest = {
      text,
      voiceId,
      model: 'eleven_monolingual_v1',
    };

    const response = await fetch(`${API_BASE_URL}/voiceover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Voiceover generation failed');
    }

    const data: VoiceoverResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Voiceover generation error:', error);
    throw error;
  }
}
