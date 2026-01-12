import React, { useState } from 'react';
import { Film, Download, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import type { MediaAsset } from '../../../app/editor/types';
import { motion } from 'framer-motion';

interface PinterestViewProps {
  selectedMedia: MediaAsset | null | undefined;
  onMediaSelect: (media: MediaAsset) => void;
}

export const PinterestView: React.FC<PinterestViewProps> = ({ selectedMedia, onMediaSelect }) => {
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedMedia, setFetchedMedia] = useState<MediaAsset[]>([]);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!pinterestUrl.trim()) {
      setError('Please enter a Pinterest URL');
      return;
    }

    if (!pinterestUrl.includes('pinterest.com')) {
      setError('Please enter a valid Pinterest URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setFetchedMedia([]);

    try {
      const response = await fetch('http://localhost:8000/api/pinterest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: pinterestUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Pinterest media');
      }

      if (data.success && data.links && data.links.length > 0) {
        const mediaAssets: MediaAsset[] = data.links.map((url: string, index: number) => ({
          id: `pinterest-${Date.now()}-${index}`,
          url,
          thumbnail: url,
          type: url.includes('.mp4') || url.includes('video') ? 'video' : 'image',
          title: `Pinterest Media ${index + 1}`,
        }));
        setFetchedMedia(mediaAssets);
      } else {
        setError('No media found at this URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pinterest media');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="animate-fade-in"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pinterest Bridge</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Fetch media from Pinterest URLs</p>
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="https://pinterest.com/pin/..."
            value={pinterestUrl}
            onChange={(e) => setPinterestUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <Button
            onClick={handleFetch}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Fetch
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Fetching media from Pinterest...</p>
        </div>
      ) : fetchedMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {fetchedMedia.map((media) => (
            <motion.div
              key={media.id}
              onClick={() => onMediaSelect(media)}
              whileHover={{ scale: 1.05 }}
              className={`
                relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transition-all
                hover:ring-2 hover:ring-indigo-500 hover:shadow-lg
                ${selectedMedia?.id === media.id ? 'ring-2 ring-indigo-500 shadow-lg' : 'ring-1 ring-slate-200 dark:ring-slate-700'}
              `}
            >
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                />
              ) : (
                <img
                  src={media.thumbnail}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
              )}
              {media.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Film size={20} className="text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Download size={32} />
           </div>
           <p className="text-slate-900 dark:text-white font-medium mb-1">No media fetched yet</p>
           <p className="text-sm text-slate-500 dark:text-slate-400">Enter a Pinterest URL to fetch media</p>
        </div>
      )}
    </motion.div>
  );
};
