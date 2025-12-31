import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only POST requests are supported' });
  }

  try {
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL', model = 'eleven_monolingual_v1' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Bad request', message: 'text is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error', message: 'ELEVENLABS_API_KEY not configured' });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'ElevenLabs API error');
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Estimate duration (rough calculation - 150 words per minute average speech)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60 * 1000; // in milliseconds

    return res.status(200).json({
      audioData: `data:audio/mpeg;base64,${base64Audio}`,
      duration: estimatedDuration,
    });

  } catch (error: any) {
    console.error('Voiceover generation error:', error);
    return res.status(500).json({
      error: 'Voiceover generation failed',
      message: error.message || 'An unknown error occurred',
    });
  }
}
