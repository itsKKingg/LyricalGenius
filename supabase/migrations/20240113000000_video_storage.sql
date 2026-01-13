-- Add video_url and status to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add video_url and status to editor_projects
ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create storage bucket for generated videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-videos', 'generated-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for generated-videos
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload generated videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'generated-videos' AND auth.role() = 'authenticated');

-- Allow public to view generated videos (since bucket is public)
CREATE POLICY "Public can view generated videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'generated-videos');
