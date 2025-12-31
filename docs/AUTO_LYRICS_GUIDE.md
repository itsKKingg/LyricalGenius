# Auto Lyrics Feature - Implementation Guide

## Overview

The Auto Lyrics feature uses Google's Gemini API to automatically transcribe audio files and generate timed lyric segments. This is the standout feature of LyricalGenius, making it easy for musicians to create lyric videos without manual timing.

## Architecture

### Client-Side Flow

1. **User uploads/selects audio** → File is converted to base64
2. **API request sent** → Base64 audio + language preference
3. **Transcription processing** → Gemini API returns timed segments
4. **Lyrics generated** → Individual lyric lines placed on timeline
5. **Template applied** → Default animation style (Karaoke Highlight)

### Server-Side Flow (Vercel)

1. **Request received** → `/api/transcribe` endpoint
2. **API key retrieved** → From environment variables
3. **Gemini API called** → Audio data sent for transcription
4. **Response parsed** → Convert to standard format
5. **Return to client** → Timed segments with confidence scores

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
ELEVENLABS_API_KEY=your_actual_elevenlabs_key_here
VITE_API_BASE_URL=/api
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it to your `.env.local` file

**Note:** Gemini API has a free tier with generous limits. Check [Google AI pricing](https://ai.google.dev/pricing) for current rates.

### 3. Deploy to Vercel

#### Option A: Automatic Deployment

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `GEMINI_API_KEY` → Your Gemini key
   - `ELEVENLABS_API_KEY` → Your ElevenLabs key (optional)
4. Deploy

#### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## Usage

### For Musicians/Creators

1. **Open a project** with audio already loaded
2. **Go to the Lyrics tab** in the right panel
3. **Click "Auto Lyrics"** button (purple gradient)
4. **Select audio** (uses project audio by default)
5. **Choose language** of the lyrics
6. **Click "Generate Lyrics"**
7. **Wait for transcription** (typically 2-10 seconds)
8. **Review generated lyrics** on the timeline
9. **Apply animation template** from Effects tab

### For Developers

#### Testing the Mock API

If you don't have API keys yet, the app will use a mock transcription service for testing:

```typescript
// In src/api/transcribe.ts
if (API_BASE_URL === '/api' && !import.meta.env.PROD) {
  // Mock transcription will be used
}
```

#### Testing with Real API

1. Set `VITE_API_BASE_URL=http://localhost:3000/api` in `.env.local`
2. Run local development server:
   ```bash
   npm run dev
   ```
3. Set up local Vercel functions or deploy to test the real API

## API Response Format

### Successful Response

```typescript
{
  "segments": [
    {
      "text": "Don't you",
      "startMs": 0,
      "endMs": 500,
      "confidence": 0.95
    },
    {
      "text": "ever let it go",
      "startMs": 500,
      "endMs": 1200,
      "confidence": 0.98
    }
  ],
  "fullText": "Don't you ever let it go",
  "confidence": 0.96
}
```

### Error Response

```typescript
{
  "error": "Transcription Failed",
  "message": "Failed to process audio"
}
```

## Animation Templates

The system includes 20+ pre-built animation templates:

1. **Karaoke Highlight Bar** - Horizontal color sweep
2. **Bottom Third Static** - Bold text with outline
3. **Center Large Pop-In** - Scale animation
4. **Word-by-Word Bounce** - Individual word animations
5. **Neon Outline Glow** - Glowing text effect
6. **Typewriter Sequential** - Letter-by-letter reveal
7. **Gradient Fill Sweep** - Color gradient animation
8. **Blur Fade In** - Blur-to-sharp transition
9. **Scale Pulse** - Rhythmic scaling
10. **Flip 3D** - 3D perspective flip
11. **Slide In from Sides** - Side entry animation
12. **Explode Particles** - Particle burst effect
13. **Rainbow Cycle** - Color cycling
14. **Bold Entrance** - Quick scale + fade
15. **Jitter Shake** - Shake effect
16. **Outline Stroke Draw** - Stroke animation
17. **Underline Wipe** - Underline reveal
18. **Fade + Blur** - Smooth transition
19. **Skew Perspective** - Perspective skew
20. **Bounce Scale** - Bouncy scaling

All templates are accessible from the Effects tab's Template Gallery.

## Troubleshooting

### "Transcription service not configured"

**Cause:** `GEMINI_API_KEY` environment variable not set

**Solution:**
1. Add `GEMINI_API_KEY` to `.env.local` (local) or Vercel environment variables (production)
2. Restart the development server
3. Redeploy if on Vercel

### "Failed to process audio"

**Cause:** API error or invalid audio format

**Solution:**
1. Check audio file format (MP3, WAV, M4A supported)
2. Verify API key is valid
3. Check Vercel logs for detailed error
4. Try with a shorter audio clip for testing

### "Transcription takes too long"

**Cause:** Long audio file or API rate limits

**Solution:**
1. Break audio into smaller segments (< 5 minutes recommended)
2. Check API quota usage
3. Consider caching transcriptions locally

### Low confidence scores

**Cause:** Poor audio quality or unclear speech

**Solution:**
1. Use higher quality audio
2. Ensure clear vocals in recording
3. Manually edit low-confidence segments
4. Try different language setting

## Performance Optimization

### Audio File Size

- **Recommended:** < 10MB per transcription
- **Maximum:** 25MB (Gemini limit)
- **Optimal:** 1-5MB for best results

### Caching Strategy

Transcriptions are automatically saved with the project in IndexedDB. No need to re-transcribe unless audio changes.

### Batch Processing

For multiple projects, the system supports:
- Reusing transcriptions across projects
- Exporting/importing lyric data
- Manual editing of any generated lyrics

## Security Notes

### API Key Protection

- ✅ Keys stored server-side (Vercel environment variables)
- ✅ Never exposed to client code
- ✅ No API calls from browser
- ❌ Never commit `.env.local` to git
- ❌ Never hardcode keys in code

### Data Privacy

- ✅ Audio processed server-side
- ✅ No user tracking or analytics
- ✅ Data not stored permanently on servers
- ✅ Projects saved locally (IndexedDB)

## Future Enhancements

### Planned Features

1. **Voice Language Detection** - Auto-detect spoken language
2. **Word-Level Timing** - Per-word timestamps for karaoke
3. **Confidence Highlighting** - Visual indicators for low confidence
4. **Batch Transcription** - Process multiple files at once
5. **Custom Pronunciation Dictionary** - For proper names/technical terms
6. **Real-Time Preview** - Live transcription as you speak

### Integration Opportunities

1. **ElevenLabs Voiceover** - AI voice generation for narration
2. **Spotify API** - Fetch lyrics from Spotify catalog
3. **YouTube API** - Import captions from YouTube videos
4. **Cloud Storage** - Save projects to cloud for collaboration

## Contributing

To improve the auto-lyrics feature:

1. Test with various audio formats and languages
2. Report accuracy issues with sample audio
3. Suggest new animation templates
4. Improve error messages and UX
5. Add more language options

## Support

For issues or questions:
- Check [GitHub Issues](https://github.com/your-repo/issues)
- Review [API Documentation](https://ai.google.dev/docs)
- Consult [Troubleshooting](#troubleshooting) section
