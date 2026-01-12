# Quick Start Guide - Video Render Engine

## Installation (One-time setup)

```bash
# Install Python dependencies
pip install -r requirements.txt
```

## Running the API

```bash
cd api
python index.py
```

The API will start on `http://localhost:8000`

## Testing the Render Engine

### Option 1: Use the Test Script

1. Edit `test_render_engine.py` and update the file paths:
```python
project_config = {
    'background_url': './your_background.mp4',
    'audio_url': './your_audio.mp3',
    'lyrics': [...]  # Your lyrics data
}
```

2. Run the test:
```bash
python test_render_engine.py
```

### Option 2: Use curl

```bash
curl -X POST http://localhost:8000/api/render \
  -H "Content-Type: application/json" \
  -d @example_config.json
```

### Option 3: Use Python Script

```python
from render_engine import render_video_from_config

config = {
    'background_url': '/path/to/video.mp4',
    'audio_url': '/path/to/audio.mp3',
    'lyrics': [
        {'text': 'Hello', 'start': 0, 'end': 1000},
        {'text': 'World', 'start': 1000, 'end': 2000}
    ]
}

output = render_video_from_config(config, 'my_video.mp4')
print(f"Video saved to: {output}")
```

## API Response Format

### Success (200)
```json
{
  "success": true,
  "output_path": "/tmp/lyric_video_12345.mp4",
  "duration": 12.5,
  "resolution": "1080x1920",
  "lyrics_count": 8
}
```

### Error (400/500)
```json
{
  "error": "Background file not found: /path/to/file.mp4"
}
```

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| `File not found` | Check file paths are correct and files exist |
| `FFmpeg not found` | Run `pip install imageio-ffmpeg` |
| `Font not found` | Change font to system font path |
| `Memory error` | Use shorter videos or increase system RAM |

## Customization

```python
from render_engine import LyricVideoRenderer

renderer = LyricVideoRenderer(config)

# Customize styling
renderer.font = 'Montserrat'
renderer.font_size = 100
renderer.text_color = 'white'
renderer.stroke_color = 'black'
renderer.stroke_width = 3

# Render
renderer.render('output.mp4')
```

## Next Steps

1. ✅ Test the render engine with sample files
2. ⏳ Integrate with React frontend (see INTEGRATION_GUIDE.md)
3. ⏳ Add file upload endpoint
4. ⏳ Implement video download functionality

## Documentation

- **README_RENDER_ENGINE.md** - Complete usage guide
- **INTEGRATION_GUIDE.md** - Frontend integration
- **RENDER_ENGINE_SUMMARY.md** - Implementation details
- **example_config.json** - Sample configuration

## Support

For issues or questions, refer to:
1. Troubleshooting section in README_RENDER_ENGINE.md
2. Error handling in INTEGRATION_GUIDE.md
3. Check logs in Flask console output
