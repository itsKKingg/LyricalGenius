import { useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { saveProject, loadProject as loadProjectFromDB } from '../utils/db';

const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

export function useAutoSave() {
  const currentProject = useEditorStore((state) => state.currentProject);

  useEffect(() => {
    if (!currentProject) return;

    const interval = setInterval(async () => {
      try {
        await saveProject(currentProject);
        console.log('Project auto-saved:', currentProject.name);
      } catch (error) {
        console.error('Failed to auto-save project:', error);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentProject]);

  const manualSave = async () => {
    if (currentProject) {
      try {
        await saveProject(currentProject);
        return true;
      } catch (error) {
        console.error('Failed to save project:', error);
        return false;
      }
    }
    return false;
  };

  const loadProjectById = async (id: string) => {
    try {
      const project = await loadProjectFromDB(id);
      if (project) {
        useEditorStore.getState().loadProject(project);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load project:', error);
      return false;
    }
  };

  return {
    manualSave,
    loadProjectById,
  };
}
