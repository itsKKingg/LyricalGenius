from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import json
import tempfile
import os
import uuid
import asyncio
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
import whisper
import shutil

# Import render engine
from render_engine import render_video_from_config, LyricVideoRenderer

app = FastAPI(title="Lyric Video Render API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Job status enum
class JobStatus(Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

# Global job store
jobs: Dict[str, Dict[str, Any]] = {}

# Ensure renders directory exists
renders_dir = os.path.join(os.path.dirname(__file__), "..", "public", "renders")
os.makedirs(renders_dir, exist_ok=True)

async def background_render_job(job_id: str, project_config: dict):
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
        
        # Render the video (this is CPU-intensive)
        rendered_path = renderer.render(output_path)
        
        # Check if video_url was added to config during render (by upload_video_to_supabase)
        video_url = project_config.get('video_url')
        
        jobs[job_id]['progress'] = 90
        jobs[job_id]['message'] = 'Finalizing...'
        
        # Update job with results
        jobs[job_id]['status'] = JobStatus.COMPLETED
        jobs[job_id]['progress'] = 100
        jobs[job_id]['output_path'] = rendered_path
        jobs[job_id]['video_url'] = video_url
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

def extract_pinterest_media(url: str):
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

@app.post("/api/pinterest")
async def handle_pinterest_download(url_data: dict):
    """
    Extract media URLs from Pinterest
    """
    try:
        url = url_data.get('url')
        
        if not url:
            raise HTTPException(status_code=400, detail='No URL provided')
            
        # Validate URL format
        if 'pinterest.com' not in url:
            raise HTTPException(status_code=400, detail='Invalid Pinterest URL')
        
        # Extract media URLs
        media_urls = extract_pinterest_media(url)
        
        return {
            'success': True,
            'links': media_urls
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/render")
async def handle_video_render(background_tasks: BackgroundTasks, project_config: dict):
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
        # Validate required fields
        required_fields = ['background_url', 'audio_url', 'lyrics']
        for field in required_fields:
            if field not in project_config:
                raise HTTPException(status_code=400, detail=f'Missing required field: {field}')
        
        # Validate file paths exist
        if not os.path.exists(project_config['background_url']):
            raise HTTPException(status_code=400, detail=f'Background file not found: {project_config["background_url"]}')
        
        if not os.path.exists(project_config['audio_url']):
            raise HTTPException(status_code=400, detail=f'Audio file not found: {project_config["audio_url"]}')
        
        # Validate lyrics array
        lyrics = project_config['lyrics']
        if not isinstance(lyrics, list) or len(lyrics) == 0:
            raise HTTPException(status_code=400, detail='Lyrics must be a non-empty array')
        
        # Validate each lyric entry
        for i, lyric in enumerate(lyrics):
            if not isinstance(lyric, dict):
                raise HTTPException(status_code=400, detail=f'Lyric at index {i} must be an object')
            if 'text' not in lyric:
                raise HTTPException(status_code=400, detail=f'Lyric at index {i} missing "text" field')
            if 'start' not in lyric:
                raise HTTPException(status_code=400, detail=f'Lyric at index {i} missing "start" field')
            if 'end' not in lyric:
                raise HTTPException(status_code=400, detail=f'Lyric at index {i} missing "end" field')
            if lyric['end'] <= lyric['start']:
                raise HTTPException(status_code=400, detail=f'Lyric at index {i} has invalid timing (end must be > start)')
        
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
        
        # Add background task - returns immediately without waiting
        background_tasks.add_task(background_render_job, job_id, project_config)
        
        return {
            'success': True,
            'job_id': job_id,
            'status': JobStatus.PENDING.value,
            'message': 'Render job started'
        }
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=f'File not found: {str(e)}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{job_id}")
async def get_job_status(job_id: str):
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
        raise HTTPException(status_code=404, detail='Job not found')
    
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
            response['video_url'] = job.get('video_url')
            response['duration'] = job.get('duration')
            response['lyrics_count'] = job.get('lyrics_count')
        elif job['status'] == JobStatus.FAILED:
            response['error'] = job.get('error')
    
    return response

@app.get("/api/download/{job_id}")
async def download_video(job_id: str):
    """
    Download the rendered video file
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail='Job not found')
    
    job = jobs[job_id]
    
    if job['status'] != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail='Video not ready yet')
    
    output_path = job.get('output_path')
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail='Output file not found')
    
    return FileResponse(
        output_path,
        media_type='video/mp4',
        filename=f'lyric_video_{job_id}.mp4'
    )

@app.post("/api/transcribe")
async def handle_transcription(audio_file: UploadFile = File(...)):
    """
    Transcribe audio file and return word-level timestamps using OpenAI Whisper
    
    Expected: multipart/form-data with 'audio' file field
    
    Returns:
    {
        "success": true,
        "lyrics": [
            {"text": "Hello", "start": 0, "end": 800},
            {"text": "world", "start": 800, "end": 1600}
        ],
        "duration": 10.5,
        "language": "en"
    }
    """
    try:
        # Check if audio file is present
        if not audio_file:
            raise HTTPException(status_code=400, detail='No audio file provided')
        
        if audio_file.filename == '':
            raise HTTPException(status_code=400, detail='Empty filename')
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_audio:
            # Save the uploaded file
            with open(temp_audio.name, 'wb') as buffer:
                shutil.copyfileobj(audio_file.file, buffer)
            temp_audio_path = temp_audio.name
        
        try:
            # Load Whisper model (base model for balance of speed and accuracy)
            # You can use 'tiny', 'base', 'small', 'medium', 'large' based on needs
            print('Loading Whisper model...')
            model = whisper.load_model("base")
            
            # Transcribe with word-level timestamps
            print(f'Transcribing audio file: {temp_audio_path}')
            result = model.transcribe(
                temp_audio_path,
                word_timestamps=True,
                verbose=False
            )
            
            # Extract word-level timestamps
            lyrics = []
            
            for segment in result.get('segments', []):
                for word_info in segment.get('words', []):
                    lyrics.append({
                        'text': word_info['word'].strip(),
                        'start': int(word_info['start'] * 1000),  # Convert to milliseconds
                        'end': int(word_info['end'] * 1000)       # Convert to milliseconds
                    })
            
            # Clean up temporary file
            os.unlink(temp_audio_path)
            
            if len(lyrics) == 0:
                raise HTTPException(
                    status_code=400, 
                    detail='No words detected in audio. Please ensure the audio contains speech.'
                )
            
            return {
                'success': True,
                'lyrics': lyrics,
                'duration': result.get('segments', [{}])[-1].get('end', 0) if result.get('segments') else 0,
                'language': result.get('language', 'unknown'),
                'text': result.get('text', '')
            }
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            raise e
            
    except Exception as e:
        print(f'Transcription error: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Transcription failed: {str(e)}')

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)