import React from 'react';
import { Play } from 'lucide-react';
import type { MediaAsset } from '../../app/editor/types';

interface VideoPreviewProps {
  selectedMedia: MediaAsset | null | undefined;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ selectedMedia }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview Frame */}
      <div className="relative w-[270px] h-[480px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-indigo-500/20">
        {selectedMedia ? (
          <>
            {selectedMedia.type === 'video' ? (
              <video
                src={selectedMedia.url}
                className="w-full h-full object-cover"
                poster={selectedMedia.thumbnail}
                controls
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || 'Selected media'}
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4">
              <p className="text-white text-sm font-medium truncate">
                {selectedMedia.title || 'Selected media'}
              </p>
              {selectedMedia.duration && (
                <p className="text-slate-400 text-xs mt-1">
                  {Math.floor(selectedMedia.duration / 60)}:{String(Math.floor(selectedMedia.duration % 60)).padStart(2, '0')}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Play size={28} className="text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-400 text-sm font-medium">No media selected</p>
            <p className="text-slate-600 text-xs mt-1">Choose a thumbnail to preview</p>
          </div>
        )}
      </div>

      {/* Aspect Ratio Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <span className="text-xs font-medium text-slate-300">9:16 Format</span>
      </div>
    </div>
  );
};
