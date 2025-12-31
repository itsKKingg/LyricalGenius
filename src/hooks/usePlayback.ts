import { useEffect, useRef } from 'react';
import { useEditorStore } from '../stores/editorStore';

export function usePlayback() {
  const { isPlaying, currentTime, playbackRate, currentProject, setCurrentTime, setIsPlaying } = useEditorStore();
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isPlaying || !currentProject) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) * playbackRate;
      lastTimeRef.current = now;

      const newTime = currentTime + delta;

      if (newTime >= currentProject.duration) {
        setCurrentTime(0);
        setIsPlaying(false);
      } else {
        setCurrentTime(newTime);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, playbackRate, currentProject, setCurrentTime, setIsPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, currentProject?.duration || 0)));
  };

  const skipForward = (ms: number = 1000) => {
    seek(currentTime + ms);
  };

  const skipBackward = (ms: number = 1000) => {
    seek(currentTime - ms);
  };

  return {
    isPlaying,
    currentTime,
    playbackRate,
    togglePlayback,
    seek,
    skipForward,
    skipBackward,
  };
}
