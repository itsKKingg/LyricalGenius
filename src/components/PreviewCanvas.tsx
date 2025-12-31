import { Play } from 'lucide-react';
import { useEditor } from '../hooks/useEditor';
import { useEditorStore } from '../stores/editorStore';
import { usePlayback } from '../hooks/usePlayback';
import { getAnimationCSS } from '../utils/animationTemplates';
import type { Caption } from '../types';

export default function PreviewCanvas() {
  const { currentProject } = useEditor();
  const { isPlaying, currentTime, togglePlayback } = usePlayback();

  if (!currentProject) return null;

  // Calculate canvas dimensions based on aspect ratio
  const aspectRatio = currentProject.aspectRatio;
  let canvasWidth = 400;
  let canvasHeight = 700;

  if (aspectRatio === '16:9') {
    canvasWidth = 800;
    canvasHeight = 450;
  } else if (aspectRatio === '1:1') {
    canvasWidth = 600;
    canvasHeight = 600;
  } else if (aspectRatio === '9:16') {
    canvasWidth = 337;
    canvasHeight = 600;
  }

  // Get active captions at current time
  const activeCaptions: Caption[] = [];
  currentProject.tracks.forEach((track) => {
    if (track.type === 'caption' && track.visible) {
      track.clips.forEach((clip) => {
        const caption = clip as Caption;
        if (currentTime >= caption.startMs && currentTime <= caption.endMs) {
          activeCaptions.push(caption);
        }
      });
    }
  });

  return (
    <div className="flex-1 flex items-center justify-center bg-black overflow-hidden p-8">
      <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
        {/* Canvas Background */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl"
          style={{ backgroundColor: currentProject.backgroundColor }}
        >
          {/* Render active captions */}
          <div className="absolute inset-0">
            {activeCaptions.map((caption) => {
              const progress = (currentTime - caption.startMs) / (caption.endMs - caption.startMs);
              const animationStyles = getAnimationCSS(caption.style.animationStyle, progress);

              return (
                <div
                  key={caption.id}
                  className="absolute"
                  style={{
                    left: `${caption.style.positionX}%`,
                    top: `${caption.style.positionY}%`,
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '90%',
                  }}
                >
                  <div
                    style={{
                      fontFamily: caption.style.fontFamily,
                      fontSize: `${caption.style.fontSize}px`,
                      fontWeight: caption.style.fontWeight,
                      color: caption.style.color,
                      textAlign: caption.style.alignment,
                      textShadow: caption.style.shadowColor
                        ? `0 0 ${caption.style.shadowBlur}px ${caption.style.shadowColor}`
                        : undefined,
                      WebkitTextStroke: caption.style.outlineWidth
                        ? `${caption.style.outlineWidth}px ${caption.style.outlineColor}`
                        : undefined,
                      ...animationStyles,
                    }}
                  >
                    {caption.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Play button overlay when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlayback}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            >
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={32} className="text-black ml-1" />
              </div>
            </button>
          )}
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => useEditorStore.getState().setAspectRatio(ratio)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                aspectRatio === ratio
                  ? 'bg-white text-black'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Time Display */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 text-white text-sm font-mono rounded">
          {formatTime(currentTime)} / {formatTime(currentProject.duration)}
        </div>
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}
