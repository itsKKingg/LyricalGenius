-- Create projects table for editor persistence
CREATE TABLE IF NOT EXISTS editor_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Project',
    background_url TEXT,
    audio_url TEXT,
    lyrics_json JSONB DEFAULT '[]'::jsonb,
    last_edited TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE editor_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for editor_projects
CREATE POLICY "Users can view their own editor projects" ON editor_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own editor projects" ON editor_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own editor projects" ON editor_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own editor projects" ON editor_projects FOR DELETE USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_editor_projects_user_id ON editor_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_projects_last_edited ON editor_projects(last_edited DESC);

-- Create function to update last_edited timestamp
CREATE OR REPLACE FUNCTION update_last_edited()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_edited = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_edited
CREATE TRIGGER update_editor_projects_last_edited
    BEFORE UPDATE ON editor_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_last_edited();