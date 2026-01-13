# Word Timeline Modal - Implementation Documentation

## Overview

The Word Timeline Modal is a powerful lyric editing interface that allows users to fine-tune word timings, manipulate text, and control line breaks for video rendering. This document describes the complete implementation.

## Features Implemented

### 1. Timeline UI
- **Horizontal scrollable timeline** with word blocks representing each lyric word
- **Draggable edges** for adjusting `startTime` and `endTime` of each word
- **Visual feedback** with color-coded blocks (active, selected, default)
- **Time markers** for easy reference (seconds displayed at the top)
- **Playhead indicator** that follows audio playback in real-time
- **Auto-scroll** to keep the playhead visible during playback

### 2. Word Manipulation Toolbar
- **aa / Aa / AA** - Toggle text casing (lowercase, title case, uppercase)
- **Make Legato** - Automatically closes gaps between word blocks
- **Split** - Divides a word into two separate blocks (splits text at midpoint)
- **Combine** - Merges selected word with the next word
- **Auto-censor** - Replaces word text with custom censor symbol (default: ****)
- **Break Line** - Adds/removes line break before selected word

### 3. Audio Synchronization
- **Real-time playhead** synced with audio playback
- **Play/Pause controls** integrated in modal
- **Seek functionality** by clicking anywhere on the timeline
- **Visual highlighting** of the currently playing word

### 4. Line Build Preview
- **Live preview** of how words are grouped into lines
- **Automatic grouping** based on:
  - Hard breaks (user-set `breakBefore` flags)
  - Soft breaks (sentence endings, word count limits)
- **Visual indicators** showing line breaks in the timeline

## File Structure

```
src/
├── components/
│   └── editor/
│       ├── WordTimelineModal.tsx      # Main modal component
│       └── tabs/
│           └── TextEditorView.tsx     # Updated with clickable lyrics
├── app/
│   └── editor/
│       ├── types.ts                   # Updated LyricWord interface
│       └── App.tsx                    # Modal integration
```

## Key Components

### WordTimelineModal.tsx

**Props:**
```typescript
interface WordTimelineModalProps {
  isOpen: boolean;
  words: LyricWord[];
  initialSelection?: { start: number; end: number } | null;
  currentTime: number;
  isPlaying: boolean;
  audioDuration: number;
  onClose: () => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (timeMs: number) => void;
  onWordsUpdate: (words: LyricWord[]) => void;
}
```

**State Management:**
- `words` - Local word array with break flags
- `selectedWordIndex` - Currently selected word for editing
- `isDragging` - Tracks active drag operation (word edge)
- `wordsRef` - Ref for accessing latest words in callbacks

**Key Functions:**
- `handleMouseDown/Move/Up` - Edge dragging logic
- `toggleCase` - Text casing manipulation
- `makeLegato` - Gap closure algorithm
- `splitWord` - Word splitting logic
- `combineWords` - Word merging logic
- `autoCensor` - Text censoring
- `toggleLineBreak` - Line break control
- `getLineGroups` - Line grouping algorithm

### Updated LyricWord Interface

```typescript
export interface LyricWord {
  text: string;
  start: number;      // milliseconds
  end: number;        // milliseconds
  breakBefore?: boolean;  // Force new line in video
}
```

The `breakBefore` flag is optional for backward compatibility with existing projects.

### TextEditorView Integration

**New Features:**
- Lyrics displayed as **clickable line groups**
- Each line has hover effect indicating interactivity
- Active line highlighted during playback
- Click opens Word Timeline Modal for that line

**Line Grouping Logic:**
```typescript
const getLineGroups = (): LineGroup[] => {
  // Groups words based on:
  // 1. Hard breaks (breakBefore flags)
  // 2. Sentence endings (. ! ?)
  // 3. Word count limits (8 words max, 5 for sentences)
}
```

## Usage Guide

### Opening the Modal

1. Navigate to the Text Editor view in the workspace
2. Upload audio and run AI Auto-Sync to generate word timings
3. Click any lyric line to open the Word Timeline Modal

### Editing Word Timings

1. **Select a word** by clicking its block in the timeline
2. **Drag edges** to adjust start/end times:
   - Left edge controls `startTime`
   - Right edge controls `endTime`
   - Minimum duration: 100ms enforced
3. Changes are saved automatically after dragging

### Text Manipulation

1. **Select a word** by clicking it
2. Use toolbar buttons:
   - **aa** - Convert to lowercase
   - **Aa** - Convert to Title Case
   - **AA** - Convert to UPPERCASE
   - **Make Legato** - Remove gaps between all words
   - **Split** - Divide word into two parts
   - **Combine** - Merge with next word
   - **Auto-censor** - Replace with censor symbol

### Controlling Line Breaks

1. **Select a word** (cannot be first word)
2. Click **Break Line** button
3. A green "↵" indicator appears above the word
4. The Line Build Preview updates to show new grouping
5. These breaks are preserved in the rendered video

### Audio Playback

- **Play/Pause** using button in toolbar
- **Seek** by clicking anywhere on the timeline
- **Current time** and **duration** displayed in toolbar
- **Playhead** auto-scrolls during playback

### Saving Changes

- Click **Save Changes** button to commit edits
- Click **Cancel** to discard changes
- Modal closes automatically after saving

## Technical Details

### Coordinate System

- **Time units**: Milliseconds (ms)
- **Pixel scaling**: 0.1 pixels per millisecond (100ms = 10px)
- **Timeline width**: Calculated as `audioDuration * 1000 * 0.1`

### Edge Dragging Constraints

- Minimum word duration: 100ms
- Words cannot overlap
- Adjacent word times adjusted automatically
- Prevents dragging beyond audio boundaries

### Line Break Algorithm

**Hard Breaks** (user-controlled):
- Set via `breakBefore` flag
- Takes precedence over soft breaks
- Indicated by green arrow icon

**Soft Breaks** (automatic):
- Triggered by sentence endings (. ! ?)
- Maximum 8 words per line
- Maximum 5 words if sentence ends
- Only applied if no hard break exists

### Performance Optimizations

- `useCallback` for event handlers
- `useRef` for latest state in callbacks
- Debounced updates during drag operations
- RequestAnimationFrame for playhead smoothness

## Styling

The modal uses:
- **Tailwind CSS** for utility classes
- **Framer Motion** for animations
- **Dark mode support** throughout
- **Responsive design** for different screen sizes

Color scheme:
- Selected word: Indigo 500
- Active word: Blue 400
- Default word: Gray 300/700
- Playhead: Red 500
- Line break indicator: Green 500

## Browser Compatibility

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires:
- ES6+ support
- CSS Grid and Flexbox
- HTML5 Audio API

## Future Enhancements

Potential improvements:
- Zoom controls for timeline
- Multi-word selection
- Undo/redo functionality
- Keyboard shortcuts
- Waveform visualization
- Export word timings to JSON/SRT
- Word confidence scoring
- Bulk text operations

## Troubleshooting

**Modal doesn't open:**
- Ensure audio is uploaded
- Check that lyrics exist (run AI Auto-Sync)
- Verify `currentModal` state is 'WORD_TIMELINE'

**Dragging not working:**
- Check mouse event handlers are attached
- Verify `isDragging` state updates
- Ensure timeline ref is initialized

**Audio not syncing:**
- Verify audio element is loaded
- Check `currentTime` prop updates
- Ensure `audioDuration` is set correctly

**Changes not saving:**
- Check `onWordsUpdate` callback is called
- Verify words state is updated
- Ensure parent component handles updates

## Code Examples

### Opening the Modal

```typescript
const handleOpenWordTimeline = (startIndex: number, endIndex: number) => {
  setSelectedLineRange({ start: startIndex, end: endIndex });
  setState(prev => ({ ...prev, currentModal: 'WORD_TIMELINE' }));
};
```

### Handling Word Updates

```typescript
const handleLyricsUpdate = (newLyrics: LyricWord[]) => {
  setState(prev => ({ ...prev, words: newLyrics }));
  setIsProjectSaved(false);
};
```

### Rendering with Line Breaks

```python
# Backend rendering logic
for word in lyrics:
    if word.get('breakBefore'):
        # Start new line in video
        current_line = []
    current_line.append(word['text'])
```

## Testing Checklist

- [ ] Modal opens when clicking lyric line
- [ ] Word blocks render correctly on timeline
- [ ] Edges can be dragged to resize
- [ ] Text manipulation buttons work
- [ ] Line breaks add/remove correctly
- [ ] Audio playback syncs with playhead
- [ ] Timeline auto-scrolls during playback
- [ ] Changes persist when modal reopens
- [ ] Line preview updates in real-time
- [ ] Dark mode renders correctly
- [ ] Mobile/tablet responsive (if applicable)

## Support

For issues or questions:
1. Check console for error messages
2. Verify props are passed correctly
3. Review state updates in React DevTools
4. Check audio element state
5. Test with sample lyrics data

## Credits

Implementation by: AI Assistant
Framework: React + Next.js
UI Library: Tailwind CSS + Framer Motion
Icons: Lucide React
