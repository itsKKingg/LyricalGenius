export type AnimationStyle =
  | 'karaoke-highlight'
  | 'bottom-third-static'
  | 'center-pop-in'
  | 'word-bounce'
  | 'neon-glow'
  | 'typewriter'
  | 'gradient-sweep'
  | 'blur-fade'
  | 'scale-pulse'
  | 'flip-3d'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'explode-particles'
  | 'rainbow-cycle'
  | 'bold-entrance'
  | 'jitter-shake'
  | 'outline-stroke'
  | 'underline-wipe'
  | 'fade-blur'
  | 'skew-perspective'
  | 'bounce-scale'
  | 'none';

export interface AnimationTemplate {
  id: AnimationStyle;
  name: string;
  description: string;
  thumbnail?: string;
}

export interface Caption {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  style: CaptionStyle;
  track: number; // For multi-track captions
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'bolder';
  color: string;
  animationStyle: AnimationStyle;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  glowColor?: string;
  glowIntensity?: number;
  alignment: 'left' | 'center' | 'right';
  positionX: number; // Percentage
  positionY: number; // Percentage
}

export interface VideoClip {
  id: string;
  type: 'video' | 'image' | 'background';
  src: string;
  startMs: number;
  durationMs: number;
  track: number;
  opacity: number;
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
}

export interface AudioClip {
  id: string;
  type: 'audio' | 'music' | 'voiceover';
  src: string;
  startMs: number;
  durationMs: number;
  track: number;
  volume: number;
  waveformData?: number[];
}

export type ClipType = VideoClip | AudioClip | Caption;

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'caption';
  name: string;
  locked: boolean;
  visible: boolean;
  clips: ClipType[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  duration: number; // in milliseconds
  fps: number;
  width: number;
  height: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  backgroundColor: string;
  tracks: Track[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  backgroundColor: string;
  backgroundBlur: number;
}

export interface EditorState {
  currentProject: Project | null;
  selectedClips: string[];
  currentTime: number;
  isPlaying: boolean;
  zoom: number; // 10% to 400%
  playbackRate: number;
}

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image';
  src: string;
  duration?: number;
  size: number;
  uploadedAt: number;
}
