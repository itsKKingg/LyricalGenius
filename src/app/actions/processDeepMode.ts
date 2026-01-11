'use server';

import { supabase } from '@/lib/supabaseClient';
import { isolateVocals } from '@/services/ai/isolation.service';
import { transcribeAudio } from '@/services/ai/transcription.service';
import { Database } from '@/types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

export interface ProcessDeepModeResult {
  success: boolean;
  error?: string;
  projectStatus?: string;
}

export async function processDeepMode(
  projectId: string,
  userId: string
): Promise<ProcessDeepModeResult> {

  try {
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !data) {
      return {
        success: false,
        error: 'Project not found or access denied'
      };
    }

    const project = data as ProjectRow;

    if (!project.audio_url) {
      return {
        success: false,
        error: 'No audio file uploaded for this project'
      };
    }

    await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ 
        status: 'isolating',
        error_message: null
      })
      .eq('id', projectId);

    console.log(`[Deep Mode] Starting vocal isolation for project ${projectId}`);
    const isolationResult = await isolateVocals(project.audio_url);

    if (!isolationResult.success || !isolationResult.vocalsUrl) {
      await supabase
        .from('projects')
        // @ts-ignore - Supabase type inference issue with status enum
        .update({ 
          status: 'error',
          error_message: isolationResult.error || 'Vocal isolation failed'
        })
        .eq('id', projectId);

      return {
        success: false,
        error: isolationResult.error || 'Vocal isolation failed',
        projectStatus: 'error'
      };
    }

    await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ 
        isolated_vocals_url: isolationResult.vocalsUrl
      })
      .eq('id', projectId);

    console.log(`[Deep Mode] Vocal isolation complete. Starting transcription for project ${projectId}`);

    await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ status: 'transcribing' })
      .eq('id', projectId);

    const transcriptionResult = await transcribeAudio(isolationResult.vocalsUrl);

    if (!transcriptionResult.success || !transcriptionResult.transcription) {
      await supabase
        .from('projects')
        // @ts-ignore - Supabase type inference issue with status enum
        .update({ 
          status: 'error',
          error_message: transcriptionResult.error || 'Transcription failed'
        })
        .eq('id', projectId);

      return {
        success: false,
        error: transcriptionResult.error || 'Transcription failed',
        projectStatus: 'error'
      };
    }

    const rawText = transcriptionResult.transcription.text;
    const timedJson = {
      text: transcriptionResult.transcription.text,
      segments: transcriptionResult.transcription.segments,
      words: transcriptionResult.transcription.words,
      language: transcriptionResult.transcription.language,
      duration: transcriptionResult.transcription.duration
    };

    const { error: lyricsError } = await supabase
      .from('lyrics_source')
      // @ts-ignore - Supabase type inference issue
      .upsert({
        project_id: projectId,
        raw_text: rawText,
        timed_json: timedJson as any
      }, {
        onConflict: 'project_id'
      });

    if (lyricsError) {
      await supabase
        .from('projects')
        // @ts-ignore - Supabase type inference issue with status enum
        .update({ 
          status: 'error',
          error_message: `Failed to save lyrics: ${lyricsError.message}`
        })
        .eq('id', projectId);

      return {
        success: false,
        error: `Failed to save lyrics: ${lyricsError.message}`,
        projectStatus: 'error'
      };
    }

    await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ status: 'completed' })
      .eq('id', projectId);

    console.log(`[Deep Mode] Processing complete for project ${projectId}`);

    return {
      success: true,
      projectStatus: 'completed'
    };

  } catch (error) {
    console.error('[Deep Mode] Unexpected error:', error);

    await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ 
        status: 'error',
        error_message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      .eq('id', projectId);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      projectStatus: 'error'
    };
  }
}
