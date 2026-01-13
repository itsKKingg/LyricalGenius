import { createClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';
import { z } from 'zod';

export const AudioMetadataSchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  bpm: z.number().int().positive().optional().nullable(),
});

export type AudioMetadata = z.infer<typeof AudioMetadataSchema>;

export class AIOrchestrator {
  async processAudio(
    audioData: Buffer | Blob,
    fileName: string,
    metadata: unknown,
    userId: string
  ) {
    const supabase = createClient();

    // 1. Validate metadata
    const validatedMetadata = AudioMetadataSchema.parse(metadata);

    // 2. Create project entry
    const { data: project, error: projectError } = await (supabase as any)
      .from('projects')
      .insert({
        user_id: userId,
        song_title: validatedMetadata.title,
        artist_name: validatedMetadata.artist,
        bpm: validatedMetadata.bpm,
        status: 'pending',
      })
      .select()
      .single();

    if (projectError) throw new Error(`Failed to create project: ${projectError.message}`);

    try {
      // 3. Upload raw audio to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('raw-audio')
        .upload(`${userId}/${project.id}/${fileName}`, audioData, {
          contentType: 'audio/mpeg',
        });

      if (storageError) throw new Error(`Failed to upload audio: ${storageError.message}`);

      // Update status to processing
      await (supabase as any).from('projects').update({ status: 'processing' }).eq('id', project.id);

      let audioForTranscription: Buffer | Blob = audioData;
      let usedFallback = false;

      // 4. Vocal Isolation (Hugging Face) with Circuit Breaker
      if (env.HF_TOKEN) {
        try {
          audioForTranscription = await this.isolateVocals(audioData);
        } catch (error) {
          console.error('HF Vocal Isolation failed, using fallback:', error);
          usedFallback = true;
          // Fallback to original audio data
          audioForTranscription = audioData;
        }
      } else {
        console.warn('HF_TOKEN not set, skipping vocal isolation');
        usedFallback = true;
      }

      // 5. Groq Whisper for word-level timestamps
      const timedJson = await this.getTimestamps(audioForTranscription);

      // 6. Update project with results
      const { error: updateError } = await (supabase as any)
        .from('projects')
        .update({
          timed_json: timedJson as any,
          status: 'completed',
          processing_notes: usedFallback ? 'Vocal isolation failed, used raw audio instead.' : null,
        })
        .eq('id', project.id);

      if (updateError) throw new Error(`Failed to update project: ${updateError.message}`);

      return { 
        projectId: project.id, 
        timedJson, 
        usedFallback,
        warning: usedFallback ? 'Vocal isolation failed, used raw audio instead.' : undefined
      };
    } catch (error: any) {
      console.error('Processing error:', error);
      await supabase
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      throw error;
    }
  }

  private async isolateVocals(audioData: Buffer | Blob): Promise<Buffer> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/htdemucs', // Example model
      {
        headers: { Authorization: `Bearer ${env.HF_TOKEN}` },
        method: 'POST',
        body: audioData,
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async getTimestamps(audioData: Buffer | Blob): Promise<any> {
    const formData = new FormData();
    const blob = audioData instanceof Buffer 
      ? new Blob([audioData], { type: 'audio/mpeg' }) 
      : audioData;
      
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  }
}
