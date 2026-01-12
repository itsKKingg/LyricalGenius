# Pinterest Bridge & Media Preview Implementation

## Overview
This implementation completes the Pinterest API integration, 9:16 video preview bridge, and UX enhancements for the LyricalGenius editor.

## ✅ Completed Features

### 1. Pinterest API Integration
**File: `src/components/editor/tabs/PinterestView.tsx`**
- ✅ `handleFetch` async function implemented
- ✅ POST request to `http://localhost:8000/api/pinterest` with Pinterest URL
- ✅ Maps response URLs to MediaAsset objects
- ✅ Displays fetched media as selectable thumbnails in a grid
- ✅ URL validation (checks for 'pinterest.com')
- ✅ Error handling with user-friendly messages

**Python Backend: `api/index.py`**
- ✅ Flask server running on port 8000
- ✅ `/api/pinterest` endpoint for POST requests
- ✅ Uses `pinterest-dl` command to extract media URLs
- ✅ Returns JSON response with `{ success: true, links: [...] }`
- ✅ CORS enabled for cross-origin requests
- ✅ Comprehensive error handling

### 2. 9:16 Video Preview Bridge
**File: `src/app/editor/App.tsx`**
- ✅ `selectedMedia` state in `AppState`
- ✅ `handleMediaSelect` function to update selected media
- ✅ `selectedMedia` passed to `VideoPreview` component
- ✅ `onMediaSelect` prop passed to `PexelsView`, `PinterestView`, and `TextEditorView`
- ✅ Real-time preview updates when thumbnail is clicked

**File: `src/components/editor/VideoPreview.tsx`**
- ✅ 9:16 aspect ratio preview frame (270x480px)
- ✅ Displays video with controls or image
- ✅ Shows "No media selected" placeholder when nothing is selected
- ✅ Displays media title and duration
- ✅ Indigo-500 ring for visual indication

### 3. UX Enhancements

#### Loading States
**PinterestView.tsx:**
- ✅ Loading spinner using `Loader2` icon
- ✅ "Fetching media from Pinterest..." message
- ✅ Centered loading state with 64px height
- ✅ Disabled Fetch button while loading
- ✅ Button text changes to "Fetching..." with spinner

**PexelsView.tsx:**
- ✅ Uses mock data (no loading state needed)

#### Active Border States
**PinterestView.tsx:**
- ✅ Selected media has `ring-2 ring-indigo-500 shadow-lg`
- ✅ Unselected media has `ring-1 ring-slate-200 dark:ring-slate-700`
- ✅ Hover effect adds `hover:ring-2 hover:ring-indigo-500 hover:shadow-lg`
- ✅ Smooth transitions with `transition-all`

**PexelsView.tsx:**
- ✅ Same active border styling as PinterestView
- ✅ Hover effects for better UX

## Architecture

### Component Props Flow
```
App.tsx (state.selectedMedia)
  ├── VideoPreview (selectedMedia)
  ├── PinterestView (selectedMedia, onMediaSelect)
  └── PexelsView (selectedMedia, onMediaSelect)
```

### API Request Flow
```
User enters URL → PinterestView.handleFetch()
  → POST http://localhost:8000/api/pinterest
    → Python Flask API
      → pinterest-dl command
        → Returns media URLs
          → Map to MediaAsset[]
            → Display in grid
```

### Media Selection Flow
```
User clicks thumbnail → onMediaSelect(media)
  → setState({ selectedMedia: media })
    → VideoPreview re-renders with new media
```

## Setup Instructions

### 1. Start Python Backend
```bash
pip install -r requirements.txt
python api/index.py
```
Backend runs on `http://localhost:8000`

### 2. Start Next.js Frontend
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

### 3. Usage
1. Navigate to editor page
2. Click "Pinterest" tab in sidebar
3. Enter a Pinterest URL (e.g., https://pinterest.com/pin/...)
4. Click "Fetch" button
5. Wait for media to load (loading spinner shown)
6. Click any thumbnail to select it
7. Video preview on the right updates instantly to show selected media

## Technical Details

### Media Asset Type
```typescript
interface MediaAsset {
  id: string;
  url: string;
  thumbnail: string;
  type: 'video' | 'image';
  title?: string;
  duration?: number;
}
```

### Pinterest API Response Format
```json
{
  "success": true,
  "links": [
    "https://example.com/image1.jpg",
    "https://example.com/video1.mp4"
  ]
}
```

### Error Handling
- Invalid URL validation (checks for 'pinterest.com')
- Network error handling with try-catch
- User-friendly error messages displayed below input
- Empty state when no media fetched yet

## Design System Compliance
- ✅ Uses `slate` color palette for light/dark themes
- ✅ `indigo-500` for primary actions and active states
- ✅ Tailwind CSS utility classes throughout
- ✅ Lucide React icons for consistent iconography
- ✅ Shadcn/UI components (Button, Input)
- ✅ Smooth animations with Framer Motion
- ✅ Responsive grid layout (2-6 columns based on screen size)

## Future Enhancements
- Add Pexels API integration (currently using mock data)
- Implement media downloading/saving
- Add bulk selection for multiple media items
- Add drag-and-drop support for URLs
- Implement media preview auto-play on hover
- Add media metadata display (dimensions, file size)
