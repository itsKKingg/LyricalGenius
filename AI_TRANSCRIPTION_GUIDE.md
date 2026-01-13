# AI-Powered Auto-Sync Word Timestamps

This feature automatically generates word-level timestamps for lyrics using OpenAI's Whisper speech recognition model.

## 🎯 Overview

The Auto-Sync with AI feature transcribes uploaded audio files and returns precise word-level timestamps (start and end time in milliseconds) for every spoken word. This eliminates the need for manual timestamp entry and dramatically speeds up the lyric video creation process.

## 🚀 Features

- **Automatic Speech Recognition**: Uses OpenAI Whisper model for accurate transcription
- **Word-Level Precision**: Returns start and end timestamps for every single word
- **Real-Time Feedback**: Shows "Listening..." animation during processing
- **Visual Confirmation**: Displays "AI Synced" badge when complete
- **Error Handling**: Graceful error messages for failed transcriptions
- **Language Support**: Automatic language detection (supports 90+ languages)

## 🔧 Backend Implementation

### API Endpoint: `/api/transcribe`

**Method**: POST  
**Content-Type**: multipart/form-data

**Request**:
```bash
curl -X POST http://localhost:8000/api/transcribe \
  -F "audio=@your_audio_file.mp3"
```

**Response**:
```json
{
  "success": true,
  "lyrics": [
    {"text": "Hello", "start": 0, "end": 800},
    {"text": "world", "start": 800, "end": 1600},
    {"text": "this", "start": 1600, "end": 2400}
  ],
  "duration": 10.5,
  "language": "en",
  "text": "Hello world this is a test"
}
```

### Dependencies

Added to `requirements.txt`:
- `openai-whisper` - Core transcription engine
- `torch` - PyTorch for ML model
- `torchaudio` - Audio processing utilities

### Model Selection

The endpoint uses Whisper's `base` model by default for a balance of speed and accuracy:

- **tiny**: Fastest, less accurate (~1GB RAM)
- **base**: Balanced (default) (~1GB RAM)
- **small**: More accurate (~2GB RAM)
- **medium**: High accuracy (~5GB RAM)
- **large**: Best accuracy (~10GB RAM)

To change the model, edit `api/index.py`:
```python
model = whisper.load_model("small")  # Change to desired model
```

## 🎨 Frontend Implementation

### New Props in TextEditorView

```typescript
interface TextEditorViewProps {
  // ... existing props
  onLyricsUpdate: (lyrics: LyricWord[]) => void;  // Callback to update lyrics
  audioFile: File | null;                          // Audio file reference
}
```

### UI Components

1. **✨ Auto-Sync with AI Button**
   - Located next to "Export Project" button
   - Gradient purple/indigo styling
   - Disabled when no audio file is uploaded

2. **Loading State**
   - Shows spinning loader icon
   - Text changes to "Listening..."
   - Button disabled during processing

3. **Success State**
   - Green checkmark icon
   - Text changes to "Synced!"
   - Badge appears in Lyrics Timeline section
   - Auto-resets after 3 seconds

4. **Error State**
   - Red error message appears below button
   - Auto-dismisses after 5 seconds
   - Common errors: "No audio file", "Transcription failed"

### User Flow

1. Upload audio file (Home → Create Aesthetic → Upload Audio)
2. Navigate to Text Editor tab
3. Click "✨ Auto-Sync with AI" button
4. Wait for transcription (progress shown with animation)
5. Lyrics automatically appear with word-level timestamps
6. Playback syncs with highlighted words
7. Export video with precise timing

## 📊 Performance

### Processing Times (Approximate)

Using `base` model on standard CPU:

| Audio Duration | Processing Time |
|---------------|----------------|
| 30 seconds    | ~10-15 seconds |
| 1 minute      | ~20-30 seconds |
| 2 minutes     | ~40-60 seconds |
| 5 minutes     | ~2-3 minutes   |

**Note**: First run downloads the model (~140MB for base model), subsequent runs are faster.

### Optimization Tips

1. **Use GPU**: If CUDA/CUDA toolkit is available, Whisper automatically uses GPU for 5-10x speedup
2. **Smaller Models**: Use `tiny` model for faster processing on lower-end hardware
3. **Audio Format**: MP3 or WAV formats work best
4. **Audio Quality**: Clear audio with minimal background noise yields better results

## 🔍 Troubleshooting

### "No audio file provided"
**Solution**: Upload an audio file first before clicking Auto-Sync

### "No words detected in audio"
**Cause**: Audio file may be instrumental or very quiet  
**Solution**: Ensure audio contains clear speech/vocals

### "Transcription failed"
**Possible Causes**:
- Model not downloaded (first run may take longer)
- Insufficient memory (try smaller model)
- Corrupted audio file
- Unsupported audio format

**Solutions**:
1. Check Flask console logs for detailed error
2. Try converting audio to MP3/WAV format
3. Reduce audio file size
4. Use smaller Whisper model

### Slow Processing
**Solutions**:
1. Use smaller model (`tiny` instead of `base`)
2. Enable GPU acceleration (install CUDA toolkit)
3. Reduce audio file length
4. Close other heavy applications

## 🛠️ Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run Flask API
cd api && python index.py

# Test transcription endpoint
curl -X POST http://localhost:8000/api/transcribe \
  -F "audio=@test_audio.mp3"

# Run frontend
npm run dev
```

## 🎯 Technical Implementation Details

### Backend Flow
1. Receive audio file via multipart/form-data
2. Save to temporary file
3. Load Whisper model (cached after first run)
4. Transcribe with `word_timestamps=True` flag
5. Extract word-level data from segments
6. Convert timestamps to milliseconds
7. Return JSON response
8. Clean up temporary file

### Frontend Flow
1. User clicks Auto-Sync button
2. Create FormData with audio File object
3. POST to `/api/transcribe`
4. Show loading animation
5. Receive lyrics array
6. Call `onLyricsUpdate()` callback
7. Update App state with new lyrics
8. Show success confirmation
9. Lyrics highlight during playback

## 🔐 Security Considerations

- Temporary files are automatically deleted after processing
- File size limits should be enforced (recommended: 50MB max)
- Rate limiting should be added for production use
- Audio files are not persisted on server

## 🚀 Future Enhancements

- [ ] WebSocket progress updates for long transcriptions
- [ ] Support for custom vocabulary/spelling
- [ ] Manual timestamp editing interface
- [ ] Multiple language selection dropdown
- [ ] Batch processing for multiple audio files
- [ ] Export/import timestamp files (.srt, .vtt)
- [ ] Fine-tuned models for music lyrics

## 📝 License

This feature uses OpenAI Whisper under MIT License.

---

**Last Updated**: 2024
**Version**: 1.0.0
