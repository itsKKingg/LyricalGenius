import { getMockIsolatedVocals } from '@/mocks/aiMocks';

export interface IsolationResult {
  success: boolean;
  vocalsUrl?: string;
  error?: string;
}

const ISOLATION_TIMEOUT = 30000;

export async function isolateVocals(audioUrl: string): Promise<IsolationResult> {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
  
  if (useMocks) {
    console.log('[Mock Mode] Simulating vocal isolation...');
    const vocalsUrl = await getMockIsolatedVocals();
    return {
      success: true,
      vocalsUrl
    };
  }

  try {
    const huggingFaceToken = process.env.HUGGINGFACE_API_KEY;
    
    if (!huggingFaceToken) {
      throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ISOLATION_TIMEOUT);

    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/demucs',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: audioUrl,
          options: {
            wait_for_model: true
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result || !result.vocals_url) {
      throw new Error('Invalid response from Hugging Face API - no vocals URL returned');
    }

    return {
      success: true,
      vocalsUrl: result.vocals_url
    };

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Vocal isolation timed out after 30 seconds'
        };
      }
      
      console.error('[Isolation Service] Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred during vocal isolation'
    };
  }
}
