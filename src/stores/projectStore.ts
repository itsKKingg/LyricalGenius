import { create } from 'zustand'
import { Project, ProjectSettings, LyricLine } from '../types'
import { saveProject, loadProject, deleteProject as dbDeleteProject } from '../utils/db'

interface ProjectState {
  currentProject: Project | null
  isPlaying: boolean
  currentTime: number
  volume: number
  
  setCurrentProject: (project: Project | null) => void
  updateProject: (updates: Partial<Project>) => void
  updateSettings: (settings: Partial<ProjectSettings>) => void
  updateLyrics: (lyrics: LyricLine[]) => void
  
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (time: number) => void
  setVolume: (volume: number) => void
  
  saveCurrentProject: () => Promise<void>
  loadProjectById: (id: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  createNewProject: (audioFile: File, audioUrl: string) => Promise<Project>
}

const defaultSettings: ProjectSettings = {
  videoFormat: '9:16',
  resolution: '1080p',
  fps: 30,
  
  fontFamily: 'Inter',
  fontSize: 48,
  fontWeight: 700,
  textColor: '#ffffff',
  textAlign: 'center',
  textStroke: true,
  textStrokeWidth: 2,
  textStrokeColor: '#000000',
  textShadow: true,
  textGlow: false,
  letterSpacing: 0,
  lineHeight: 1.2,
  
  animationStyle: 'scale',
  animationDuration: 300,
  
  captionPosition: 'bottom',
  captionYOffset: 100,
  
  backgroundType: 'gradient',
  backgroundColor: '#000000',
  backgroundGradient: ['#1a1a2e', '#16213e', '#0f3460'],
  backgroundBlur: 0,
  
  visualizerStyle: 'circular',
  visualizerIntensity: 50,
  visualizerColor: '#8b5cf6',
  
  watermarkEnabled: false,
  watermarkText: '',
  watermarkPosition: 'bottomRight',
  watermarkOpacity: 0.7,
  
  volume: 1,
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updates) => set((state) => ({
    currentProject: state.currentProject 
      ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
      : null
  })),
  
  updateSettings: (settings) => set((state) => ({
    currentProject: state.currentProject
      ? {
          ...state.currentProject,
          settings: { ...state.currentProject.settings, ...settings },
          updatedAt: Date.now()
        }
      : null
  })),
  
  updateLyrics: (lyrics) => set((state) => ({
    currentProject: state.currentProject
      ? { ...state.currentProject, lyrics, updatedAt: Date.now() }
      : null
  })),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume }),
  
  saveCurrentProject: async () => {
    const { currentProject } = get()
    if (currentProject) {
      await saveProject(currentProject)
    }
  },
  
  loadProjectById: async (id) => {
    const project = await loadProject(id)
    if (project) {
      set({ currentProject: project })
    }
  },
  
  deleteProject: async (id) => {
    await dbDeleteProject(id)
    const { currentProject } = get()
    if (currentProject?.id === id) {
      set({ currentProject: null })
    }
  },
  
  createNewProject: async (audioFile, audioUrl) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name: audioFile.name.replace(/\.[^/.]+$/, ''),
      audioUrl,
      audioFile,
      duration: 0,
      waveformData: [],
      lyrics: [],
      settings: defaultSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    set({ currentProject: project })
    await saveProject(project)
    return project
  },
}))
