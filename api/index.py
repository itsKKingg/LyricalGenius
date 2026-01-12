from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import tempfile
import os

# Import render engine
from render_engine import render_video_from_config

app = Flask(__name__)
CORS(app)

def extract_pinterest_media(url):
    """Extract media URLs from Pinterest using pinterest-dl command"""
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Run pinterest-dl to extract media URLs without downloading
            result = subprocess.run([
                'pinterest-dl', 
                '--json',  # Get output as JSON
                '--no-download',  # Don't download, just extract URLs
                url
            ], capture_output=True, text=True, cwd=temp_dir)
            
            if result.returncode != 0:
                raise Exception(f"pinterest-dl failed: {result.stderr}")
            
            # Parse the JSON output
            output_lines = result.stdout.strip().split('\n')
            media_urls = []
            
            for line in output_lines:
                if line.strip():
                    try:
                        data = json.loads(line)
                        if 'url' in data:
                            media_urls.append(data['url'])
                    except json.JSONDecodeError:
                        continue
            
            return media_urls
            
    except Exception as e:
        raise Exception(f"Failed to extract media: {str(e)}")

@app.route('/api/pinterest', methods=['POST'])
def handle_pinterest_download():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
            
        # Validate URL format
        if 'pinterest.com' not in url:
            return jsonify({'error': 'Invalid Pinterest URL'}), 400
        
        # Extract media URLs
        media_urls = extract_pinterest_media(url)
        
        return jsonify({
            'success': True,
            'links': media_urls
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/render', methods=['POST'])
def handle_video_render():
    """
    Render a lyric video with dynamic text overlays
    
    Expected JSON body:
    {
        "background_url": "/path/to/background.mp4",
        "audio_url": "/path/to/audio.mp3",
        "lyrics": [
            {"text": "Hello", "start": 0, "end": 1000},
            {"text": "World", "start": 1000, "end": 2000}
        ]
    }
    """
    try:
        project_config = request.get_json()
        
        # Validate required fields
        required_fields = ['background_url', 'audio_url', 'lyrics']
        for field in required_fields:
            if field not in project_config:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate file paths exist
        if not os.path.exists(project_config['background_url']):
            return jsonify({'error': f'Background file not found: {project_config["background_url"]}'}), 400
        
        if not os.path.exists(project_config['audio_url']):
            return jsonify({'error': f'Audio file not found: {project_config["audio_url"]}'}), 400
        
        # Validate lyrics array
        lyrics = project_config['lyrics']
        if not isinstance(lyrics, list) or len(lyrics) == 0:
            return jsonify({'error': 'Lyrics must be a non-empty array'}), 400
        
        # Validate each lyric entry
        for i, lyric in enumerate(lyrics):
            if not isinstance(lyric, dict):
                return jsonify({'error': f'Lyric at index {i} must be an object'}), 400
            if 'text' not in lyric:
                return jsonify({'error': f'Lyric at index {i} missing "text" field'}), 400
            if 'start' not in lyric:
                return jsonify({'error': f'Lyric at index {i} missing "start" field'}), 400
            if 'end' not in lyric:
                return jsonify({'error': f'Lyric at index {i} missing "end" field'}), 400
            if lyric['end'] <= lyric['start']:
                return jsonify({'error': f'Lyric at index {i} has invalid timing (end must be > start)'}), 400
        
        # Create temporary output file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
            output_path = tmp.name
        
        # Render the video
        rendered_path = render_video_from_config(project_config, output_path)
        
        # Calculate video duration
        last_lyric = lyrics[-1]
        duration_seconds = last_lyric.get('end', 0) / 1000
        
        return jsonify({
            'success': True,
            'output_path': rendered_path,
            'duration': duration_seconds,
            'resolution': '1080x1920',
            'lyrics_count': len(lyrics)
        })
        
    except FileNotFoundError as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# For local development
if __name__ == '__main__':
    app.run(port=8000, debug=True)