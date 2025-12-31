import { useEffect } from 'react';
import { useEditor } from './useEditor';
import { usePlayback } from './usePlayback';

export function useKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo, selectedClips, deleteCaption, deleteVideoClip, deleteAudioClip, currentProject } = useEditor();
  const { togglePlayback } = usePlayback();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space - Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
        return;
      }

      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      // Delete or Backspace - Delete selected clips
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedClips.length > 0 && currentProject) {
          selectedClips.forEach(clipId => {
            // Find which type of clip this is
            for (const track of currentProject.tracks) {
              const clip = track.clips.find(c => c.id === clipId);
              if (clip) {
                if (track.type === 'caption') {
                  deleteCaption(clipId);
                } else if (track.type === 'video') {
                  deleteVideoClip(clipId);
                } else if (track.type === 'audio') {
                  deleteAudioClip(clipId);
                }
                break;
              }
            }
          });
        }
        return;
      }

      // Escape - Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        // Note: Would call deselectAllClips if we had it in the hook
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, togglePlayback, selectedClips, deleteCaption, deleteVideoClip, deleteAudioClip, currentProject]);
}
