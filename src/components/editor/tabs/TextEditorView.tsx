import React, { useState } from 'react';
import { Scissors, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import type { MediaAsset } from '../../app/editor/types';

interface TextEditorViewProps {
  selectedMedia: MediaAsset | null;
  onMediaSelect: (media: MediaAsset) => void;
}

export const TextEditorView: React.FC<TextEditorViewProps> = ({ selectedMedia, onMediaSelect }) => {
  const [text, setText] = useState('');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Text Editor</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add and edit text overlays on your selected media</p>
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
          </div>
        ) : (
          <div className="aspect-video bg-slate-950 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-800">
            <Scissors size={48} className="text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium">No media selected</p>
            <p className="text-slate-600 text-sm mt-1">Select media from Pexels or Pinterest to add text</p>
          </div>
        )}
      </div>
    </div>
  );
};
