-- Expand editor_projects table to store full editor state

-- gen_random_uuid is provided by pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.editor_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- New schema (full editor project state)
  project_name TEXT NOT NULL DEFAULT 'Untitled Project',
  song_title TEXT,
  artist_name TEXT,
  audio_file_url TEXT,
  audio_duration NUMERIC,
  clip_range NUMERIC[],
  sections JSONB,
  words JSONB,
  videos JSONB,
  photos JSONB,
  aesthetic_id UUID,
  font TEXT,
  color TEXT,
  animation_style TEXT,

  -- Backwards-compatible fields used by earlier persistence implementation
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  background_url TEXT,
  audio_url TEXT,
  lyrics_json JSONB DEFAULT '[]'::jsonb,

  -- Rendering fields used by render pipeline
  video_url TEXT,
  status TEXT DEFAULT 'pending',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_edited TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure PostgREST roles can see the table in schema cache
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.editor_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.editor_projects TO authenticated;

-- Enable RLS
ALTER TABLE public.editor_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for editor_projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'editor_projects' AND policyname = 'Users can view their own editor projects'
  ) THEN
    CREATE POLICY "Users can view their own editor projects" ON public.editor_projects
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'editor_projects' AND policyname = 'Users can create their own editor projects'
  ) THEN
    CREATE POLICY "Users can create their own editor projects" ON public.editor_projects
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'editor_projects' AND policyname = 'Users can update their own editor projects'
  ) THEN
    CREATE POLICY "Users can update their own editor projects" ON public.editor_projects
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'editor_projects' AND policyname = 'Users can delete their own editor projects'
  ) THEN
    CREATE POLICY "Users can delete their own editor projects" ON public.editor_projects
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_editor_projects_user_id ON public.editor_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_projects_last_edited ON public.editor_projects(last_edited DESC);

-- Timestamp triggers
CREATE OR REPLACE FUNCTION public.update_editor_projects_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_edited = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_editor_projects_timestamps ON public.editor_projects;
CREATE TRIGGER update_editor_projects_timestamps
  BEFORE UPDATE ON public.editor_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_editor_projects_timestamps();

-- Ensure new columns exist when migrating from older versions
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS project_name TEXT NOT NULL DEFAULT 'Untitled Project';
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS song_title TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS audio_file_url TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS audio_duration NUMERIC;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS clip_range NUMERIC[];
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS sections JSONB;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS words JSONB;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS videos JSONB;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS photos JSONB;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS aesthetic_id UUID;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS font TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS animation_style TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS last_edited TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.editor_projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Ask PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
