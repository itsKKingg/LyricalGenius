import { useRef } from 'react';
import { Upload, Music, Video, Image as ImageIcon } from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import type { MediaFile } from '../../types';

export default function MediaTab() {
  const { mediaFiles, addMediaFile, addAudioClip, addVideoClip } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const type = file.type.startsWith('audio') ? 'audio' : file.type.startsWith('video') ? 'video' : 'image';

        const mediaFile: MediaFile = {
          id: `media-${Date.now()}-${Math.random()}`,
          name: file.name,
          type,
          src,
          size: file.size,
          uploadedAt: Date.now(),
        };

        // Get duration for audio/video
        if (type === 'audio' || type === 'video') {
          const element = document.createElement(type) as HTMLMediaElement;
          element.src = src;
          element.onloadedmetadata = () => {
            mediaFile.duration = element.duration * 1000; // Convert to ms
            addMediaFile(mediaFile);

            // Automatically add to timeline
            if (type === 'audio') {
              addAudioClip({
                type: 'audio',
                src,
                startMs: 0,
                durationMs: mediaFile.duration || 0,
                track: 0,
                volume: 1,
              });
            } else if (type === 'video') {
              addVideoClip({
                type: 'video',
                src,
                startMs: 0,
                durationMs: mediaFile.duration || 0,
                track: 0,
                opacity: 1,
                scale: 1,
                positionX: 50,
                positionY: 50,
                rotation: 0,
              });
            }
          };
        } else {
          addMediaFile(mediaFile);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Music size={20} className="text-green-400" />;
      case 'video':
        return <Video size={20} className="text-blue-400" />;
      case 'image':
        return <ImageIcon size={20} className="text-purple-400" />;
      default:
        return <Upload size={20} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Upload Area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*,image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-indigo-500 hover:bg-gray-800 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-300">Click to upload files</p>
            <p className="text-xs text-gray-500">Audio, Video, or Images</p>
          </div>
        </button>
      </div>

      {/* Media List */}
      <div>
        <h4 className="font-semibold text-gray-200 mb-3">Imported Media</h4>
        <div className="space-y-2">
          {mediaFiles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No media files uploaded yet
            </p>
          ) : (
            mediaFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-750 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatFileSize(file.size)}</span>
                    {file.duration && (
                      <>
                        <span>•</span>
                        <span>{(file.duration / 1000).toFixed(1)}s</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
