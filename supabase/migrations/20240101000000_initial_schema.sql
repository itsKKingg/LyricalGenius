-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_title TEXT NOT NULL,
    artist_name TEXT,
    bpm INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lyrics_source table
CREATE TABLE IF NOT EXISTS lyrics_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    timed_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Create aesthetics table
CREATE TABLE IF NOT EXISTS aesthetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create aesthetic_assets table
CREATE TABLE IF NOT EXISTS aesthetic_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aesthetic_id UUID NOT NULL REFERENCES aesthetics(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('video', 'image')),
    source TEXT CHECK (source IN ('pinterest', 'pexels', 'upload')),
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create aesthetic_hooks table
CREATE TABLE IF NOT EXISTS aesthetic_hooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aesthetic_id UUID NOT NULL REFERENCES aesthetics(id) ON DELETE CASCADE,
    text_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create video_edits table
CREATE TABLE IF NOT EXISTS video_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    aesthetic_id UUID REFERENCES aesthetics(id) ON DELETE SET NULL,
    layout_type TEXT DEFAULT '9:16',
    status TEXT CHECK (status IN ('draft', 'queued', 'published')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE aesthetic_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_edits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Lyrics source policies
CREATE POLICY "Users can view lyrics of their projects" ON lyrics_source FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = lyrics_source.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage lyrics of their projects" ON lyrics_source FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = lyrics_source.project_id AND projects.user_id = auth.uid())
);

-- Aesthetics policies
CREATE POLICY "Users can view their own aesthetics" ON aesthetics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own aesthetics" ON aesthetics FOR ALL USING (auth.uid() = user_id);

-- Aesthetic assets policies
CREATE POLICY "Users can view assets of their aesthetics" ON aesthetic_assets FOR SELECT USING (
    EXISTS (SELECT 1 FROM aesthetics WHERE aesthetics.id = aesthetic_assets.aesthetic_id AND aesthetics.user_id = auth.uid())
);
CREATE POLICY "Users can manage assets of their aesthetics" ON aesthetic_assets FOR ALL USING (
    EXISTS (SELECT 1 FROM aesthetics WHERE aesthetics.id = aesthetic_assets.aesthetic_id AND aesthetics.user_id = auth.uid())
);

-- Aesthetic hooks policies
CREATE POLICY "Users can view hooks of their aesthetics" ON aesthetic_hooks FOR SELECT USING (
    EXISTS (SELECT 1 FROM aesthetics WHERE aesthetics.id = aesthetic_hooks.aesthetic_id AND aesthetics.user_id = auth.uid())
);
CREATE POLICY "Users can manage hooks of their aesthetics" ON aesthetic_hooks FOR ALL USING (
    EXISTS (SELECT 1 FROM aesthetics WHERE aesthetics.id = aesthetic_hooks.aesthetic_id AND aesthetics.user_id = auth.uid())
);

-- Video edits policies
CREATE POLICY "Users can view video edits of their projects" ON video_edits FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = video_edits.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage video edits of their projects" ON video_edits FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = video_edits.project_id AND projects.user_id = auth.uid())
);
