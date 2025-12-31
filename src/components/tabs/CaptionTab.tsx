import { useState } from 'react';
import { Sparkles, Plus, Trash2, Loader2 } from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { transcribeAudio } from '../../api/transcribe';
import { getDefaultCaptionStyle } from '../../utils/animationTemplates';
import type { Caption } from '../../types';

export default function CaptionTab() {
  const { currentProject, addCaption, deleteCaption, selectClip, mediaFiles } = useEditor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');

  const handleAutoLyrics = async () => {
    // Find audio file in media
    const audioFile = mediaFiles.find((f) => f.type === 'audio');
    
    if (!audioFile) {
      setError('Please upload an audio file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the audio blob from the data URL
      const response = await fetch(audioFile.src);
      const blob = await response.blob();
      const file = new File([blob], audioFile.name, { type: blob.type });

      // Call transcription API
      const result = await transcribeAudio(file, language);

      // Add captions to timeline
      result.segments.forEach((segment) => {
        const caption: Omit<Caption, 'id'> = {
          text: segment.text,
          startMs: segment.startMs,
          endMs: segment.endMs,
          style: getDefaultCaptionStyle(),
          track: 1,
        };
        addCaption(caption);
      });

      setError(null);
      alert(`✅ ${result.segments.length} lyrics generated!`);
    } catch (err) {
      const error = err as Error;
      console.error('Auto lyrics error:', error);
      setError(error.message || 'Failed to generate lyrics. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Get all captions from current project
  const captions = currentProject?.tracks
    .filter((t) => t.type === 'caption')
    .flatMap((t) => t.clips as Caption[]) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Auto Lyrics Button */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={28} className="text-yellow-300" />
          <h3 className="text-xl font-bold">Auto Lyrics</h3>
        </div>
        <p className="text-sm text-indigo-100 mb-4">
          Upload or select audio → auto-generate timed lyrics
        </p>
        
        {/* Language Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Voice Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        <button
          onClick={handleAutoLyrics}
          disabled={loading || mediaFiles.filter(f => f.type === 'audio').length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Transcribing audio...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Auto Lyrics</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/40 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Manual Caption Creator */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-200">Manual Captions</h4>
          <button
            onClick={() => {
              const caption: Omit<Caption, 'id'> = {
                text: 'New Caption',
                startMs: currentProject?.duration || 0,
                endMs: (currentProject?.duration || 0) + 2000,
                style: getDefaultCaptionStyle(),
                track: 1,
              };
              addCaption(caption);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Caption
          </button>
        </div>

        {/* Caption List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {captions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No captions yet. Use Auto Lyrics or add manually.
            </p>
          ) : (
            captions.map((caption) => (
              <div
                key={caption.id}
                className="flex items-center gap-2 p-3 bg-gray-800 rounded hover:bg-gray-750 cursor-pointer group"
                onClick={() => selectClip(caption.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{caption.text}</p>
                  <p className="text-xs text-gray-400">
                    {(caption.startMs / 1000).toFixed(2)}s - {(caption.endMs / 1000).toFixed(2)}s
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCaption(caption.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500 rounded transition-all"
                  title="Delete caption"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
