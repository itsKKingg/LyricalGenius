# Supabase Project Persistence Implementation

This implementation adds automatic project persistence to the LyricalGenius audio-lyric synchronization application.

## Features Implemented

### 1. Database Schema
- Created `editor_projects` table in Supabase with:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `title` (text)
  - `background_url` (text)
  - `audio_url` (text)
  - `lyrics_json` (jsonb - stores word-level timestamps)
  - `last_edited` (timestamp)
  - `created_at` (timestamp)

### 2. Auto-Save Functionality
- **Auto-save every 30 seconds** if the project state has changed
- **Auto-save 2 seconds after any state change** in workspace
- Real-time "Saved" indicator in the top navbar
- Shows checkmark with timestamp when sync is successful
- Shows "Saving..." spinner during save operations
- Shows "Unsaved changes" indicator when changes are pending

### 3. Project Persistence Service
- Debounced saving to prevent excessive database calls
- Singleton service pattern for consistent state management
- Error handling with user feedback
- Automatic cleanup on component unmount

### 4. Load Project Modal
- Beautiful grid layout showing project thumbnails
- Project metadata display (title, last edited, word count)
- Delete project functionality with confirmation
- Loading states and error handling
- Responsive design for all screen sizes

### 5. Project Loading Integration
- Seamless integration with existing editor state
- Restores all project data including lyrics, media, and settings
- Automatic navigation to workspace after loading

## Files Created/Modified

### New Files
- `/supabase/migrations/20240112000000_projects_persistence.sql` - Database schema
- `/src/lib/projectPersistence.ts` - Persistence service layer
- `/src/components/editor/LoadProjectModal.tsx` - Project loader modal

### Modified Files
- `/src/app/editor/App.tsx` - Added persistence state and auto-save logic
- `/src/app/editor/tabs/HomeView.tsx` - Added Load Project button and modal integration
- `/src/types/supabase.ts` - Added editor_projects table types

## Usage

### Auto-Save Behavior
The application automatically saves project state when:
1. User is in the WORKSPACE view
2. Changes are made to: selected media, lyrics, audio file, font, color, or animation style
3. Every 30 seconds if there are unsaved changes

### Loading Projects
1. Click "Load Project" from the home screen
2. Browse available projects in the modal
3. Click on a project card to load it
4. Project state is restored including all settings and data

### Save Status Indicators
- **Green checkmark with timestamp**: Project saved successfully
- **Blue spinner with "Saving..."**: Auto-save in progress
- **Orange dot with "Unsaved changes"**: Changes pending save

## Technical Details

### Database Schema
```sql
CREATE TABLE editor_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Project',
    background_url TEXT,
    audio_url TEXT,
    lyrics_json JSONB DEFAULT '[]'::jsonb,
    last_edited TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security
- Row Level Security (RLS) enabled
- Users can only access their own projects
- Proper authentication checks in all operations

### Performance
- Indexed queries for fast project loading
- Debounced saves to reduce database load
- Efficient state management with minimal re-renders

## Future Enhancements
- Real-time collaboration features
- Project versioning and history
- Export/import functionality
- Cloud storage integration for media files