"""
Test script for the Lyric Video Render Engine

This script demonstrates how to use the render engine with sample data.
"""

import os
import sys
from render_engine import render_video_from_config


def test_render_engine():
    """Test the render engine with sample configuration"""
    
    # Sample project configuration
    # Note: You'll need to provide actual file paths for testing
    project_config = {
        'background_url': './test_background.mp4',  # Replace with actual path
        'audio_url': './test_audio.mp3',  # Replace with actual path
        'lyrics': [
            {'text': 'Welcome', 'start': 0, 'end': 1500},
            {'text': 'to the', 'start': 1500, 'end': 2500},
            {'text': 'Lyric Video', 'start': 2500, 'end': 4000},
            {'text': 'Generator', 'start': 4000, 'end': 5500},
            {'text': 'Dynamic', 'start': 5500, 'end': 7000},
            {'text': 'Text Overlay', 'start': 7000, 'end': 9000},
            {'text': 'Smooth', 'start': 9000, 'end': 10500},
            {'text': 'Animations', 'start': 10500, 'end': 12500},
        ]
    }
    
    # Check if test files exist
    if not os.path.exists(project_config['background_url']):
        print(f"Error: Background file not found: {project_config['background_url']}")
        print("\nPlease provide actual file paths in the project_config dictionary.")
        print("The render engine requires:")
        print("  - A background video file (mp4, mov, etc.)")
        print("  - An audio file (mp3, wav, etc.)")
        print("  - Lyrics array with text, start (ms), and end (ms) for each word")
        return
    
    if not os.path.exists(project_config['audio_url']):
        print(f"Error: Audio file not found: {project_config['audio_url']}")
        return
    
    try:
        print("Starting video render...")
        print(f"Background: {project_config['background_url']}")
        print(f"Audio: {project_config['audio_url']}")
        print(f"Lyrics: {len(project_config['lyrics'])} entries")
        print("-" * 50)
        
        output_file = render_video_from_config(project_config, 'test_output.mp4')
        
        print("-" * 50)
        print(f"✅ Render completed successfully!")
        print(f"📁 Output file: {output_file}")
        print(f"📏 Resolution: 1080x1920 (9:16 vertical)")
        print(f"🎨 Features: Dynamic text overlays, zoom animations")
        
    except Exception as e:
        print(f"❌ Error during render: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    test_render_engine()
