'use server';

import { supabase } from '@/lib/supabaseClient';

export interface UploadAudioResult {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export async function uploadAudioToSupabase(
  projectId: string,
  userId: string,
  file: File
): Promise<UploadAudioResult> {
  try {

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: 'Project not found or access denied'
      };
    }

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      };
    }

    await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ status: 'uploading' })
      .eq('id', projectId);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${projectId}-${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-audio')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      await supabase
        .from('projects')
        // @ts-ignore - Supabase type inference issue with status enum
        .update({ 
          status: 'error',
          error_message: `Upload failed: ${uploadError.message}`
        })
        .eq('id', projectId);

      return {
        success: false,
        error: uploadError.message
      };
    }

    const { data: urlData } = supabase.storage
      .from('project-audio')
      .getPublicUrl(uploadData.path);

    const audioUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('projects')
      // @ts-ignore - Supabase type inference issue with status enum
      .update({ 
        audio_url: audioUrl,
        status: 'idle'
      })
      .eq('id', projectId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    return {
      success: true,
      audioUrl
    };

  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred during upload'
    };
  }
}
