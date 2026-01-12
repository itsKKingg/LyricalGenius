# Lyric Video Render Engine

A Python-based video rendering engine that creates 1080x1920 (9:16 vertical) lyric videos with dynamic text overlays using MoviePy.

## Features

- ✅ **Dynamic Text Overlays**: Word-level lyric synchronization
- ✅ **Smooth Animations**: 1.1x scale-up zoom effect on active words
- ✅ **Text Styling**: Inter/Montserrat font, white text with 2px black stroke
- ✅ **Background Processing**: Auto-loop for shorter backgrounds, center-crop for larger media
- ✅ **High Quality Output**: 1080x1920 resolution, libx264 codec, AAC audio
- ✅ **Fast Rendering**: Ultrafast preset for quick previews

## Installation

```bash
pip install -r requirements.txt
```

Required Python packages:
- `moviepy` - Video editing and compositing
- `imageio-ffmpeg` - FFmpeg binary for MoviePy
- `flask` - Web framework (for API integration)
- `flask-cors` - CORS support
- `pinterest-dl` - Pinterest media extraction

## Project Configuration Format

The render engine accepts a JSON configuration object:

```json
{
  "background_url": "/path/to/background.mp4",
  "audio_url": "/path/to/audio.mp3",
  "lyrics": [
    {
      "text": "Hello",
      "start": 0,
      "end": 1000
    },
    {
      "text": "World",
      "start": 1000,
      "end": 2000
    }
  ]
}
```

### Configuration Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `background_url` | string | Path to background video file (mp4, mov, etc.) |
| `audio_url` | string | Path to audio file (mp3, wav, etc.) |
| `lyrics` | array | Array of lyric word objects |
| `lyrics[].text` | string | The word/phrase to display |
| `lyrics[].start` | number | Start time in milliseconds |
| `lyrics[].end` | number | End time in milliseconds |

## Usage

### Basic Usage

```python
from render_engine import render_video_from_config

project_config = {
    'background_url': '/path/to/video.mp4',
    'audio_url': '/path/to/audio.mp3',
    'lyrics': [
        {'text': 'Welcome', 'start': 0, 'end': 1500},
        {'text': 'to the', 'start': 1500, 'end': 2500},
        {'text': 'Lyric Video', 'start': 2500, 'end': 4000},
    ]
}

output_file = render_video_from_config(project_config, 'output.mp4')
print(f"Video saved to: {output_file}")
```

### Advanced Usage with Custom Settings

```python
from render_engine import LyricVideoRenderer

renderer = LyricVideoRenderer(project_config)

# Customize settings
renderer.font = 'Montserrat'
renderer.font_size = 100
renderer.text_color = 'white'
renderer.stroke_color = 'black'
renderer.stroke_width = 3

# Render
renderer.render('custom_output.mp4')
```

## API Integration

### Example Flask Endpoint

```python
from flask import Flask, request, jsonify
from render_engine import render_video_from_config
import tempfile

app = Flask(__name__)

@app.route('/api/render', methods=['POST'])
def render_video():
    try:
        project_config = request.get_json()
        
        # Validate configuration
        required_fields = ['background_url', 'audio_url', 'lyrics']
        for field in required_fields:
            if field not in project_config:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Create temporary output file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
            output_path = tmp.name
        
        # Render video
        rendered_path = render_video_from_config(project_config, output_path)
        
        return jsonify({
            'success': True,
            'output_path': rendered_path,
            'duration': project_config.get('lyrics', [])[-1].get('end', 0) / 1000
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
```

## Text Styling

### Default Styling
- **Font**: Inter (or Montserrat)
- **Size**: 80px
- **Color**: White
- **Stroke**: 2px black outline
- **Alignment**: Center

### Customization Options

```python
renderer = LyricVideoRenderer(config)

# Font options
renderer.font = 'Inter'       # Clean, modern
renderer.font = 'Montserrat'  # Bold, geometric

# Size options (scale based on video height)
renderer.font_size = 60       # Smaller text
renderer.font_size = 100      # Larger text

# Color options
renderer.text_color = 'white'
renderer.stroke_color = 'black'
renderer.stroke_width = 2     # Pixels
```

## Background Processing

### Auto-Loop
If the background video is shorter than the audio, it will automatically loop to fill the duration.

```python
# Background: 10 seconds
# Audio: 30 seconds
# Result: Background loops 3 times
```

### Center-Crop
If the background resolution doesn't match 1080x1920, it will be resized and center-cropped.

```python
# Original: 1920x1080 (landscape)
# Processed: Center-cropped to 1080x1920 (portrait)
```

## Performance Optimization

### Export Settings

The render engine uses optimized settings for fast preview rendering:

```python
final_video.write_videofile(
    output_path,
    codec='libx264',           # H.264 codec
    preset='ultrafast',       # Fast encoding
    fps=30,                    # 30 FPS (standard for social media)
    audio_codec='aac',         # AAC audio codec
    threads=4                  # Multi-threaded encoding
)
```

### Production Quality Settings

For higher quality output, modify the `render()` method:

```python
final_video.write_videofile(
    output_path,
    codec='libx264',
    preset='medium',           # Better quality, slower
    fps=60,                    # 60 FPS
    audio_codec='aac',
    audio_bitrate='192k',     # Higher audio quality
    bitrate='8000k',           # Higher video bitrate
    threads=4
)
```

## Troubleshooting

### FFmpeg Not Found
```bash
# Ensure imageio-ffmpeg is installed
pip install imageio-ffmpeg

# Or install FFmpeg system-wide
# Ubuntu/Debian:
apt-get install ffmpeg

# macOS:
brew install ffmpeg
```

### Font Not Available
```python
# Check available fonts
from moviepy.editor import TextClip
print(TextClip.list('font'))

# Use a system font
renderer.font = '/path/to/font.ttf'
```

### Memory Issues
For long videos, consider:
1. Using smaller resolution during preview
2. Breaking video into segments
3. Using `preset='medium'` or `'slow'` for better compression

## Output Format

The render engine produces MP4 files with the following specifications:
- **Resolution**: 1080x1920 (9:16 vertical)
- **Codec**: H.264 (libx264)
- **Audio**: AAC
- **FPS**: 30
- **Container**: MP4

This format is optimized for:
- TikTok (9:16 vertical)
- Instagram Reels
- YouTube Shorts
- Facebook Stories

## Testing

Run the test script to verify the installation:

```bash
cd api
python test_render_engine.py
```

Note: You'll need to provide actual file paths in the test script.

## License

This render engine is part of the lyric video generator project.

## Contributing

When modifying the render engine:
1. Maintain 1080x1920 output resolution
2. Preserve word-level timing accuracy
3. Test with various video/audio formats
4. Ensure smooth animations and transitions
