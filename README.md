# LyricalGenius - Professional Lyric Video Editor

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**LyricalGenius** is a professional, production-ready lyric video editor with **Auto Lyrics** as the standout feature. Built for musicians and creators to generate viral TikTok/Reels/YouTube Shorts content.

## 🎯 Key Features

### 🌟 Auto Lyrics (Hero Feature)
- **AI-Powered Transcription** via Google Gemini API
- Automatic timing synchronization
- Support for 9+ languages
- One-click generation of timed lyrics
- Professional karaoke-style animations

### 🎨 Professional Multi-Panel UI
- **Top Toolbar**: Undo/Redo, Play/Pause, Export
- **Left Sidebar**: Media, Captions, Effects, Stickers, Audio, Templates
- **Center Canvas**: Real-time preview with aspect ratio switching (9:16, 16:9, 1:1)
- **Bottom Timeline**: Multi-track editing with draggable clips
- **Right Properties**: Contextual editing panel

### ✨ 20+ Animation Templates
- Karaoke Highlight
- Bottom Third Static
- Center Pop-In
- Word-by-Word Bounce
- Neon Glow
- Typewriter
- Gradient Sweep
- Blur Fade
- Scale Pulse
- Flip 3D
- Slide In (Left/Right)
- Explode Particles
- Rainbow Cycle
- Bold Entrance
- Jitter Shake
- Outline Stroke
- Underline Wipe
- Fade + Blur
- Skew Perspective
- Bounce Scale
- ...and more!

### 🎬 Video Editing
- Multi-track timeline with zoom (10%-400%)
- Drag & drop clips
- Track locking and visibility toggles
- Real-time preview rendering
- Aspect ratio switching
- Project auto-save (every 10 seconds)

### 🎵 Audio Support
- Audio file upload and playback
- Waveform visualization
- Multiple audio tracks
- Volume control

### 💾 Project Management
- IndexedDB persistence
- Auto-save functionality
- Undo/Redo stack (50 history steps)
- Project name editing

### ⌨️ Keyboard Shortcuts
- `Space` - Play/Pause
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo
- `Delete` / `Backspace` - Delete selected clips
- `Escape` - Deselect all

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key (for Auto Lyrics)
- Optional: ElevenLabs API key (for voiceover generation)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lyricalgenius.git
cd lyricalgenius

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys to .env.local
# GEMINI_API_KEY=your_google_gemini_api_key
# ELEVENLABS_API_KEY=your_elevenlabs_api_key (optional)

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - GEMINI_API_KEY
# - ELEVENLABS_API_KEY (optional)
```

#### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
lyricalgenius/
├── api/                      # Vercel serverless functions
│   ├── transcribe.ts        # Google Gemini transcription endpoint
│   └── voiceover.ts         # ElevenLabs voiceover endpoint
├── src/
│   ├── api/                 # Frontend API clients
│   ├── components/
│   │   ├── tabs/           # Sidebar tab components
│   │   ├── modals/         # Modal dialogs
│   │   ├── Editor.tsx      # Main editor layout
│   │   ├── Toolbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PreviewCanvas.tsx
│   │   ├── Timeline.tsx
│   │   └── PropertiesPanel.tsx
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx
│   └── main.tsx
├── .env.example            # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── vercel.json            # Vercel deployment config
```

## 🔧 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **IndexedDB (idb)** - Local persistence
- **Lucide React** - Icons
- **Web Audio API** - Audio playback
- **Canvas API** - Video preview rendering

### Backend
- **Vercel Serverless Functions** - API endpoints
- **Google Gemini API** - AI transcription
- **ElevenLabs API** - Text-to-speech (optional)

## 🎯 Usage

### 1. Upload Audio
- Click **Media** tab in left sidebar
- Upload an audio file (MP3, WAV, etc.)
- Audio automatically appears on timeline

### 2. Generate Auto Lyrics
- Click **Text/Captions** tab
- Select voice language (English, Spanish, French, etc.)
- Click **"Generate Auto Lyrics"** button
- Wait for AI transcription (5-30 seconds)
- Lyrics appear as individual clips on timeline

### 3. Customize Captions
- Click any caption clip on timeline to select
- Edit text in **Properties Panel** (right side)
- Adjust font, size, color, alignment
- Change timing (start/end times)

### 4. Apply Animation Templates
- Click **Templates** tab
- Select one or more caption clips
- Click an animation template to apply
- Preview in center canvas

### 5. Export Video
- Click **Export** button in top toolbar
- Choose preset (TikTok, Instagram Reels, YouTube Shorts, etc.)
- Select quality and format
- Click **Export Video**

## 🔐 API Configuration

### Google Gemini API
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. For Vercel: Add to project environment variables

### ElevenLabs API (Optional)
1. Get API key from [ElevenLabs](https://elevenlabs.io)
2. Add to `.env.local`:
   ```
   ELEVENLABS_API_KEY=your_key_here
   ```

## 🎨 Design Philosophy

- **Professional First** - No generic AI aesthetic, video-editor-like interface
- **Musician-Friendly** - Built for music creators, not generic video makers
- **Vector Text Only** - All captions rendered as HTML/CSS, not canvas/image
- **Privacy-First** - All processing client-side (except AI APIs)
- **Light Mode Primary** - Clean, off-white workspace with dark accents

## 🐛 Known Limitations

- Export functionality is placeholder (needs MediaRecorder API or server rendering)
- No batch processing yet
- Background visualizers coming soon
- Mobile support limited (desktop-optimized)

## 📝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Google Gemini for AI transcription
- ElevenLabs for voiceover generation
- Vercel for hosting and serverless functions
- React, Vite, and Tailwind teams

## 📧 Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/lyricalgenius/issues)
- Discussions: [Ask questions](https://github.com/yourusername/lyricalgenius/discussions)

---

**Made with ❤️ for musicians and creators worldwide**
