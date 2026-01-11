import { getMockTranscription, type TranscriptionResponse } from '@/mocks/aiMocks';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

export interface TranscriptionResult {
  success: boolean;
  transcription?: TranscriptionResponse;
  error?: string;
}

export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
  
  if (useMocks) {
    console.log('[Mock Mode] Simulating transcription...');
    const transcription = await getMockTranscription();
    return {
      success: true,
      transcription
    };
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const groq = new Groq({ apiKey: groqApiKey });

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.status}`);
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const tempFilePath = path.join(tmpdir(), `audio-${Date.now()}.mp3`);
    
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-large-v3',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      fs.unlinkSync(tempFilePath);

      // @ts-ignore - Groq SDK types don't include verbose_json response fields
      const result: TranscriptionResponse = {
        text: transcription.text,
        // @ts-ignore
        segments: transcription.segments || [],
        // @ts-ignore
        words: transcription.words || [],
        // @ts-ignore
        language: transcription.language || 'en',
        // @ts-ignore
        duration: transcription.duration || 0
      };

      return {
        success: true,
        transcription: result
      };

    } catch (transcriptionError) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw transcriptionError;
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('[Transcription Service] Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred during transcription'
    };
  }
}
