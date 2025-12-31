// Cloudflare Pages Function for transcription
export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { audioData, language = 'en', model = 'gemini-2.0-flash' } = body;

    if (!audioData) {
      return new Response(
        JSON.stringify({ error: 'Bad request', message: 'audioData is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error', message: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert base64 to buffer
    const base64Data = audioData.split(',')[1] || audioData;
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // First, upload the file to Gemini
    const uploadResponse = await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files', {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': buffer.length.toString(),
        'X-Goog-Upload-Header-Content-Type': 'audio/mpeg',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        file: {
          display_name: 'audio_transcription'
        }
      })
    });

    const uploadUrl = uploadResponse.headers.get('X-Goog-Upload-URL');
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL');
    }

    // Upload the actual file
    await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Length': buffer.length.toString(),
        'X-Goog-Upload-Offset': '0',
        'X-Goog-Upload-Command': 'upload, finalize',
      },
      body: buffer,
    });

    // Get the file URI
    const fileResponse = await fetch(uploadUrl + '&alt=json', {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });
    const fileData = await fileResponse.json();
    const fileUri = fileData.file?.uri;

    if (!fileUri) {
      throw new Error('Failed to get file URI');
    }

    // Generate content with transcription prompt
    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                fileData: {
                  mimeType: 'audio/mpeg',
                  fileUri: fileUri
                }
              },
              {
                text: `Transcribe this audio file and return the lyrics with precise timestamps. Format the response as JSON with an array of segments, where each segment has: text (the lyric phrase), startMs (start time in milliseconds), and endMs (end time in milliseconds). Be precise with timing and break lyrics into natural phrases suitable for karaoke-style display. Only return the JSON, no other text.`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 8192,
          }
        }),
      }
    );

    const generateData = await generateResponse.json();
    
    if (!generateData.candidates || generateData.candidates.length === 0) {
      throw new Error('No transcription returned from Gemini');
    }

    const textContent = generateData.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    let segments;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        segments = parsed.segments || parsed;
      } else if (textContent.includes('[')) {
        const arrayMatch = textContent.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          segments = JSON.parse(arrayMatch[0]);
        }
      } else {
        throw new Error('Could not find JSON in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textContent);
      // Fallback: create simple segments from text
      const words = textContent.trim().split(/\s+/);
      const estimatedDuration = 3000;
      const msPerWord = estimatedDuration / words.length;
      
      segments = words.map((word: string, i: number) => ({
        text: word,
        startMs: Math.round(i * msPerWord),
        endMs: Math.round((i + 1) * msPerWord),
      }));
    }

    const fullText = segments.map((s: { text: string }) => s.text).join(' ');

    return new Response(
      JSON.stringify({
        segments,
        fullText,
        confidence: 0.95,
        language: language,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const err = error as Error;
    console.error('Transcription error:', err);
    return new Response(
      JSON.stringify({
        error: 'Transcription failed',
        message: err.message || 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
