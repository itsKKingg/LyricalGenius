# 🚀 Quick Start Guide: AI Auto-Sync Feature

This guide will help you get started with the new AI-powered word-level timestamp generation feature.

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- FFmpeg (for audio processing)

## 🔧 Installation

### 1. Install Python Dependencies

```bash
cd /home/engine/project
pip install -r requirements.txt
```

**Note**: First-time installation will download the Whisper model (~140MB for base model). This is a one-time operation.

### 2. Install Frontend Dependencies

```bash
npm install --legacy-peer-deps
```

## 🎬 Running the Application

### Start Backend (Flask API)

```bash
cd api
python index.py
```

The API will start on `http://localhost:8000`

### Start Frontend (Next.js)

In a new terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🎯 Using the AI Auto-Sync Feature

### Step 1: Create a New Project

1. Open the app at `http://localhost:3000`
2. Click "Create New Aesthetic"
3. Upload your audio file

### Step 2: Auto-Sync Lyrics

1. Navigate to the **Text Editor** tab
2. You should see a **"✨ Auto-Sync with AI"** button
3. Click the button
4. Wait for the AI to process your audio (progress shown as "Listening...")
5. Lyrics will automatically appear with precise timestamps!

### Step 3: Preview & Adjust

1. Click the **Play** button to hear your audio
2. Watch as words highlight in sync with the audio
3. The timeline auto-scrolls to keep the active word centered
4. Adjust timing manually if needed (future feature)

### Step 4: Export Video

1. Click **"Export Project"** to render your lyric video
2. Monitor progress in the rendering modal
3. Download your finished video!

## 🧪 Testing the Transcription API

### Using the Test Script

```bash
cd api
python test_transcribe.py /path/to/your/audio.mp3
```

**Example Output**:
```
📤 Uploading audio file: test_audio.mp3
⏳ Transcribing... (this may take a moment)

✅ Transcription Successful!
🎵 Duration: 10.50 seconds
🌍 Language: en
📝 Text: Hello world this is a test

📊 Word Count: 6

📜 Lyrics with Timestamps:
------------------------------------------------------------
  1. [  0.00s -   0.80s] Hello
  2. [  0.80s -   1.60s] world
  3. [  1.60s -   2.40s] this
  4. [  2.40s -   3.00s] is
  5. [  3.00s -   3.40s] a
  6. [  3.40s -   4.20s] test
------------------------------------------------------------
```

### Using cURL

```bash
curl -X POST http://localhost:8000/api/transcribe \
  -F "audio=@your_audio_file.mp3"
```

## 🔍 Troubleshooting

### "No audio file provided"
**Fix**: Make sure you've uploaded an audio file before clicking Auto-Sync

### "Transcription failed"
**Possible causes**:
- First run: Model is downloading (check Flask console)
- Insufficient memory: Try using a smaller model
- Corrupted audio: Convert to MP3/WAV format

**Fix**:
```bash
# Check Flask console logs
cd api && python index.py

# Try smaller model (edit api/index.py line 328)
model = whisper.load_model("tiny")  # Instead of "base"
```

### Slow Processing
**Solutions**:
1. Use smaller audio files
2. Use `tiny` model for faster processing
3. Enable GPU acceleration (install CUDA toolkit)
4. Close memory-intensive applications

### Connection Refused
**Fix**: Make sure Flask API is running on port 8000
```bash
cd api && python index.py
```

## 📊 Performance Tips

### Model Selection

Edit `api/index.py` line 328 to change the model:

```python
# Faster but less accurate
model = whisper.load_model("tiny")

# Balanced (default)
model = whisper.load_model("base")

# More accurate but slower
model = whisper.load_model("small")
```

### GPU Acceleration

If you have an NVIDIA GPU with CUDA:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

Processing will be **5-10x faster** with GPU acceleration.

## 🎨 UI Features

### Auto-Sync Button States

1. **Default**: ✨ Auto-Sync with AI (gradient purple/indigo)
2. **Processing**: 🔄 Listening... (spinner animation)
3. **Success**: ✅ Synced! (green checkmark)
4. **Error**: Red error banner with message

### Visual Feedback

- **Active Word**: White text with indigo glow
- **Inactive Words**: Dimmed gray color
- **AI Synced Badge**: Green badge appears in Lyrics Timeline
- **Auto-scroll**: Timeline follows the active word

## 📁 File Structure

```
/home/engine/project/
├── api/
│   ├── index.py                 # Flask API with /api/transcribe endpoint
│   ├── test_transcribe.py       # Test script
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── app/editor/
│   │   ├── App.tsx             # Updated with lyrics state management
│   │   └── types.ts            # LyricWord interface
│   └── components/editor/tabs/
│       └── TextEditorView.tsx  # Auto-Sync button & UI
├── AI_TRANSCRIPTION_GUIDE.md   # Detailed implementation guide
└── QUICK_START.md              # This file
```

## 🆘 Getting Help

### Check Documentation
- `AI_TRANSCRIPTION_GUIDE.md` - Complete technical documentation
- Flask console logs - Detailed error messages
- Browser console - Frontend debugging

### Common Issues

**Issue**: "Module 'whisper' not found"  
**Fix**: `pip install openai-whisper`

**Issue**: "next: not found"  
**Fix**: `npm install --legacy-peer-deps`

**Issue**: Model download stuck  
**Fix**: Check internet connection, model downloads from Hugging Face

**Issue**: Out of memory  
**Fix**: Use smaller model or reduce audio file length

## 🎉 Success Checklist

- [ ] Flask API running on port 8000
- [ ] Frontend running on port 3000
- [ ] Audio file uploaded
- [ ] Auto-Sync button visible
- [ ] Transcription completes successfully
- [ ] Words highlight during playback
- [ ] Export generates video

---

**Need more help?** Check `AI_TRANSCRIPTION_GUIDE.md` for detailed technical documentation.

**Want to contribute?** This feature is open for enhancements! See the "Future Enhancements" section in `AI_TRANSCRIPTION_GUIDE.md`.
