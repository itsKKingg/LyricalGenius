-- Add status and audio_url columns to projects table for Deep Mode
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE projects ADD COLUMN status TEXT CHECK (status IN ('idle', 'uploading', 'isolating', 'transcribing', 'completed', 'error')) DEFAULT 'idle';
    END IF;

    -- Add audio_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'audio_url') THEN
        ALTER TABLE projects ADD COLUMN audio_url TEXT;
    END IF;

    -- Add isolated_vocals_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'isolated_vocals_url') THEN
        ALTER TABLE projects ADD COLUMN isolated_vocals_url TEXT;
    END IF;

    -- Add error_message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'error_message') THEN
        ALTER TABLE projects ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- Create storage bucket for project audio if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-audio', 'project-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for project-audio bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can upload their own audio files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view their own audio files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view audio files" ON storage.objects;
END $$;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own audio files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'project-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own audio files
CREATE POLICY "Users can view their own audio files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'project-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own audio files
CREATE POLICY "Users can delete their own audio files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'project-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to audio files (needed for AI processing)
CREATE POLICY "Public can view audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'project-audio');
