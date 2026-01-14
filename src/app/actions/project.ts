'use server'

import { AIOrchestrator } from '@/services/ai/orchestrator';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processNewProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const orchestrator = new AIOrchestrator();
  const audioFile = formData.get('audio') as File;
  const title = formData.get('title') as string;
  const artist = formData.get('artist') as string;
  const bpm = formData.get('bpm') ? parseInt(formData.get('bpm') as string) : null;

  if (!audioFile) {
    throw new Error('No audio file provided');
  }

  try {
    const result = await orchestrator.processAudio(
      audioFile,
      audioFile.name,
      { title, artist, bpm },
      user.id
    );

    revalidatePath('/dashboard');
    return { success: true, projectId: result.projectId };
  } catch (error: any) {
    return { error: error.message };
  }
}
