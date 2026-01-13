import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  Type, 
  Sparkles,
  CornerDownRight
} from 'lucide-react';
import { LyricWord } from '@/app/editor/types';
import { Button } from '@/components/ui/button';

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

type CaseMode = 'lower' | 'title' | 'upper';

interface WordWithBreak extends LyricWord {
  breakBefore?: boolean;
}

export function WordTimelineModal({
  isOpen,
  words: initialWords,
  initialSelection,
  currentTime,
  isPlaying,
  audioDuration,
  onClose,
  onPlay,
  onPause,
  onSeek,
  onWordsUpdate
}: WordTimelineModalProps) {
  const [words, setWords] = useState<WordWithBreak[]>(() =>
    initialWords.map(w => ({ ...w, breakBefore: w.breakBefore || false }))
  );
  const wordsRef = useRef<WordWithBreak[]>(words);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<{
    index: number;
    edge: 'start' | 'end';
  } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  const wasDraggingRef = useRef(false);
  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      onWordsUpdate(wordsRef.current);
    }
    wasDraggingRef.current = !!isDragging;
  }, [isDragging, onWordsUpdate]);

  // Sync words when initialWords change
  useEffect(() => {
    setWords(initialWords.map(w => ({ 
      ...w, 
      breakBefore: (w as WordWithBreak).breakBefore || false 
    })));
  }, [initialWords]);

  // Auto-scroll to playhead
  useEffect(() => {
    if (playheadRef.current && timelineRef.current && isPlaying) {
      const playheadPos = playheadRef.current.offsetLeft;
      const containerWidth = timelineRef.current.clientWidth;
      const scrollLeft = playheadPos - containerWidth / 2;
      
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, [currentTime, isPlaying]);

  // Get the active word index based on current time
  const getActiveWordIndex = () => {
    return words.findIndex(word => 
      currentTime >= word.start && currentTime <= word.end
    );
  };

  const activeWordIndex = getActiveWordIndex();

  const pixelsPerMs = 0.1;

  // Convert time (ms) to pixel position
  const timeToPixel = (timeMs: number) => timeMs * pixelsPerMs;

  // Convert pixel position to time (ms)
  const pixelToTime = (pixel: number) => pixel / pixelsPerMs;

  useEffect(() => {
    if (!isOpen) return;
    if (!initialSelection) return;

    const idx = Math.max(0, Math.min(initialSelection.start, wordsRef.current.length - 1));
    setSelectedWordIndex(idx);

    const container = timelineRef.current;
    const word = wordsRef.current[idx];

    if (!container || !word) return;

    requestAnimationFrame(() => {
      const wordCenter = timeToPixel((word.start + word.end) / 2);
      const targetScroll = Math.max(0, wordCenter - container.clientWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    });
  }, [isOpen, initialSelection, timeToPixel]);

  // Handle word edge dragging
  const handleMouseDown = (index: number, edge: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging({ index, edge });
    setSelectedWordIndex(index);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const newTime = Math.max(0, pixelToTime(x));

    setWords(prev => {
      const updated = [...prev];
      const word = updated[isDragging.index];
      
      if (isDragging.edge === 'start') {
        // Ensure start doesn't go beyond end
        word.start = Math.min(newTime, word.end - 100); // Min 100ms duration
        
        // Update previous word's end if needed
        if (isDragging.index > 0) {
          updated[isDragging.index - 1].end = Math.min(
            updated[isDragging.index - 1].end,
            word.start
          );
        }
      } else {
        // Ensure end doesn't go before start
        word.end = Math.max(newTime, word.start + 100); // Min 100ms duration
        
        // Update next word's start if needed
        if (isDragging.index < updated.length - 1) {
          updated[isDragging.index + 1].start = Math.max(
            updated[isDragging.index + 1].start,
            word.end
          );
        }
      }
      
      return updated;
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const applyWordsUpdate = (next: WordWithBreak[]) => {
    setWords(next);
    onWordsUpdate(next);
  };

  // Text manipulation functions
  const toggleCase = (mode: CaseMode) => {
    if (selectedWordIndex === null) return;

    const next = [...wordsRef.current];
    const word = next[selectedWordIndex];

    switch (mode) {
      case 'lower':
        word.text = word.text.toLowerCase();
        break;
      case 'title':
        word.text = word.text
          ? word.text.charAt(0).toUpperCase() + word.text.slice(1).toLowerCase()
          : word.text;
        break;
      case 'upper':
        word.text = word.text.toUpperCase();
        break;
    }

    applyWordsUpdate(next);
  };

  const makeLegato = () => {
    const next = [...wordsRef.current];

    for (let i = 0; i < next.length - 1; i++) {
      if (next[i].end < next[i + 1].start) {
        next[i].end = next[i + 1].start;
      }
    }

    applyWordsUpdate(next);
  };

  const splitWord = () => {
    if (selectedWordIndex === null) return;

    const curr = wordsRef.current;
    const word = curr[selectedWordIndex];

    const midpoint = (word.start + word.end) / 2;
    const midIndex = Math.ceil(word.text.length / 2);

    const firstHalf: WordWithBreak = {
      text: word.text.slice(0, midIndex),
      start: word.start,
      end: midpoint,
      breakBefore: word.breakBefore
    };

    const secondHalf: WordWithBreak = {
      text: word.text.slice(midIndex),
      start: midpoint,
      end: word.end,
      breakBefore: false
    };

    const next = [...curr];
    next.splice(selectedWordIndex, 1, firstHalf, secondHalf);

    applyWordsUpdate(next);
    setSelectedWordIndex(selectedWordIndex);
  };

  const combineWords = () => {
    if (selectedWordIndex === null || selectedWordIndex >= wordsRef.current.length - 1) return;

    const curr = wordsRef.current;
    const word1 = curr[selectedWordIndex];
    const word2 = curr[selectedWordIndex + 1];

    const combined: WordWithBreak = {
      text: `${word1.text} ${word2.text}`.trim(),
      start: word1.start,
      end: word2.end,
      breakBefore: word1.breakBefore
    };

    const next = [...curr];
    next.splice(selectedWordIndex, 2, combined);

    applyWordsUpdate(next);
  };

  const autoCensor = () => {
    if (selectedWordIndex === null) return;

    const curr = wordsRef.current;
    const next = [...curr];

    const symbol = window.prompt('Censor symbol', '****') || '****';
    next[selectedWordIndex] = { ...next[selectedWordIndex], text: symbol };

    applyWordsUpdate(next);
  };

  const toggleLineBreak = () => {
    if (selectedWordIndex === null || selectedWordIndex === 0) return;

    const curr = wordsRef.current;
    const next = [...curr];

    next[selectedWordIndex] = {
      ...next[selectedWordIndex],
      breakBefore: !next[selectedWordIndex].breakBefore
    };

    applyWordsUpdate(next);
  };

  // Group words into lines based on breakBefore flags
  const getLineGroups = () => {
    const lines: WordWithBreak[][] = [];
    let currentLine: WordWithBreak[] = [];
    
    words.forEach((word, index) => {
      if (word.breakBefore && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [word];
      } else {
        currentLine.push(word);
      }
    });
    
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const totalWidth = timeToPixel(audioDuration * 1000);
  const playheadPosition = timeToPixel(currentTime);
  const lineGroups = getLineGroups();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#1A1D23] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-7xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Type size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Word Timeline Editor
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fine-tune word timings and formatting
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
            {/* Audio Controls */}
            <Button
              onClick={isPlaying ? onPause : onPlay}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 px-3">
              {formatTime(currentTime)} / {formatTime(audioDuration * 1000)}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

            {/* Text Manipulation */}
            <div className="flex gap-1">
              <Button
                onClick={() => toggleCase('lower')}
                disabled={selectedWordIndex === null}
                size="sm"
                variant="outline"
                className="font-mono"
                title="Lowercase"
              >
                aa
              </Button>
              <Button
                onClick={() => toggleCase('title')}
                disabled={selectedWordIndex === null}
                size="sm"
                variant="outline"
                className="font-mono"
                title="Title Case"
              >
                Aa
              </Button>
              <Button
                onClick={() => toggleCase('upper')}
                disabled={selectedWordIndex === null}
                size="sm"
                variant="outline"
                className="font-mono"
                title="UPPERCASE"
              >
                AA
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

            {/* Word Operations */}
            <Button
              onClick={makeLegato}
              size="sm"
              variant="outline"
              className="gap-2"
              title="Close gaps between words"
            >
              <Sparkles size={16} />
              Make Legato
            </Button>

            <Button
              onClick={splitWord}
              disabled={selectedWordIndex === null}
              size="sm"
              variant="outline"
              title="Split word into two"
            >
              Split
            </Button>

            <Button
              onClick={combineWords}
              disabled={selectedWordIndex === null || selectedWordIndex >= words.length - 1}
              size="sm"
              variant="outline"
              title="Combine with next word"
            >
              Combine
            </Button>

            <Button
              onClick={autoCensor}
              disabled={selectedWordIndex === null}
              size="sm"
              variant="outline"
              title="Replace with ****"
            >
              Auto-censor
            </Button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

            {/* Line Break */}
            <Button
              onClick={toggleLineBreak}
              disabled={selectedWordIndex === null || selectedWordIndex === 0}
              size="sm"
              variant="outline"
              className="gap-2"
              title="Add line break before this word"
            >
              <CornerDownRight size={16} />
              Break Line
            </Button>

            {selectedWordIndex !== null && words[selectedWordIndex]?.breakBefore && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Line break active
              </span>
            )}
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-hidden flex flex-col p-6">
            <div className="flex-1 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Word Timeline
              </h3>
              <div
                ref={timelineRef}
                className="relative h-32 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto overflow-y-hidden border border-gray-200 dark:border-gray-700"
                onClick={(e) => {
                  const rect = timelineRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0);
                    const time = pixelToTime(x);
                    onSeek(time);
                  }
                }}
              >
                {/* Time markers */}
                <div className="absolute top-0 left-0 h-6 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  {Array.from({ length: Math.ceil(audioDuration) + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{ left: `${timeToPixel(i * 1000)}px` }}
                    >
                      <div className="w-px h-2 bg-gray-300 dark:bg-gray-600 mb-1" />
                      <span className="text-[10px]">{i}s</span>
                    </div>
                  ))}
                </div>

                {/* Word blocks */}
                <div className="absolute top-8 left-0 right-0 bottom-0">
                  {words.map((word, index) => {
                    const left = timeToPixel(word.start);
                    const width = timeToPixel(word.end - word.start);
                    const isSelected = selectedWordIndex === index;
                    const isActive = activeWordIndex === index;

                    return (
                      <div
                        key={index}
                        className={`absolute top-4 h-16 rounded cursor-pointer transition-all group ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-lg z-20 ring-2 ring-indigo-300'
                            : isActive
                            ? 'bg-blue-400 text-white shadow-md z-10'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600'
                        }`}
                        style={{
                          left: `${left}px`,
                          width: `${Math.max(width, 30)}px`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWordIndex(index);
                        }}
                      >
                        {/* Word text */}
                        <div className="absolute inset-0 flex items-center justify-center px-2 text-xs font-medium truncate">
                          {word.text}
                        </div>

                        {/* Line break indicator */}
                        {word.breakBefore && (
                          <div className="absolute -top-2 left-0 w-full flex justify-center">
                            <div className="bg-green-500 text-white text-[10px] px-1 rounded-sm">
                              ↵
                            </div>
                          </div>
                        )}

                        {/* Resize handles */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/20 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleMouseDown(index, 'start', e)}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/20 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleMouseDown(index, 'end', e)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Playhead */}
                <div
                  ref={playheadRef}
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                  style={{ left: `${playheadPosition}px` }}
                >
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                </div>

                {/* Spacer for horizontal scroll */}
                <div style={{ width: `${totalWidth + 100}px`, height: '1px' }} />
              </div>
            </div>

            {/* Line Preview */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Line Build Preview
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                {lineGroups.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    className="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      Line {lineIndex + 1}:
                    </span>
                    {line.map((word, wordIndex) => (
                      <span
                        key={wordIndex}
                        className="text-sm text-gray-900 dark:text-gray-100"
                      >
                        {word.text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedWordIndex !== null ? (
                <span>
                  Selected: <strong>{words[selectedWordIndex]?.text}</strong>
                  {' '}
                  ({formatTime(words[selectedWordIndex]?.start)} - {formatTime(words[selectedWordIndex]?.end)})
                </span>
              ) : (
                <span>Click a word block to select and edit</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onWordsUpdate(words);
                  onClose();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
