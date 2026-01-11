export interface MediaAsset {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  tags: string[];
  source: 'pinterest' | 'pexels';
  duration?: number;
}

export const mockMediaAssets: MediaAsset[] = [
  {
    id: 'mock-1',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop',
    title: 'Aesthetic Cityscape',
    tags: ['urban', 'sunset', 'city'],
    source: 'pexels',
    duration: 15
  },
  {
    id: 'mock-2',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400&h=600&fit=crop',
    title: 'Cozy Coffee Shop',
    tags: ['cozy', 'coffee', 'aesthetic'],
    source: 'pinterest',
    duration: 20
  },
  {
    id: 'mock-3',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1498550744921-6e9c98d1e36f?w=400&h=600&fit=crop',
    title: 'Nature Walk',
    tags: ['nature', 'forest', 'peaceful'],
    source: 'pexels',
    duration: 30
  },
  {
    id: 'mock-4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1504194104404-433180773017?w=400&h=600&fit=crop',
    title: 'Minimalist Room',
    tags: ['minimalist', 'room', 'clean'],
    source: 'pinterest',
    duration: 12
  },
  {
    id: 'mock-5',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop',
    title: 'Beach Vibes',
    tags: ['beach', 'ocean', 'summer'],
    source: 'pexels',
    duration: 25
  },
  {
    id: 'mock-6',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1496200186974-4293800e2c20?w=400&h=600&fit=crop',
    title: 'Street Fashion',
    tags: ['fashion', 'street', 'style'],
    source: 'pinterest',
    duration: 18
  },
  {
    id: 'mock-7',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=600&fit=crop',
    title: 'Art Gallery',
    tags: ['art', 'gallery', 'modern'],
    source: 'pexels',
    duration: 22
  },
  {
    id: 'mock-8',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1493673272479-a20888bcee10?w=400&h=600&fit=crop',
    title: 'Mountain Hike',
    tags: ['mountains', 'hiking', 'adventure'],
    source: 'pinterest',
    duration: 35
  },
  {
    id: 'mock-9',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=600&fit=crop',
    title: 'Studio Lighting',
    tags: ['studio', 'lighting', 'photography'],
    source: 'pexels',
    duration: 16
  },
  {
    id: 'mock-10',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511381939415-c1c76f8d08b1?w=400&h=600&fit=crop',
    title: 'Book Cafe',
    tags: ['books', 'cafe', 'reading'],
    source: 'pinterest',
    duration: 28
  }
];
