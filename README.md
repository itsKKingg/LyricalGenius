# 🎵 LyricalGenius

**The ultimate privacy-first lyric video generator for musicians and creators in 2025.**

Create professional, viral-ready lyric videos for TikTok, Instagram Reels, and YouTube Shorts — entirely in your browser. No uploads, no servers, no subscriptions. Just pure client-side magic.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61dafb.svg)](https://reactjs.org/)
[![Powered by WebAssembly](https://img.shields.io/badge/Powered%20by-WebAssembly-654ff0.svg)](https://webassembly.org/)

---

## ✨ Features

### 🔒 **100% Privacy-First**
- All audio processing happens in your browser
- Your music never leaves your device
- No account required, no tracking, no data collection
- Open source and transparent

### 🎨 **Professional Editor**
- Real-time video preview with 9:16, 1:1, and 16:9 formats
- Interactive waveform timeline with precise scrubbing
- Advanced typography controls (fonts, sizes, colors, strokes, glows)
- Multiple text animations (fade, scale, slide, bounce, typewriter, karaoke)
- Audio-reactive visualizers (circular, wave, bars, mirror)

### 🚀 **Viral Presets**
One-click apply professional styles:
- **2025 TikTok Hook** - Bold, punchy text with kinetic animations
- **Reels Emotional** - Soft, elegant fades for heartfelt lyrics
- **Brat Summer** - Lime green maximalist energy
- **Lo-Fi Chill** - Mellow vibes with subtle grain
- **Neon Club** - High-energy EDM with strobing effects

### 🎬 **Export Options**
- MP4 video export (1080p, 720p, 480p)
- GIF export for quick sharing
- 30 or 60 FPS output
- Platform-optimized formats

### 🎯 **Advanced Features**
- Manual lyric editing with timestamp adjustment
- Beat detection and waveform visualization
- Custom watermark support
- Background customization (gradients, images, blurred album art)
- Fully responsive UI with dark mode

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lyricalgenius.git
cd lyricalgenius

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action.

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

---

## 📖 Usage Guide

### 1. **Upload Your Song**
- Drag and drop an audio file (MP3, WAV, M4A, OGG) or click to browse
- The app will automatically extract metadata and generate a waveform

### 2. **Add Lyrics**
- Manually add lyric lines with start/end timestamps
- Edit text and timing with a simple interface
- Auto-transcription coming soon

### 3. **Customize Your Video**
- **Text Tab**: Adjust font, size, color, stroke, shadow, glow
- **Background Tab**: Choose gradients, colors, or upload images
- **Effects Tab**: Select animations and audio visualizers
- **Presets**: Apply viral-ready styles in one click

### 4. **Export**
- Choose your format (9:16, 1:1, 16:9)
- Select resolution and frame rate
- Export as MP4 or GIF directly to your device

---

## 🏗️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Persistence**: IndexedDB (via idb)
- **Icons**: Lucide React
- **Audio Processing**: Web Audio API
- **Video Export**: Canvas API + MediaRecorder API
- **Routing**: React Router

---

## 🗂️ Project Structure

```
lyricalgenius/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   └── editor/       # Editor-specific components
│   │       ├── tabs/     # Control panel tabs
│   │       ├── Sidebar.tsx
│   │       ├── VideoPreview.tsx
│   │       ├── CanvasRenderer.tsx
│   │       ├── Timeline.tsx
│   │       └── ControlPanel.tsx
│   ├── contexts/         # React contexts (Theme)
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── EditorPage.tsx
│   │   └── ProjectsPage.tsx
│   ├── stores/           # Zustand stores
│   │   └── projectStore.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── audio.ts      # Audio processing
│   │   ├── db.ts         # IndexedDB operations
│   │   ├── cn.ts         # Classname utilities
│   │   └── presets.ts    # Viral presets
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎯 Roadmap

### Coming Soon
- [ ] Auto-transcription with Whisper.wasm
- [ ] Batch processing mode
- [ ] Platform-specific thumbnail generation
- [ ] More visualizer styles (WebGL shaders)
- [ ] Custom font upload support
- [ ] Lyrics import from .lrc files
- [ ] Video clip suggestions (detect hooks/chorus)
- [ ] Collaborative editing (share project links)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for independent artists who value privacy
- Inspired by professional lyric video tools
- Powered by modern web standards and open-source technologies

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/lyricalgenius/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lyricalgenius/discussions)

---

**Made with ❤️ for independent artists · No sign-up required · Open source**

🌟 If you find this useful, please star the repo!
