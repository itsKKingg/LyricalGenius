from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import tempfile
import os
import uuid
import threading
from datetime import datetime
from enum import Enum

# Import render engine
from render_engine import render_video_from_config

app = Flask(__name__)
CORS(app)

# Job status enum
class JobStatus(Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

# Global job store
jobs = {}

# Ensure renders directory exists
renders_dir = os.path.join(os.path.dirname(__file__), "..", "public", "renders")
os.makedirs(renders_dir, exist_ok=True)

def background_render_job(job_id: str, project_config: dict):
    """Background function to handle video rendering"""
    try:
        jobs[job_id]['status'] = JobStatus.PROCESSING
        jobs[job_id]['progress'] = 0
        jobs[job_id]['message'] = 'Starting render...'
        
        # Create output file in renders directory
        output_path = os.path.join(renders_dir, f"{job_id}.mp4")
        
        jobs[job_id]['message'] = 'Loading audio...'
        jobs[job_id]['progress'] = 10
        
        # Import here to avoid circular import
        from render_engine import LyricVideoRenderer
        renderer = LyricVideoRenderer(project_config)
        
        jobs[job_id]['message'] = 'Processing video...'
        jobs[job_id]['progress'] = 30
        
        # Render the video
        rendered_path = renderer.render(output_path)
        
        jobs[job_id]['progress'] = 90
        jobs[job_id]['message'] = 'Finalizing...'
        
        # Update job with results
        jobs[job_id]['status'] = JobStatus.COMPLETED
        jobs[job_id]['progress'] = 100
        jobs[job_id]['output_path'] = rendered_path
        jobs[job_id]['message'] = 'Render complete!'
        jobs[job_id]['completed_at'] = datetime.now().isoformat()
        
        # Calculate metadata
        if project_config.get('lyrics'):
            last_lyric = project_config['lyrics'][-1]
            jobs[job_id]['duration'] = last_lyric.get('end', 0) / 1000
            jobs[job_id]['lyrics_count'] = len(project_config['lyrics'])
        
    except Exception as e:
        jobs[job_id]['status'] = JobStatus.FAILED
        jobs[job_id]['progress'] = 0
        jobs[job_id]['message'] = f'Render failed: {str(e)}'
        jobs[job_id]['error'] = str(e)
        jobs[job_id]['completed_at'] = datetime.now().isoformat()

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
    Start an async video render job
    
    Expected JSON body:
    {
        "background_url": "/path/to/background.mp4",
        "audio_url": "/path/to/audio.mp3",
        "lyrics": [
            {"text": "Hello", "start": 0, "end": 1000},
            {"text": "World", "start": 1000, "end": 2000}
        ]
    }
    
    Returns:
    {
        "success": true,
        "job_id": "uuid-string",
        "status": "PENDING"
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
        
        # Generate job ID
        job_id = str(uuid.uuid4())
        
        # Create job entry
        jobs[job_id] = {
            'id': job_id,
            'status': JobStatus.PENDING,
            'progress': 0,
            'message': 'Queued for processing...',
            'created_at': datetime.now().isoformat(),
            'config': project_config
        }
        
        # Start background job
        thread = threading.Thread(
            target=background_render_job,
            args=(job_id, project_config)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'status': JobStatus.PENDING.value,
            'message': 'Render job started'
        })
        
    except FileNotFoundError as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """
    Get the status of a render job
    
    Returns:
    {
        "success": true,
        "job_id": "uuid-string",
        "status": "PROCESSING|COMPLETED|FAILED",
        "progress": 45,
        "message": "Processing video...",
        "output_path": "/path/to/output.mp4", // Only when completed
        "duration": 12.5, // Only when completed
        "lyrics_count": 10 // Only when completed
    }
    """
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    response = {
        'success': True,
        'job_id': job_id,
        'status': job['status'].value,
        'progress': job['progress'],
        'message': job['message'],
        'created_at': job['created_at']
    }
    
    # Add completion data if job is finished
    if job['status'] in [JobStatus.COMPLETED, JobStatus.FAILED]:
        response['completed_at'] = job.get('completed_at')
        
        if job['status'] == JobStatus.COMPLETED:
            response['output_path'] = job.get('output_path')
            response['duration'] = job.get('duration')
            response['lyrics_count'] = job.get('lyrics_count')
        elif job['status'] == JobStatus.FAILED:
            response['error'] = job.get('error')
    
    return jsonify(response)

@app.route('/api/download/<job_id>', methods=['GET'])
def download_video(job_id):
    """
    Download the rendered video file
    """
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    if job['status'] != JobStatus.COMPLETED:
        return jsonify({'error': 'Video not ready yet'}), 400
    
    output_path = job.get('output_path')
    if not output_path or not os.path.exists(output_path):
        return jsonify({'error': 'Output file not found'}), 404
    
    from flask import send_file
    return send_file(output_path, as_attachment=True, download_name=f'lyric_video_{job_id}.mp4')


# For local development
if __name__ == '__main__':
    app.run(port=8000, debug=True)