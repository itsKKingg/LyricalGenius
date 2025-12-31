import { useEditorStore } from '../stores/editorStore';
import { useHistoryStore } from '../stores/historyStore';
import { useEffect } from 'react';

export function useEditor() {
  const store = useEditorStore();
  const history = useHistoryStore();

  // Auto-save to history on project changes
  useEffect(() => {
    if (store.currentProject) {
      const timeout = setTimeout(() => {
        history.pushHistory(store.currentProject!);
      }, 500); // Debounce by 500ms

      return () => clearTimeout(timeout);
    }
  }, [store.currentProject]);

  const undo = () => {
    const previous = history.undo();
    if (previous) {
      store.loadProject(previous);
    }
  };

  const redo = () => {
    const next = history.redo();
    if (next) {
      store.loadProject(next);
    }
  };

  return {
    ...store,
    undo,
    redo,
    canUndo: history.canUndo(),
    canRedo: history.canRedo(),
  };
}
