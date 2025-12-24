# Architecture Overview

LyricalGenius is architected as a pure client-side single-page application with a focus on performance, privacy, and maintainability.

## Technology Stack

### Core
- **React 18.3.1**: Component framework with hooks
- **TypeScript 5.4.2**: Type safety and developer experience
- **Vite 5.4.21**: Fast build tool and dev server

### State Management
- **Zustand 4.5.0**: Lightweight state management
- **IndexedDB (idb 8.0.0)**: Client-side persistence
- **React Context**: Theme management

### UI & Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Lucide React 0.344.0**: Icon library
- **Dark mode**: Default theme with class-based switching

### Routing
- **React Router 6.22.0**: Client-side routing

### Audio & Video
- **Web Audio API**: Audio analysis and visualization
- **Canvas API**: Video frame rendering
- **MediaRecorder API**: Video export (planned)

## Architecture Principles

### 1. Privacy First
All data processing happens in the browser:
- No server-side code
- No external API calls for processing
- No user tracking or analytics
- IndexedDB for local storage only

### 2. Component Architecture

```
App (Router)
├── HomePage (Upload & Landing)
├── ProjectsPage (Project List)
└── EditorPage (Main Editor)
    ├── Sidebar (Presets & Navigation)
    ├── VideoPreview (Canvas Renderer)
    │   └── CanvasRenderer (Drawing Logic)
    ├── Timeline (Waveform & Playback)
    └── ControlPanel (Tabs)
        ├── LyricsTab
        ├── TextTab
        ├── BackgroundTab
        ├── EffectsTab
        └── ExportTab
```

### 3. State Management

**Global State (Zustand)**
- `projectStore.ts`: Current project, playback state, lyrics, settings
- Actions: CRUD operations, playback control, settings updates

**Local State (useState)**
- UI interactions (modals, tabs, forms)
- Temporary editing states
- Component-specific data

**Context (React Context)**
- `ThemeContext`: Theme mode and accent colors

### 4. Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
State Update
    ↓
React Re-render
    ↓
Canvas Renderer Update
```

## Key Modules

### Audio Processing (`utils/audio.ts`)
- `extractAudioMetadata()`: Get duration and metadata from audio files
- `generateWaveformData()`: Create waveform visualization data
- `decodeAudioFile()`: Decode audio for processing
- `detectBeats()`: Simple beat detection algorithm
- `AudioPlayer`: Audio playback and analysis wrapper

### Database (`utils/db.ts`)
- `openDB()`: Initialize IndexedDB connection
- `saveProject()`: Persist project and audio file
- `loadProject()`: Retrieve project with audio file
- `getAllProjects()`: Get all projects sorted by date
- `deleteProject()`: Remove project and audio file

### Canvas Rendering (`components/editor/CanvasRenderer.tsx`)
- `renderBackground()`: Draw gradient/solid/visualizer backgrounds
- `renderVisualizer()`: Audio-reactive visualizations
- `renderLyrics()`: Text rendering with animations
- `renderWatermark()`: Overlay watermark
- Animation frame loop for smooth playback

### Presets (`utils/presets.ts`)
- Predefined style configurations
- One-click application to projects
- Viral-ready templates for social media

## Performance Optimizations

### Build Time
- Code splitting by vendor (react, ui, state)
- Tree shaking unused code
- ESBuild minification
- Lazy loading routes

### Runtime
- Canvas rendering with requestAnimationFrame
- Web Audio API for efficient audio analysis
- Zustand shallow equality checks
- React.memo for expensive components
- IndexedDB for async persistence

### Bundle Size
```
react-vendor:  159.75 KB (gzip: 52.17 KB)
index:          50.91 KB (gzip: 12.98 KB)
ui-vendor:      11.89 KB (gzip:  2.79 KB)
state-vendor:    7.01 KB (gzip:  2.87 KB)
CSS:            19.15 KB (gzip:  4.28 KB)
Total:         ~248 KB (gzip: ~75 KB)
```

## Data Models

### Project
```typescript
interface Project {
  id: string
  name: string
  audioUrl: string
  audioFile: File | null
  duration: number
  waveformData: number[]
  lyrics: LyricLine[]
  settings: ProjectSettings
  createdAt: number
  updatedAt: number
  thumbnail?: string
  albumArt?: string
}
```

### LyricLine
```typescript
interface LyricLine {
  id: string
  text: string
  startTime: number
  endTime: number
  words?: LyricWord[]
  confidence?: number
}
```

### ProjectSettings
```typescript
interface ProjectSettings {
  // Video
  videoFormat: '9:16' | '1:1' | '16:9'
  resolution: '1080p' | '720p' | '480p'
  fps: 30 | 60
  
  // Text
  fontFamily: string
  fontSize: number
  fontWeight: number
  textColor: string
  textAlign: 'left' | 'center' | 'right'
  textStroke: boolean
  // ... (50+ settings total)
  
  // Background
  backgroundType: 'gradient' | 'image' | 'albumArt' | 'video' | 'visualizer'
  backgroundGradient: string[]
  
  // Effects
  animationStyle: 'fade' | 'scale' | 'slide' | 'bounce' | 'typewriter' | 'karaoke' | 'none'
  visualizerStyle: 'circular' | 'wave' | 'bars' | 'mirror' | 'none'
  
  // Watermark
  watermarkEnabled: boolean
  watermarkText: string
}
```

## Browser APIs Used

### Essential
- **Web Audio API**: Audio analysis, frequency data
- **Canvas API**: Frame rendering, text drawing
- **IndexedDB**: Project persistence
- **File API**: Audio file reading
- **Blob API**: Object URL creation

### Planned
- **MediaRecorder API**: Video export
- **WebAssembly**: Whisper.wasm for transcription
- **Web Workers**: Background processing

## Browser Compatibility

### Minimum Requirements
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- IndexedDB support
- Web Audio API support
- Canvas 2D context support
- ES2020 JavaScript features

### Known Limitations
- Mobile browsers: Limited performance
- Safari: Some Web Audio API quirks
- Firefox: MediaRecorder codec differences

## Security Considerations

### Data Privacy
- All data stays local (IndexedDB)
- No cookies or tracking
- No external requests for user content

### Content Security
- No eval() or unsafe operations
- Sanitized user inputs
- Blob URL cleanup after use

### Code Security
- TypeScript for type safety
- ESLint for code quality
- Regular dependency updates

## Future Architecture Plans

### v1.1+
- Web Workers for audio processing
- WebAssembly for Whisper transcription
- Service Worker for offline support
- Indexed DB encryption option

### v2.0+
- WebGL renderer for advanced effects
- Shared memory for large files
- WebRTC for collaborative editing
- Progressive Web App (PWA) features

---

**Last Updated**: 2025
**Architecture Version**: 1.0.0
