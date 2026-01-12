import React, { useState } from 'react';
import { Video, Image as ImageIcon, Music, RefreshCw, QrCode, Volume2 } from 'lucide-react';
import { Button } from '../../ui/button';
import type { MediaAsset } from '../../../app/editor/types';

interface PexelsViewProps {
  selectedMedia: MediaAsset | null | undefined;
  onMediaSelect: (media: MediaAsset) => void;
}

// Mock Data for demonstration
const audioItems = [
  { id: 1, title: 'Long Gone (prod.Bashful)-clip-0s-60s', duration: '1:00.0', date: 'Jan 2026' },
  { id: 2, title: 'Girl of My Dreams (prod.Bapop)-clip-12s-61s', duration: '0:49.1', date: 'Dec 2025' }
];

// Mock media assets
const mockMediaAssets: MediaAsset[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&h=700&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&h=700&fit=crop',
    type: 'image',
    title: 'Abstract Art'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=700&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=700&fit=crop',
    type: 'image',
    title: 'Event Crowd'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1506157786151-b8491531f436?w=400&h=700&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1506157786151-b8491531f436?w=400&h=700&fit=crop',
    type: 'image',
    title: 'Concert Lights'
  }
];

interface MediaSectionProps {
  icon: any;
  title: string;
  count: number;
  subtitle: string;
  hasToggle?: boolean;
  toggleLabel?: string;
  uploadLabel: string;
  searchLabel?: string;
  manageLabel: string;
  isEmpty?: boolean;
  emptyLabel?: string;
  children?: React.ReactNode;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  icon: Icon,
  title,
  count,
  subtitle,
  hasToggle,
  toggleLabel,
  uploadLabel,
  searchLabel,
  manageLabel,
  isEmpty,
  emptyLabel,
  children
}) => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <Icon size={28} className="text-slate-700 dark:text-slate-300 mb-3" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        </div>
        <span className="text-2xl font-bold text-slate-400 dark:text-slate-600">{count}</span>
      </div>

      <div className="flex justify-between items-center mb-6 min-h-[24px]">
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        {hasToggle && (
            <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => setIsOnline(!isOnline)}>
                <span className={`text-xs font-medium transition-colors ${isOnline ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300'}`}>{toggleLabel}</span>
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${isOnline ? 'bg-slate-900 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
            </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Button
            className="flex-1 bg-[#0f1115] hover:bg-[#252830] text-white text-xs font-semibold h-9 border border-transparent shadow-sm"
        >
            {hasToggle && isOnline ? searchLabel : uploadLabel}
        </Button>
        <Button
            variant="secondary"
            className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 shadow-sm"
        >
            {manageLabel}
        </Button>
        <button className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-transparent shadow-sm">
            <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1">
        {isEmpty ? (
            <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
                {emptyLabel || "No media found"}
            </div>
        ) : (
            <div className="space-y-2">
                {children}
            </div>
        )}
      </div>
    </div>
  );
};

export const PexelsView: React.FC<PexelsViewProps> = ({ selectedMedia, onMediaSelect }) => {
  return (
    <div className="animate-fade-in">
      {/* Media Grid Section */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="mb-6 inline-flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm group">
            <QrCode size={18} className="text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">Upload photos and videos from your phone</span>
          </div>
        </div>

        {/* Mock Media Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Available Media</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockMediaAssets.map((media) => (
              <div
                key={media.id}
                onClick={() => onMediaSelect(media)}
                className={`
                  relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transition-all
                  hover:ring-2 hover:ring-indigo-500 hover:shadow-lg
                  ${selectedMedia?.id === media.id ? 'ring-2 ring-indigo-500 shadow-lg' : 'ring-1 ring-slate-200 dark:ring-slate-700'}
                `}
              >
                <img
                  src={media.thumbnail}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{media.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MediaSection
              icon={Video}
              title="Videos"
              count={0}
              subtitle="All your video content"
              hasToggle={true}
              toggleLabel="Videos found online"
              uploadLabel="Upload video"
              searchLabel="Search web"
              manageLabel="Manage videos"
              isEmpty={true}
          />

          <MediaSection
              icon={ImageIcon}
              title="Photos"
              count={0}
              subtitle="Your image uploads"
              hasToggle={true}
              toggleLabel="Photos found online"
              uploadLabel="Upload photo"
              searchLabel="Search web"
              manageLabel="Manage photos"
              isEmpty={true}
          />

          <MediaSection
              icon={Music}
              title="Audio"
              count={audioItems.length}
              subtitle="Music and sound files"
              hasToggle={false}
              uploadLabel="Upload audio"
              manageLabel="Manage audio"
              isEmpty={false}
          >
              {audioItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                      <div className="w-8 h-8 rounded bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-600 shadow-sm">
                          <Volume2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{item.duration} • {item.date}</p>
                      </div>
                  </div>
              ))}
          </MediaSection>
      </div>
    </div>
  );
};
