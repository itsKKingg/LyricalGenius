import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../../components/editor/Sidebar';
import { HomeView } from '../../components/editor/tabs/HomeView';
import { AestheticsListView } from '../../components/editor/tabs/AestheticsListView';
import { PexelsView } from '../../components/editor/tabs/PexelsView';
import { PinterestView } from '../../components/editor/tabs/PinterestView';
import { TextEditorView } from '../../components/editor/tabs/TextEditorView';
import { SettingsView } from '../../components/editor/tabs/SettingsView';
import { ContentDraftView } from '../../components/editor/tabs/ContentDraftView';
import { ScheduleView } from '../../components/editor/tabs/ScheduleView';
import { VideoPreview } from '../../components/editor/VideoPreview';
import { RenderingModal } from '../../components/editor/RenderingModal';
import { WordTimelineModal } from '../../components/editor/WordTimelineModal';
import { User, PenLine, Video, PlaySquare, Settings, LogOut, Moon, Sun, Check } from 'lucide-react';
import { AppState, Section, LyricWord, ViewType, Aesthetic, MediaAsset } from './types';
import { generateId } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { projectPersistenceService, ProjectState } from '../../lib/projectPersistence';

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'HOME',
    currentModal: 'NONE',
    theme: 'light', // Default theme
    activeAestheticId: null,
    aesthetics: [],
    activeTab: 'editor',
    selectedMedia: null,

    // Global workspace state
    audioFile: null,
    audioBuffer: null,
    audioDuration: 0,
    fileName: '',
    clipRange: [0, 0],
    sections: [],
    words: [],
    videos: [],
    photos: [],
    font: 'Inter',
    color: '#ffffff',
    animationStyle: 'fade'
  });

  // Audio playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Project persistence state
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isProjectSaved, setIsProjectSaved] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Modal states
  const [showRenderingModal, setShowRenderingModal] = useState(false);
  const [renderJobId, setRenderJobId] = useState<string | null>(null);

  // Helper function to get active aesthetic
  const getActiveAesthetic = (): Aesthetic | null => {
    if (!state.activeAestheticId) return null;
    return state.aesthetics.find(a => a.id === state.activeAestheticId) || null;
  };

  // Sample lyrics for when none are available
  const sampleLyrics: LyricWord[] = [
    { text: "Hello", start: 0.0, end: 0.5 },
    { text: "world", start: 0.5, end: 1.0 },
    { text: "this", start: 1.0, end: 1.3 },
    { text: "is", start: 1.3, end: 1.5 },
    { text: "a", start: 1.5, end: 1.7 },
    { text: "sample", start: 1.7, end: 2.2 },
    { text: "test", start: 2.2, end: 2.7 }
  ];

  // Update time during playback
  const updateTime = () => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  // Audio event handlers
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      updateTime();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Theme management
  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  // Navigation handlers
  const handleNavigate = (view: ViewType, aestheticId?: string) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      activeAestheticId: aestheticId || prev.activeAestheticId
    }));
  };

  // Aesthetic management
  const handleCreateAesthetic = () => {
    const newAesthetic: Aesthetic = {
      id: generateId(),
      name: `New Aesthetic ${state.aesthetics.length + 1}`,
      description: 'A new aesthetic',
      thumbnail: '/placeholder.jpg',
      theme: state.theme
    };
    
    setState(prev => ({
      ...prev,
      aesthetics: [...prev.aesthetics, newAesthetic]
    }));
  };

  // Media management
  const handleMediaSelect = (media: MediaAsset) => {
    setState(prev => ({ ...prev, selectedMedia: media }));
  };

  // Export functionality
  const handleExport = () => {
    console.log('Exporting...', state);
    // This would typically trigger a video rendering process
  };

  // Lyrics management
  const handleLyricsUpdate = (words: LyricWord[]) => {
    setState(prev => ({ ...prev, words }));
  };

  // Modal handlers
  const openCreateModal = (type: 'video' | 'slideshow') => {
    setState(prev => ({ ...prev, currentModal: 'CREATE_CONTENT', createContentType: type }));
  };

  const closeModal = () => setState(prev => ({ ...prev, currentModal: 'NONE' }));

  const openWordTimelineModal = () => setState(prev => ({ ...prev, currentModal: 'WORD_TIMELINE' }));
  const closeWordTimelineModal = () => setState(prev => ({ ...prev, currentModal: 'NONE' }));

  // Rendering handlers
  const handleRenderComplete = () => {
    setShowRenderingModal(false);
    setRenderJobId(null);
  };
  const closeRenderingModal = () => setShowRenderingModal(false);

  // Progress and status rendering
  const renderProgress = (progress: number) => {
    return <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>;
  };

  const renderStatus = (status: string) => {
    return <div className="text-sm text-gray-600">{status}</div>;
  };

  // Audio file handling
  const handleAudioFile = (file: File) => {
    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.src = url;
    }
    setState(prev => ({
      ...prev,
      audioFile: file,
      fileName: file.name
    }));
  };

  // Word timeline handler
  const handleOpenWordTimeline = () => {
    openWordTimelineModal();
  };

  // Audio time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Initialize audio element when audioFile changes
  useEffect(() => {
    if (state.audioFile && !audioRef.current) {
      const audioUrl = URL.createObjectURL(state.audioFile);
      audioRef.current = new Audio(audioUrl);

      audioRef.current.addEventListener('loadedmetadata', () => {
        console.log('Audio loaded:', {
          duration: audioRef.current?.duration,
          currentTime: audioRef.current?.currentTime
        });
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [state.audioFile]);

  // Audio playback effect
  useEffect(() => {
    if (isPlaying) {
      updateTime();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isPlaying]);

  // Tab Handler
  const setActiveTab = (tab: 'editor' | 'pexels' | 'pinterest') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  // Project persistence
  const saveProject = async () => {
    if (!currentProjectId) return;
    
    setIsSavingProject(true);
    try {
      const projectName = state.fileName || getActiveAesthetic()?.name || 'Untitled Project';

      const projectState: ProjectState = {
        project_name: projectName,
        song_title: state.fileName || undefined,
        audio_duration: state.audioDuration,
        clip_range: state.clipRange,
        sections: state.sections,
        words: state.words,
        videos: state.videos,
        photos: state.photos,
        font: state.font,
        color: state.color,
        animation_style: state.animationStyle,

        // Backwards-compatible fields
        title: projectName,
        background_url: state.selectedMedia?.url || undefined,
        lyrics_json: state.words,

        // UI-only fields
        activeTab: state.activeTab || 'editor',
        selectedMedia: state.selectedMedia,
        audioFile: state.audioFile
      };

      const result = await projectPersistenceService.saveProject(projectState, currentProjectId);
      
      if (result.success) {
        setIsProjectSaved(true);
        setLastSaveTime(new Date());
        console.log('Project saved successfully');
      } else {
        console.error('Failed to save project:', result.error);
        setIsProjectSaved(false);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setIsProjectSaved(false);
    } finally {
      setIsSavingProject(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (currentProjectId && !isProjectSaved && !isSavingProject) {
      const timer = setTimeout(() => {
        saveProject();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [currentProjectId, state, isProjectSaved, isSavingProject]);

  // Load project handler
  const handleLoadProject = async (projectId: string) => {
    setIsSavingProject(true);
    try {
      const result = await projectPersistenceService.loadProject(projectId);
      
      if (result.success && result.project) {
        const project = result.project;
        
        const loadedWords = ((project.words as any[]) ?? (project.lyrics_json as any[]) ?? []) as any[];
        const loadedSections = ((project.sections as any[]) ?? []) as any[];
        const loadedVideos = ((project.videos as any[]) ?? []) as any[];
        const loadedPhotos = ((project.photos as any[]) ?? []) as any[];

        setState(prev => {
          const name = project.project_name || project.title || 'Untitled Project';
          const description = project.song_title ? `Song: ${project.song_title}` : 'Loaded project';
          const thumbnail =
            project.background_url ||
            (loadedVideos[0] && (loadedVideos[0].thumbnail || loadedVideos[0].url)) ||
            (loadedPhotos[0] && (loadedPhotos[0].thumbnail || loadedPhotos[0].url)) ||
            '/placeholder.jpg';

          const aesthetics = prev.aesthetics.some(a => a.id === projectId)
            ? prev.aesthetics.map(a => (a.id === projectId ? { ...a, name, description, thumbnail } : a))
            : [...prev.aesthetics, { id: projectId, name, description, thumbnail, theme: prev.theme }];

          const selectedMedia = project.background_url
            ? ({
                id: generateId(),
                url: project.background_url,
                thumbnail: project.background_url,
                type: 'video' as const
              } satisfies MediaAsset)
            : (loadedVideos[0] || loadedPhotos[0] || null);

          const clipRange =
            Array.isArray(project.clip_range) && project.clip_range.length === 2
              ? ([Number(project.clip_range[0]), Number(project.clip_range[1])] as [number, number])
              : prev.clipRange;

          return {
            ...prev,
            currentView: 'WORKSPACE',
            aesthetics,
            activeAestheticId: projectId,
            selectedMedia,
            fileName: project.song_title || prev.fileName,
            audioDuration: project.audio_duration ?? prev.audioDuration,
            clipRange,
            sections: loadedSections,
            words: loadedWords,
            videos: loadedVideos,
            photos: loadedPhotos,
            font: project.font || prev.font,
            color: project.color || prev.color,
            animationStyle: project.animation_style || prev.animationStyle,
            activeTab: 'editor'
          };
        });

        // Update project persistence state
        setCurrentProjectId(projectId);
        setIsProjectSaved(true);
        setLastSaveTime(new Date(project.updated_at || project.last_edited || project.created_at));

        console.log('Project loaded successfully');
      } else {
        console.error('Failed to load project:', result.error);
        alert('Failed to load project. Please try again.');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Failed to load project. Please try again.');
    } finally {
      setIsSavingProject(false);
    }
  };

  // Cleanup project persistence on unmount
  useEffect(() => {
    return () => {
      projectPersistenceService.cleanup();
    };
  }, []);

  const closeModalHandler = () => setState(prev => ({ ...prev, currentModal: 'NONE' }));

  // --- View Rendering ---

  const renderContent = () => {
    switch (state.currentView) {
      case 'HOME':
        return (
          <HomeView 
            onCreate={handleCreateAesthetic} 
            onViewAesthetics={() => handleNavigate('AESTHETICS')}
            onLoadProject={handleLoadProject}
          />
        );
      
      case 'AESTHETICS':
        return (
          <AestheticsListView 
            aesthetics={state.aesthetics}
            onCreate={handleCreateAesthetic}
            onSelect={(id) => handleNavigate('WORKSPACE', id)}
          />
        );

      case 'WORKSPACE':
        const activeAesthetic = getActiveAesthetic();
        if (!activeAesthetic) return <div className="p-8 dark:text-white">Aesthetic not found.</div>;

        return (
          <div className="flex-1 p-8 pb-32 max-w-[1600px] mx-auto w-full animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{activeAesthetic.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">{activeAesthetic.description}</p>
              </div>
              <VideoPreview selectedMedia={state.selectedMedia} />
            </div>

            {/* Tab-based content rendering */}
            <div className="mt-8">
              {state.activeTab === 'pexels' && (
                <PexelsView
                  selectedMedia={state.selectedMedia}
                  onMediaSelect={handleMediaSelect}
                />
              )}
              {state.activeTab === 'pinterest' && (
                <PinterestView
                  selectedMedia={state.selectedMedia}
                  onMediaSelect={handleMediaSelect}
                />
              )}
              {state.activeTab === 'editor' && (
                <TextEditorView
                  selectedMedia={state.selectedMedia}
                  onMediaSelect={handleMediaSelect}
                  lyrics={state.words.length > 0 ? state.words : sampleLyrics}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onPlay={playAudio}
                  onPause={pauseAudio}
                  onSeek={seekAudio}
                  audioDuration={state.audioDuration}
                  onExport={handleExport}
                  renderProgress={null}
                  renderStatus={''}
                  onLyricsUpdate={handleLyricsUpdate}
                  audioFile={state.audioFile}
                  onOpenTimeline={handleOpenWordTimeline}
                />
              )}
            </div>
          </div>
        );

      case 'VIDEOS':
        return (
          <ContentDraftView 
            type="video" 
            aestheticName={getActiveAesthetic()?.name || 'Untitled Aesthetic'}
            onCreateClick={() => openCreateModal('video')}
          />
        );

      case 'SLIDESHOWS':
        return (
           <ContentDraftView 
            type="slideshow" 
            aestheticName={getActiveAesthetic()?.name || 'Untitled Aesthetic'}
            onCreateClick={() => openCreateModal('slideshow')}
          />
        );
      
      case 'SEND_TO_TIKTOK':
        return <ScheduleView />;

      case 'PEXELS':
        return (
          <PexelsView
            selectedMedia={state.selectedMedia}
            onMediaSelect={handleMediaSelect}
          />
        );
      
      case 'PINTEREST':
        return (
          <PinterestView
            selectedMedia={state.selectedMedia}
            onMediaSelect={handleMediaSelect}
          />
        );

      case 'TEXT_EDITOR':
        return (
          <TextEditorView
            selectedMedia={state.selectedMedia}
            onMediaSelect={handleMediaSelect}
            lyrics={state.words.length > 0 ? state.words : sampleLyrics}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlay={playAudio}
            onPause={pauseAudio}
            onSeek={seekAudio}
            audioDuration={state.audioDuration}
            onExport={handleExport}
            renderProgress={null}
            renderStatus={''}
            onLyricsUpdate={handleLyricsUpdate}
            audioFile={state.audioFile}
            onOpenTimeline={handleOpenWordTimeline}
            />
            );

      case 'SETTINGS':
        return <SettingsView currentTheme={state.theme} onToggleTheme={toggleTheme} />;

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className={`${state.theme} transition-colors duration-200`}>
      <div className="flex min-h-screen bg-workspace dark:bg-workspaceDark font-sans text-slate-900 dark:text-white selection:bg-purple-200">
        <Sidebar
          currentView={state.currentView}
          activeAestheticId={state.activeAestheticId}
          aesthetics={state.aesthetics}
          onNavigate={handleNavigate}
          onCreateAesthetic={handleCreateAesthetic}
          activeTab={state.activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="ml-[260px] flex-1 relative flex flex-col min-h-screen">
          {/* Top User Nav */}
          {['HOME', 'AESTHETICS', 'WORKSPACE', 'PEXELS', 'PINTEREST', 'TEXT_EDITOR', 'SETTINGS'].includes(state.currentView) && (
             <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#111318]/50 backdrop-blur-sm sticky top-0 z-30 transition-colors">
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {state.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User size={16} />
                  <span>Demo User</span>
                </div>
              </div>
            </div>
          )}

          {/* Animated Content Container */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentView + (state.currentView === 'WORKSPACE' ? state.activeTab : '')}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Modals */}
        {state.currentModal === 'CREATE_CONTENT' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96 max-w-[90vw]">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Create New Content</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => openCreateModal('video')}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Video size={20} className="text-blue-600" />
                                <div>
                                    <div className="font-medium dark:text-white">Video</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Create a video with this aesthetic</div>
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => openCreateModal('slideshow')}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <PlaySquare size={20} className="text-purple-600" />
                                <div>
                                    <div className="font-medium dark:text-white">Slideshow</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Create a slideshow with this aesthetic</div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <button
                        onClick={closeModal}
                        className="mt-4 w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;