import { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Lock, Eye, EyeOff } from 'lucide-react';
import { useEditor } from '../hooks/useEditor';
import { usePlayback } from '../hooks/usePlayback';
import type { Caption } from '../types';

export default function Timeline() {
  const { currentProject, zoom, setZoom, toggleTrackLock, toggleTrackVisibility, selectClip, selectedClips } = useEditor();
  const { currentTime, seek } = usePlayback();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!currentProject) return null;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * currentProject.duration;
    seek(time);
  };

  const handleTimelineDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleTimelineClick(e);
  };

  const pixelsPerMs = (zoom / 100) * 0.1; // Adjust based on zoom

  return (
    <div className="h-80 bg-gray-900 border-t border-gray-800 flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">Timeline</h3>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 10)}
            disabled={zoom <= 10}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} className="text-gray-300" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(zoom + 10)}
            disabled={zoom >= 400}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Labels */}
        <div className="w-32 bg-gray-850 border-r border-gray-800 overflow-y-auto">
          {currentProject.tracks.map((track) => (
            <div
              key={track.id}
              className="h-16 border-b border-gray-800 px-3 py-2 flex flex-col justify-center"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-300 truncate">{track.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleTrackVisibility(track.id)}
                    className="p-0.5 rounded hover:bg-gray-700 transition-colors"
                    title={track.visible ? 'Hide track' : 'Show track'}
                  >
                    {track.visible ? (
                      <Eye size={12} className="text-gray-400" />
                    ) : (
                      <EyeOff size={12} className="text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleTrackLock(track.id)}
                    className="p-0.5 rounded hover:bg-gray-700 transition-colors"
                    title={track.locked ? 'Unlock track' : 'Lock track'}
                  >
                    <Lock size={12} className={track.locked ? 'text-red-400' : 'text-gray-500'} />
                  </button>
                </div>
              </div>
              <span className="text-xs text-gray-500 capitalize">{track.type}</span>
            </div>
          ))}
        </div>

        {/* Timeline Tracks */}
        <div className="flex-1 overflow-auto relative">
          <div
            ref={timelineRef}
            className="relative h-full bg-gray-900"
            style={{ width: Math.max(800, currentProject.duration * pixelsPerMs) }}
            onClick={handleTimelineClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleTimelineDrag}
          >
            {/* Time Ruler */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 border-b border-gray-700 flex items-center px-2">
              {Array.from({ length: Math.ceil(currentProject.duration / 1000) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-gray-400"
                  style={{ left: i * 1000 * pixelsPerMs }}
                >
                  {i}s
                </div>
              ))}
            </div>

            {/* Tracks */}
            <div className="absolute top-6 left-0 right-0 bottom-0">
              {currentProject.tracks.map((track, trackIndex) => (
                <div
                  key={track.id}
                  className="h-16 border-b border-gray-800 relative"
                  style={{ top: trackIndex * 64 }}
                >
                  {/* Clips */}
                  {track.clips.map((clip) => {
                    const isSelected = selectedClips.includes(clip.id);
                    let clipBgColor = 'bg-indigo-500';
                    let clipText = '';

                    if (track.type === 'caption') {
                      const caption = clip as Caption;
                      clipText = caption.text;
                      clipBgColor = 'bg-purple-500';
                    } else if (track.type === 'audio') {
                      clipBgColor = 'bg-green-500';
                      clipText = 'Audio';
                    } else if (track.type === 'video') {
                      clipBgColor = 'bg-blue-500';
                      clipText = 'Video';
                    }

                    const startX = ('startMs' in clip ? clip.startMs : 0) * pixelsPerMs;
                    const width = ('endMs' in clip ? clip.endMs - clip.startMs : ('durationMs' in clip ? clip.durationMs : 0)) * pixelsPerMs;

                    return (
                      <div
                        key={clip.id}
                        className={`absolute h-12 rounded ${clipBgColor} ${
                          isSelected ? 'ring-2 ring-white' : ''
                        } cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                        style={{
                          left: startX,
                          width: Math.max(width, 20),
                          top: 2,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectClip(clip.id);
                        }}
                      >
                        <div className="px-2 py-1 h-full flex items-center">
                          <span className="text-xs text-white font-medium truncate">{clipText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: currentTime * pixelsPerMs }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
