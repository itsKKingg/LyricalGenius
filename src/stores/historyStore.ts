import { create } from 'zustand';
import type { Project } from '../types';

interface HistoryStore {
  past: Project[];
  future: Project[];
  
  pushHistory: (project: Project) => void;
  undo: () => Project | null;
  redo: () => Project | null;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  pushHistory: (project: Project) => {
    const { past } = get();
    const newPast = [...past, JSON.parse(JSON.stringify(project))].slice(-MAX_HISTORY);
    
    set({
      past: newPast,
      future: [], // Clear future when new action is performed
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [previous, ...future],
    });

    return previous;
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, next],
      future: newFuture,
    });

    return next;
  },

  clearHistory: () => {
    set({ past: [], future: [] });
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },
}));
