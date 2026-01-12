# Frontend Integration Guide

## Connecting the React Frontend to the Python Render Engine

This guide explains how to integrate the React frontend with the Python render engine API.

## API Endpoints

### 1. Render Video Endpoint

**URL**: `POST /api/render`

**Request Body**:
```json
{
  "background_url": "/path/to/background.mp4",
  "audio_url": "/path/to/audio.mp3",
  "lyrics": [
    {"text": "Hello", "start": 0, "end": 1000},
    {"text": "World", "start": 1000, "end": 2000}
  ]
}
```

**Response** (Success):
```json
{
  "success": true,
  "output_path": "/tmp/lyric_video_12345.mp4",
  "duration": 12.5,
  "resolution": "1080x1920",
  "lyrics_count": 8
}
```

**Response** (Error):
```json
{
  "error": "Background file not found: /path/to/background.mp4"
}
```

## Frontend Implementation

### TypeScript Interface for API Response

```typescript
// src/types/render.ts

export interface RenderRequest {
  background_url: string;
  audio_url: string;
  lyrics: LyricWord[];
}

export interface RenderResponse {
  success: boolean;
  output_path?: string;
  duration?: number;
  resolution?: string;
  lyrics_count?: number;
  error?: string;
}
```

### React Hook for Rendering Videos

```typescript
// src/hooks/useVideoRenderer.ts

import { useState, useCallback } from 'react';
import { RenderRequest, RenderResponse } from '@/types/render';

export function useVideoRenderer() {
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);

  const renderVideo = useCallback(async (request: RenderRequest): Promise<RenderResponse> => {
    setIsRendering(true);
    setError(null);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: RenderResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to render video');
      }

      if (data.success && data.output_path) {
        setOutputPath(data.output_path);
      }

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRendering(false);
    }
  }, []);

  return {
    renderVideo,
    isRendering,
    error,
    outputPath,
  };
}
```

### Example: Adding a Render Button to the Editor

```typescript
// src/components/editor/VideoRenderer.tsx

import React from 'react';
import { useVideoRenderer } from '@/hooks/useVideoRenderer';
import { Button } from '@/components/ui/button';
import { Film, Loader2 } from 'lucide-react';

interface VideoRendererProps {
  backgroundUrl: string;
  audioUrl: string;
  lyrics: LyricWord[];
}

export function VideoRenderer({ backgroundUrl, audioUrl, lyrics }: VideoRendererProps) {
  const { renderVideo, isRendering, error, outputPath } = useVideoRenderer();

  const handleRender = async () => {
    try {
      const response = await renderVideo({
        background_url: backgroundUrl,
        audio_url: audioUrl,
        lyrics: lyrics,
      });

      if (response.success) {
        console.log('Video rendered successfully:', response.output_path);
        // You can now display or download the video
      }
    } catch (err) {
      console.error('Render failed:', err);
    }
  };

  const handleDownload = () => {
    if (outputPath) {
      // You may need to create a download endpoint
      window.open(`/api/download?path=${encodeURIComponent(outputPath)}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleRender}
          disabled={isRendering || !backgroundUrl || !audioUrl || lyrics.length === 0}
          className="w-full"
        >
          {isRendering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <Film className="mr-2 h-4 w-4" />
              Render Video
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {outputPath && (
        <div className="flex flex-col gap-2">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            ✓ Video rendered successfully!
          </div>
          <Button onClick={handleDownload} variant="outline">
            Download Video
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Integration with App.tsx

```typescript
// src/app/editor/App.tsx

// Import the VideoRenderer component
import { VideoRenderer } from '@/components/editor/VideoRenderer';

// In your component JSX:
<div className="video-renderer-section">
  <VideoRenderer
    backgroundUrl={selectedMedia?.url || ''}
    audioUrl={audioFile?.name || ''}
    lyrics={words}
  />
</div>
```

## Handling File Uploads

Since the render engine expects file paths on the server, you'll need to:

### 1. Upload Files First

```typescript
// src/api/uploads.ts

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.path; // Returns the server-side file path
}
```

### 2. Add Upload Endpoint to Flask API

```python
# api/index.py

@app.route('/api/upload', methods=['POST'])
def handle_file_upload():
    """Handle file uploads and return server-side path"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file with unique name
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        file.save(file_path)
        
        return jsonify({
            'success': True,
            'path': file_path,
            'filename': unique_filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 3. Complete Workflow Example

```typescript
// Example of complete rendering workflow
async function renderCompleteVideo(
  backgroundFile: File,
  audioFile: File,
  lyrics: LyricWord[]
) {
  // Step 1: Upload background
  const backgroundPath = await uploadFile(backgroundFile);
  
  // Step 2: Upload audio
  const audioPath = await uploadFile(audioFile);
  
  // Step 3: Render video
  const { renderVideo } = useVideoRenderer();
  const response = await renderVideo({
    background_url: backgroundPath,
    audio_url: audioPath,
    lyrics: lyrics,
  });
  
  return response;
}
```

## Error Handling

### Common Error Responses

1. **Missing Required Field**
   ```json
   {"error": "Missing required field: background_url"}
   ```

2. **File Not Found**
   ```json
   {"error": "Background file not found: /path/to/file.mp4"}
   ```

3. **Invalid Lyrics**
   ```json
   {"error": "Lyric at index 2 has invalid timing (end must be > start)"}
   ```

### Frontend Error Display

```typescript
const getErrorMessage = (error: string): string => {
  if (error.includes('File not found')) {
    return 'Please check that your files are uploaded correctly.';
  }
  if (error.includes('Missing required field')) {
    return 'Please complete all required fields before rendering.';
  }
  if (error.includes('invalid timing')) {
    return 'There is an error in your lyric timing. Please check the timeline.';
  }
  return 'An unexpected error occurred. Please try again.';
};
```

## Performance Considerations

### 1. Rendering Time

- **Short videos (10-30 seconds)**: ~10-30 seconds
- **Medium videos (30-60 seconds)**: ~30-90 seconds
- **Long videos (60+ seconds)**: May take several minutes

### 2. Progress Updates

For better UX, consider implementing WebSocket for real-time progress:

```python
# api/index.py
from flask_socketio import SocketIO, emit

socketio = SocketIO(app)

@app.route('/api/render', methods=['POST'])
def handle_video_render():
    socketio.emit('render_progress', {'status': 'started', 'progress': 0})
    
    # ... render logic ...
    
    socketio.emit('render_progress', {'status': 'completed', 'progress': 100})
```

```typescript
// Frontend WebSocket
const socket = io();

socket.on('render_progress', (data) => {
  console.log('Render progress:', data.progress);
});
```

## Security Considerations

1. **File Validation**: Ensure uploaded files are of allowed types
2. **Path Sanitization**: Prevent directory traversal attacks
3. **Rate Limiting**: Limit render requests per user
4. **Cleanup**: Remove temporary files after a certain period

```python
# Example file validation
ALLOWED_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mp3', '.wav', '.m4a'}

def is_allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS
```

## Testing

### Manual Testing with curl

```bash
curl -X POST http://localhost:8000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "background_url": "/path/to/video.mp4",
    "audio_url": "/path/to/audio.mp3",
    "lyrics": [
      {"text": "Hello", "start": 0, "end": 1000}
    ]
  }'
```

### Unit Testing

```python
# tests/test_render_engine.py

def test_render_endpoint():
    client = app.test_client()
    
    response = client.post('/api/render', json={
        'background_url': 'test.mp4',
        'audio_url': 'test.mp3',
        'lyrics': [{'text': 'Test', 'start': 0, 'end': 1000}]
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] == True
```

## Next Steps

1. ✅ Implement file upload endpoint
2. ✅ Add render button to frontend
3. ✅ Create loading states and progress indicators
4. ⏳ Add video preview before download
5. ⏳ Implement video download endpoint
6. ⏳ Add error recovery mechanisms
7. ⏳ Optimize rendering performance
