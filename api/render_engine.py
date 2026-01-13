"""
Simplified Mock Video Render Engine for Demo
Creates mock video rendering without requiring full moviepy dependencies
"""

import json
import os
import tempfile
import time
from typing import Dict, List, Optional
import random
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase_client: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")

def upload_video_to_supabase(file_path: str, project_id: str) -> Optional[str]:
    """
    Upload rendered video to Supabase Storage and update project record
    """
    if not supabase_client:
        print("Supabase client not initialized. Skipping upload.")
        return None
    
    if not project_id:
        print("No project_id provided. Skipping upload.")
        return None

    file_name = f"{project_id}_{int(time.time())}.mp4"
    storage_path = f"{file_name}"
    
    try:
        print(f"Uploading {file_path} to Supabase storage: generated-videos/{storage_path}")
        with open(file_path, 'rb') as f:
            supabase_client.storage.from_('generated-videos').upload(
                path=storage_path,
                file=f,
                file_options={"content-type": "video/mp4"}
            )
        
        # Get public URL
        public_url = supabase_client.storage.from_('generated-videos').get_public_url(storage_path)
        print(f"Upload successful. Public URL: {public_url}")
        
        # Update database - try editor_projects first as it's used by the current editor
        print(f"Updating project {project_id} in database...")
        try:
            supabase_client.table('editor_projects').update({
                'video_url': public_url,
                'status': 'completed'
            }).eq('id', project_id).execute()
        except Exception as db_e:
            print(f"Failed to update editor_projects, trying projects table: {db_e}")
            supabase_client.table('projects').update({
                'video_url': public_url,
                'status': 'completed'
            }).eq('id', project_id).execute()
        
        return public_url
    except Exception as e:
        print(f"Error in upload_video_to_supabase: {e}")
        return None

def simulate_render_process(project_config: dict, output_path: str) -> str:
    """
    Simulate video rendering process for demo purposes
    """
    print(f"Starting mock render process for: {output_path}")
    
    # Simulate processing time
    lyrics = project_config.get('lyrics', [])
    render_duration = len(lyrics) * 0.5  # 0.5 seconds per lyric
    
    # Create a simple output file for demo
    with open(output_path, 'w') as f:
        f.write(f"Mock rendered video file\n")
        f.write(f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Lyrics count: {len(lyrics)}\n")
        f.write(f"Simulated duration: {render_duration:.1f}s\n")
        f.write(f"Resolution: 1080x1920\n")
        f.write(f"Format: MP4 (H.264)\n")
        f.write(f"Background: {project_config.get('background_url', 'Unknown')}\n")
        f.write(f"Audio: {project_config.get('audio_url', 'Unknown')}\n")
    
    print(f"Mock render completed: {output_path}")
    return output_path

def render_video_from_config(project_config: Dict, output_path: Optional[str] = None) -> str:
    """
    Mock function to simulate video rendering from project configuration
    """
    if not output_path:
        # Create temp file if no output path provided
        temp_dir = tempfile.gettempdir()
        output_path = os.path.join(temp_dir, f"mock_lyric_video_{int(time.time())}.mp4")
    
    rendered_path = simulate_render_process(project_config, output_path)
    
    # Upload to Supabase if project_id is present
    project_id = project_config.get('project_id')
    if project_id:
        upload_video_to_supabase(rendered_path, project_id)
        
    return rendered_path


class LyricVideoRenderer:
    """Mock renderer for demo purposes"""
    
    def __init__(self, project_config: Dict):
        self.project_config = project_config
        self.background_url = project_config.get('background_url')
        self.audio_url = project_config.get('audio_url')
        self.lyrics = project_config.get('lyrics', [])
        
        # Mock video dimensions
        self.width = 1080
        self.height = 1920
        
    def render(self, output_path: str) -> str:
        """Mock render method"""
        print("Mock LyricVideoRenderer: Starting render...")
        rendered_path = simulate_render_process(self.project_config, output_path)
        
        # Upload to Supabase if project_id is present
        project_id = self.project_config.get('project_id')
        if project_id:
            public_url = upload_video_to_supabase(rendered_path, project_id)
            if public_url:
                # We could potentially return the public_url instead or store it in the config
                self.project_config['video_url'] = public_url
                
        return rendered_path


if __name__ == '__main__':
    # Example usage for testing
    example_config = {
        'background_url': '/tmp/background.mp4',
        'audio_url': '/tmp/audio.mp3',
        'lyrics': [
            {'text': 'Hello', 'start': 0, 'end': 1000},
            {'text': 'World', 'start': 1000, 'end': 2000},
            {'text': 'This is', 'start': 2000, 'end': 3000},
            {'text': 'A test', 'start': 3000, 'end': 4000},
        ]
    }
    
    output_file = render_video_from_config(example_config, 'mock_output.mp4')
    print(f"Mock video saved to: {output_file}")