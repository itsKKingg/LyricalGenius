export type ViewType = 
  | 'HOME'
  | 'AESTHETICS'
  | 'WORKSPACE'
  | 'VIDEOS'
  | 'SLIDESHOWS'
  | 'SEND_TO_TIKTOK'
  | 'PEXELS'
  | 'PINTEREST'
  | 'TEXT_EDITOR'
  | 'SETTINGS';

export interface Aesthetic {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  theme: string;
}

export interface Section {
  id: string;
  startTime: number;
  endTime: number;
  lyrics: string;
}

export interface LyricWord {
  text: string;
  start: number;
  end: number;
  /**
   * Forces a new rendered line before this word in the video.
   * Optional to preserve compatibility with existing saved projects.
   */
  breakBefore?: boolean;
}

export interface MediaAsset {
  id: string;
  url: string;
  thumbnail: string;
  type: 'video' | 'image';
  title?: string;
  duration?: number;
}

export interface AppState {
  currentView: ViewType;
  currentModal: ModalType;
  theme: 'light' | 'dark';
  activeAestheticId: string | null;
  aesthetics: Aesthetic[];
  audioFile: File | null;
  audioBuffer: AudioBuffer | null;
  audioDuration: number;
  fileName: string;
  clipRange: [number, number];
  sections: Section[];
  words: LyricWord[];
  videos: MediaAsset[];
  photos: MediaAsset[];
  createContentType?: 'video' | 'slideshow';
  activeTab?: 'editor' | 'pexels' | 'pinterest';
  selectedMedia: MediaAsset | null | undefined;
  font?: string;
  color?: string;
  animationStyle?: string;
}

export type ModalType = 
  | 'NONE'
  | 'CREATE_CONTENT'
  | 'CLIP_SELECTOR'
  | 'AUDIO_ANALYSIS'
  | 'WORD_TIMELINE';
