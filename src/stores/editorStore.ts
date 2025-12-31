import { create } from 'zustand';
import type { Project, Caption, VideoClip, AudioClip, Track, EditorState, MediaFile, CaptionStyle } from '../types';

interface EditorStore extends EditorState {
  // Project actions
  createNewProject: (name: string) => void;
  loadProject: (project: Project) => void;
  updateProjectName: (name: string) => void;
  updateProjectSettings: (settings: Partial<Project['settings']>) => void;
  
  // Media actions
  mediaFiles: MediaFile[];
  addMediaFile: (file: MediaFile) => void;
  removeMediaFile: (id: string) => void;
  
  // Clip selection
  selectClip: (id: string) => void;
  selectMultipleClips: (ids: string[]) => void;
  deselectClip: (id: string) => void;
  deselectAllClips: () => void;
  
  // Caption actions
  addCaption: (caption: Omit<Caption, 'id'>) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  deleteCaption: (id: string) => void;
  batchUpdateCaptions: (ids: string[], updates: Partial<CaptionStyle>) => void;
  
  // Video clip actions
  addVideoClip: (clip: Omit<VideoClip, 'id'>) => void;
  updateVideoClip: (id: string, updates: Partial<VideoClip>) => void;
  deleteVideoClip: (id: string) => void;
  
  // Audio clip actions
  addAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
  updateAudioClip: (id: string, updates: Partial<AudioClip>) => void;
  deleteAudioClip: (id: string) => void;
  
  // Track actions
  addTrack: (track: Omit<Track, 'id'>) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackVisibility: (trackId: string) => void;
  
  // Playback
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  
  // Zoom
  setZoom: (zoom: number) => void;
  
  // Aspect ratio
  setAspectRatio: (ratio: '9:16' | '16:9' | '1:1') => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createDefaultProject = (name: string): Project => ({
  id: generateId(),
  name,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  duration: 0,
  fps: 30,
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  backgroundColor: '#000000',
  tracks: [
    {
      id: 'track-video-1',
      type: 'video',
      name: 'Video 1',
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: 'track-caption-1',
      type: 'caption',
      name: 'Captions 1',
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: 'track-caption-2',
      type: 'caption',
      name: 'Captions 2',
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: 'track-audio-1',
      type: 'audio',
      name: 'Audio 1',
      locked: false,
      visible: true,
      clips: [],
    },
  ],
  settings: {
    fps: 30,
    resolution: {
      width: 1080,
      height: 1920,
    },
    backgroundColor: '#000000',
    backgroundBlur: 0,
  },
});

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentProject: null,
  selectedClips: [],
  currentTime: 0,
  isPlaying: false,
  zoom: 100,
  playbackRate: 1,
  mediaFiles: [],

  // Project actions
  createNewProject: (name: string) => {
    const project = createDefaultProject(name);
    set({ currentProject: project });
  },

  loadProject: (project: Project) => {
    set({ currentProject: project, currentTime: 0, isPlaying: false });
  },

  updateProjectName: (name: string) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          name,
          updatedAt: Date.now(),
        },
      });
    }
  },

  updateProjectSettings: (settings) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          settings: { ...currentProject.settings, ...settings },
          updatedAt: Date.now(),
        },
      });
    }
  },

  // Media actions
  addMediaFile: (file: MediaFile) => {
    set((state) => ({
      mediaFiles: [...state.mediaFiles, file],
    }));
  },

  removeMediaFile: (id: string) => {
    set((state) => ({
      mediaFiles: state.mediaFiles.filter((f) => f.id !== id),
    }));
  },

  // Clip selection
  selectClip: (id: string) => {
    set({ selectedClips: [id] });
  },

  selectMultipleClips: (ids: string[]) => {
    set({ selectedClips: ids });
  },

  deselectClip: (id: string) => {
    set((state) => ({
      selectedClips: state.selectedClips.filter((clipId) => clipId !== id),
    }));
  },

  deselectAllClips: () => {
    set({ selectedClips: [] });
  },

  // Caption actions
  addCaption: (caption) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const newCaption: Caption = {
      ...caption,
      id: generateId(),
    };

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'caption' && track.id === `track-caption-${caption.track || 1}`) {
        return {
          ...track,
          clips: [...track.clips, newCaption],
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        duration: Math.max(currentProject.duration, newCaption.endMs),
        updatedAt: Date.now(),
      },
    });
  },

  updateCaption: (id, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'caption') {
        return {
          ...track,
          clips: track.clips.map((clip) => {
            if (clip.id === id) {
              return { ...clip, ...updates } as Caption;
            }
            return clip;
          }),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
    });
  },

  deleteCaption: (id) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'caption') {
        return {
          ...track,
          clips: track.clips.filter((clip) => clip.id !== id),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
      selectedClips: get().selectedClips.filter((clipId) => clipId !== id),
    });
  },

  batchUpdateCaptions: (ids, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'caption') {
        return {
          ...track,
          clips: track.clips.map((clip) => {
            if (ids.includes(clip.id)) {
              const caption = clip as Caption;
              return {
                ...caption,
                style: { ...caption.style, ...updates },
              } as Caption;
            }
            return clip;
          }),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
    });
  },

  // Video clip actions
  addVideoClip: (clip) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const newClip: VideoClip = {
      ...clip,
      id: generateId(),
    };

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'video' && track.id === 'track-video-1') {
        return {
          ...track,
          clips: [...track.clips, newClip],
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        duration: Math.max(currentProject.duration, newClip.startMs + newClip.durationMs),
        updatedAt: Date.now(),
      },
    });
  },

  updateVideoClip: (id, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'video') {
        return {
          ...track,
          clips: track.clips.map((clip) => {
            if (clip.id === id) {
              return { ...clip, ...updates } as VideoClip;
            }
            return clip;
          }),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
    });
  },

  deleteVideoClip: (id) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'video') {
        return {
          ...track,
          clips: track.clips.filter((clip) => clip.id !== id),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
      selectedClips: get().selectedClips.filter((clipId) => clipId !== id),
    });
  },

  // Audio clip actions
  addAudioClip: (clip) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const newClip: AudioClip = {
      ...clip,
      id: generateId(),
    };

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'audio' && track.id === 'track-audio-1') {
        return {
          ...track,
          clips: [...track.clips, newClip],
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        duration: Math.max(currentProject.duration, newClip.startMs + newClip.durationMs),
        updatedAt: Date.now(),
      },
    });
  },

  updateAudioClip: (id, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'audio') {
        return {
          ...track,
          clips: track.clips.map((clip) => {
            if (clip.id === id) {
              return { ...clip, ...updates } as AudioClip;
            }
            return clip;
          }),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
    });
  },

  deleteAudioClip: (id) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.type === 'audio') {
        return {
          ...track,
          clips: track.clips.filter((clip) => clip.id !== id),
        };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
      selectedClips: get().selectedClips.filter((clipId) => clipId !== id),
    });
  },

  // Track actions
  addTrack: (track) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const newTrack: Track = {
      ...track,
      id: generateId(),
    };

    set({
      currentProject: {
        ...currentProject,
        tracks: [...currentProject.tracks, newTrack],
        updatedAt: Date.now(),
      },
    });
  },

  toggleTrackLock: (trackId) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.id === trackId) {
        return { ...track, locked: !track.locked };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
    });
  },

  toggleTrackVisibility: (trackId) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const tracks = currentProject.tracks.map((track) => {
      if (track.id === trackId) {
        return { ...track, visible: !track.visible };
      }
      return track;
    });

    set({
      currentProject: {
        ...currentProject,
        tracks,
        updatedAt: Date.now(),
      },
    });
  },

  // Playback
  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  setPlaybackRate: (rate) => {
    set({ playbackRate: rate });
  },

  // Zoom
  setZoom: (zoom) => {
    set({ zoom: Math.max(10, Math.min(400, zoom)) });
  },

  // Aspect ratio
  setAspectRatio: (ratio) => {
    const { currentProject } = get();
    if (!currentProject) return;

    let width = 1080;
    let height = 1920;

    if (ratio === '16:9') {
      width = 1920;
      height = 1080;
    } else if (ratio === '1:1') {
      width = 1080;
      height = 1080;
    }

    set({
      currentProject: {
        ...currentProject,
        aspectRatio: ratio,
        width,
        height,
        settings: {
          ...currentProject.settings,
          resolution: { width, height },
        },
        updatedAt: Date.now(),
      },
    });
  },
}));
