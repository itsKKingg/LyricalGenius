import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Type, Image as ImageIcon, Play, Pause, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import type { MediaAsset, LyricWord } from '../../../app/editor/types';
import { motion, AnimatePresence } from 'framer-motion';

interface TextEditorViewProps {
  selectedMedia: MediaAsset | null | undefined;
  onMediaSelect: (media: MediaAsset) => void;
  lyrics: LyricWord[];
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (timeMs: number) => void;
  audioDuration: number;
  onExport: () => void;
  renderProgress: number | null;
  renderStatus: string;
  onLyricsUpdate: (lyrics: LyricWord[]) => void;
  audioFile: File | null;
}

export const TextEditorView: React.FC<TextEditorViewProps> = ({ 
  selectedMedia, 
  onMediaSelect, 
  lyrics, 
  currentTime, 
  isPlaying, 
  onPlay, 
  onPause, 
  onSeek, 
  audioDuration,
  onExport,
  renderProgress,
  renderStatus,
  onLyricsUpdate,
  audioFile
}) => {
  const [text, setText] = useState('');
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  
  // AI Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Find the current active word based on currentTime
  const getActiveWordIndex = () => {
    return lyrics.findIndex(lyric => 
      currentTime >= lyric.start && currentTime <= lyric.end
    );
  };

  const activeWordIndex = getActiveWordIndex();

  // Scroll to active word when it changes
  useEffect(() => {
    if (activeWordIndex !== -1 && activeWordRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeElement = activeWordRef.current;
      
      // Calculate the position to scroll to (center the active word)
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
      
      container.scrollTo({
        top: container.scrollTop + offset,
        behavior: 'smooth'
      });
    }
  }, [activeWordIndex]);

  // Helper function to format time in mm:ss format
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // AI Transcription handler
  const handleAutoSync = async () => {
    if (!audioFile) {
      setTranscriptionError('Please upload an audio file first');
      setTimeout(() => setTranscriptionError(null), 3000);
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError(null);
    setTranscriptionComplete(false);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      
      if (data.success && data.lyrics) {
        // Update lyrics with AI-generated timestamps
        onLyricsUpdate(data.lyrics);
        setTranscriptionComplete(true);
        
        // Reset success indicator after 3 seconds
        setTimeout(() => setTranscriptionComplete(false), 3000);
      } else {
        throw new Error('Invalid response from transcription service');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionError(error instanceof Error ? error.message : 'Failed to transcribe audio');
      setTimeout(() => setTranscriptionError(null), 5000);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="animate-fade-in"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Audio Lyrics Sync</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Synchronize lyrics with audio playback for precise timing</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button 
              onClick={handleAutoSync}
              disabled={isTranscribing || !audioFile}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranscribing ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Listening...
                </>
              ) : transcriptionComplete ? (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  Synced!
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Auto-Sync with AI
                </>
              )}
            </Button>
            <Button 
              onClick={onExport}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all px-6"
            >
              Export Project
            </Button>
          </div>
          {transcriptionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded"
            >
              {transcriptionError}
            </motion.div>
          )}
        </div>
      </div>

      {/* Audio Controls */}
      {audioDuration > 0 && (
        <div className="bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={isPlaying ? onPause : onPlay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {formatTime(currentTime)} / {formatTime(audioDuration * 1000)}
            </div>
            
            {/* Progress bar */}
            <div className="flex-1 mx-4">
              <div 
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newTime = percentage * audioDuration * 1000;
                  onSeek(newTime);
                }}
              >
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-150"
                  style={{ width: `${(currentTime / (audioDuration * 1000)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Synchronized Lyrics Display */}
      <div className="bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Type size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Lyrics Timeline</h3>
          </div>
          {lyrics.length > 0 && transcriptionComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full"
            >
              <Sparkles size={14} />
              <span>AI Synced</span>
            </motion.div>
          )}
        </div>

        {lyrics.length > 0 ? (
          <div 
            ref={lyricsContainerRef}
            className="max-h-64 overflow-y-auto space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
          >
            {lyrics.map((lyric, index) => {
              const isActive = index === activeWordIndex;
              return (
                <span
                  key={index}
                  ref={isActive ? activeWordRef : null}
                  className={`inline-block mr-2 px-2 py-1 rounded transition-all duration-150 ${
                    isActive 
                      ? 'text-white bg-indigo-600 shadow-lg' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  style={{
                    textShadow: isActive ? '0 0 10px #6366f1' : 'none',
                    color: isActive ? 'white' : undefined
                  }}
                >
                  {lyric.text}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Type size={48} className="mx-auto mb-3 opacity-50" />
            <p>No lyrics available</p>
            <p className="text-sm mt-1">Upload audio and create word timings to see synchronized lyrics</p>
          </div>
        )}
      </div>

      {/* Text Input Area */}
      <div className="bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Type size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Text Overlay</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Add your text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your caption or lyrics here..."
              className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Apply Text
            </Button>
            <Button
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              onClick={() => setText('')}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Media Preview */}
      <div className="bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Selected Media</h3>
        </div>

        {selectedMedia ? (
          <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden relative">
            {selectedMedia.type === 'video' ? (
              <video
                src={selectedMedia.url}
                className="w-full h-full object-cover"
                controls
                poster={selectedMedia.thumbnail}
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || 'Selected media'}
                className="w-full h-full object-cover"
              />
            )}
            {text && (
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white text-xl font-bold drop-shadow-lg bg-black/50 backdrop-blur-sm px-4 py-2 inline-block rounded-lg">
                  {text}
                </p>
              </div>
            )}
            {/* Overlay active lyrics */}
            {lyrics.length > 0 && activeWordIndex !== -1 && (
              <div className="absolute bottom-16 left-0 right-0 text-center">
                <p className="text-white text-lg font-bold drop-shadow-lg bg-black/50 backdrop-blur-sm px-4 py-2 inline-block rounded-lg">
                  {lyrics[activeWordIndex].text}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-slate-950 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-800">
            <Scissors size={48} className="text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium">No media selected</p>
            <p className="text-slate-600 text-sm mt-1">Select media from Pexels or Pinterest to add text</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
