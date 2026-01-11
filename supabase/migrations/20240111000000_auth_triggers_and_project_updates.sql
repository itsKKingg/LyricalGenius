-- Add status and timed_json to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS timed_json JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS processing_notes TEXT;

-- Create storage bucket for raw audio if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw-audio', 'raw-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for raw-audio
-- Note: We use auth.uid()::text because storage.foldername returns text array
CREATE POLICY "Users can upload their own raw audio" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'raw-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own raw audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'raw-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (new.id, new.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
