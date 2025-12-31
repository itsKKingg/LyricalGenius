// Cloudflare Pages Function for voiceover generation
export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL', model = 'eleven_monolingual_v1' } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Bad request', message: 'text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error', message: 'ELEVENLABS_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
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
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Estimate duration (rough calculation - 150 words per minute average speech)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60 * 1000; // in milliseconds

    return new Response(
      JSON.stringify({
        audioData: `data:audio/mpeg;base64,${base64Audio}`,
        duration: estimatedDuration,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const err = error as Error;
    console.error('Voiceover generation error:', err);
    return new Response(
      JSON.stringify({
        error: 'Voiceover generation failed',
        message: err.message || 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
