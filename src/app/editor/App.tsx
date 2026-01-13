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

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Project persistence state
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isProjectSaved, setIsProjectSaved] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Render state
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [renderStatus, setRenderStatus] = useState<string>('');
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [showRenderingModal, setShowRenderingModal] = useState(false);

  // Word Timeline Modal state
  const [selectedLineRange, setSelectedLineRange] = useState<{ start: number; end: number } | null>(null);

  // --- Audio Playback Functions ---

  // Update current time using requestAnimationFrame for smooth playback
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const updateTime = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime * 1000); // Convert to milliseconds
          animationFrameRef.current = requestAnimationFrame(updateTime);
        }
      };
      updateTime();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Project persistence - Auto-save every 30 seconds if state has changed
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (!isProjectSaved && !isSavingProject && state.currentView === 'WORKSPACE') {
        await handleAutoSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isProjectSaved, isSavingProject, state.currentView]);

  // Project persistence - Save when state changes (debounced)
  useEffect(() => {
    if (state.currentView !== 'WORKSPACE') return;
    
    const saveTimeout = setTimeout(async () => {
      await handleAutoSave();
    }, 2000); // Auto-save 2 seconds after state change

    return () => clearTimeout(saveTimeout);
  }, [
    state.selectedMedia?.url, 
    JSON.stringify(state.words), 
    state.audioFile?.name, 
    state.font, 
    state.color, 
    state.animationStyle,
    state.currentView
  ]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekAudio = (timeMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeMs / 1000; // Convert milliseconds to seconds
      setCurrentTime(timeMs);
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

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [state.audioFile]);

  // Tab Handler
  const setActiveTab = (tab: 'editor' | 'pexels' | 'pinterest') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  // Media Selection Handler
  const handleMediaSelect = (media: MediaAsset) => {
    setState(prev => ({ ...prev, selectedMedia: media }));
  };

  // Toggle Theme Handler
  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  // --- Navigation & Data Management ---

  const handleNavigate = (view: ViewType, aestheticId?: string) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      activeAestheticId: aestheticId || (view === 'WORKSPACE' ? prev.activeAestheticId : null)
    }));
  };

  const handleCreateAesthetic = () => {
    const newId = generateId();
    const newAesthetic: Aesthetic = {
      id: newId,
      name: `Untitled Aesthetic ${state.aesthetics.length + 1}`,
      description: 'A new visual universe for your lyrics.',
      thumbnail: `https://picsum.photos/400/300?random=${newId}`,
      theme: 'Modern'
    };

    setState(prev => ({
      ...prev,
      aesthetics: [...prev.aesthetics, newAesthetic],
      currentView: 'WORKSPACE',
      activeAestheticId: newId,
      // Reset workspace for new aesthetic
      audioFile: null,
      audioBuffer: null,
      audioDuration: 0,
      fileName: '',
      videos: [],
      photos: []
    }));
  };

  const getActiveAesthetic = () => {
    return state.aesthetics.find(a => a.id === state.activeAestheticId);
  };

  // --- Workspace Actions ---

  const handleAudioUpload = async (file: File) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        setState(prev => ({
            ...prev,
            audioFile: file,
            audioBuffer: audioBuffer,
            audioDuration: audioBuffer.duration,
            fileName: file.name,
            clipRange: [0, audioBuffer.duration],
            currentModal: 'CLIP_SELECTOR'
        }));
    } catch (e) {
        console.error("Error decoding audio", e);
        alert("Failed to load audio file.");
    }
  };

  const handleClipConfirm = (range: [number, number]) => {
      setState(prev => ({
          ...prev,
          clipRange: range,
          currentModal: 'AUDIO_ANALYSIS'
      }));
  };

  const handleSectionsUpdate = (newSections: Section[]) => {
      setState(prev => ({ ...prev, sections: newSections }));
  };

  const handleWordTimingsSave = (newWords: LyricWord[]) => {
      setState(prev => ({ ...prev, words: newWords, currentModal: 'NONE' }));
  };

  const handleLyricsUpdate = (newLyrics: LyricWord[]) => {
      setState(prev => ({ ...prev, words: newLyrics }));
      setIsProjectSaved(false); // Mark project as unsaved
  };

  const handleOpenWordTimeline = (startIndex: number, endIndex: number) => {
    setSelectedLineRange({ start: startIndex, end: endIndex });
    setState(prev => ({ ...prev, currentModal: 'WORD_TIMELINE' }));
  };

  const closeWordTimelineModal = () => {
    setState(prev => ({ ...prev, currentModal: 'NONE' }));
    setSelectedLineRange(null);
  };

  // Sample lyrics for testing - in real app this would come from word timing analysis
  const sampleLyrics: LyricWord[] = [
    { text: "Hello", start: 0, end: 800 },
    { text: "world", start: 800, end: 1600 },
    { text: "this", start: 1600, end: 2400 },
    { text: "is", start: 2400, end: 3000 },
    { text: "a", start: 3000, end: 3400 },
    { text: "test", start: 3400, end: 4200 },
    { text: "of", start: 4200, end: 4600 },
    { text: "the", start: 4600, end: 5200 },
    { text: "audio", start: 5200, end: 6000 },
    { text: "sync", start: 6000, end: 6800 },
    { text: "system", start: 6800, end: 7600 }
  ];

  const openCreateModal = (type: 'video' | 'slideshow') => {
      setState(prev => ({ ...prev, currentModal: 'CREATE_CONTENT', createContentType: type }));
  };

  const generateProjectJson = () => {
    // Use actual uploaded media if available, otherwise use sample
    const selectedMediaUrl = state.selectedMedia?.url || 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
    
    return {
      project_id: currentProjectId,
      background_url: selectedMediaUrl,
      audio_url: '/tmp/audio.mp3', // Demo audio file
      lyricArray: state.words.length > 0 ? state.words : sampleLyrics,
      lyrics: state.words.length > 0 ? state.words : sampleLyrics, // Support both formats
      font: state.font || 'Inter',
      color: state.color || '#ffffff',
      animationStyle: state.animationStyle || 'fade'
    };
  };

  const handleExport = async () => {
    const projectJson = generateProjectJson();
    console.log('Project JSON Blueprint:', JSON.stringify(projectJson, null, 2));
    
    // For demo purposes, we'll simulate a background video file
    // In a real implementation, this would be the uploaded background video
    if (projectJson.background_url.includes('sample-videos.com')) {
      // Download and save the sample video locally for demo
      try {
        const response = await fetch(projectJson.background_url);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('background_video', blob, 'background.mp4');
        
        // For demo, we'll use a local path (this would be handled by file upload in real app)
        projectJson.background_url = '/tmp/background.mp4';
      } catch (error) {
        console.log('Demo: Using sample background video path');
        projectJson.background_url = '/tmp/background.mp4';
      }
    }
    
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectJson),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Render request failed');
      }

      const data = await response.json();
      console.log('Render job started:', data);

      // Store job ID and show modal
      setRenderJobId(data.job_id);
      setShowRenderingModal(true);
      
      // Reset local progress tracking
      setRenderProgress(null);
      setRenderStatus('');

    } catch (error) {
      console.error('Export failed:', error);
      setRenderStatus('Export failed. Please try again.');
      setTimeout(() => setRenderStatus(''), 3000);
    }
  };

  const handleRenderComplete = (outputPath: string) => {
    console.log('Render completed:', outputPath);
    // The modal will handle the download functionality
  };

  const closeRenderingModal = () => {
    setShowRenderingModal(false);
    setRenderJobId(null);
  };

  // --- Project Persistence Functions ---

  const handleAutoSave = async () => {
    if (state.currentView !== 'WORKSPACE') return;
    
    setIsSavingProject(true);
    setIsProjectSaved(false);

    try {
      const projectState: ProjectState = {
        title: getActiveAesthetic()?.name || 'Untitled Project',
        background_url: state.selectedMedia?.url,
        audio_url: state.audioFile ? URL.createObjectURL(state.audioFile) : undefined,
        lyrics_json: state.words.length > 0 ? state.words : sampleLyrics,
        activeTab: state.activeTab || 'editor',
        selectedMedia: state.selectedMedia,
        audioFile: state.audioFile,
        audioDuration: state.audioDuration,
        words: state.words,
        font: state.font,
        color: state.color,
        animationStyle: state.animationStyle
      };

      const result = await projectPersistenceService.saveProject(
        projectState,
        currentProjectId || undefined
      );

      if (result.success) {
        setIsProjectSaved(true);
        setLastSaveTime(new Date());
        if (result.projectId && !currentProjectId) {
          setCurrentProjectId(result.projectId);
        }
      } else {
        console.error('Auto-save failed:', result.error);
        setIsProjectSaved(false);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setIsProjectSaved(false);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    setIsSavingProject(true);
    
    try {
      const result = await projectPersistenceService.loadProject(projectId);
      
      if (result.success && result.project) {
        const project = result.project;
        
        // Convert project data back to app state
        const loadedWords = (project.lyrics_json as any[]) || [];
        
        setState(prev => ({
          ...prev,
          currentView: 'WORKSPACE',
          activeAestheticId: projectId, // Use projectId as aestheticId for consistency
          selectedMedia: project.background_url ? {
            id: generateId(),
            url: project.background_url,
            type: 'video' as const
          } : null,
          words: loadedWords,
          font: prev.font,
          color: prev.color,
          animationStyle: prev.animationStyle
        }));

        // Update project persistence state
        setCurrentProjectId(projectId);
        setIsProjectSaved(true);
        setLastSaveTime(new Date(project.last_edited));
        
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

  const closeModal = () => setState(prev => ({ ...prev, currentModal: 'NONE' }));

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
                  renderProgress={renderProgress}
                  renderStatus={renderStatus}
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
            renderProgress={renderProgress}
            renderStatus={renderStatus}
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
          {/* Top User Nav - Show on most pages but let ContentDraftView/ScheduleView handle their own headers if needed, 
              but for consistency with design, those views have specific full-width headers. 
              We'll conditionally render this generic header. */}
          {['HOME', 'AESTHETICS', 'WORKSPACE', 'PEXELS', 'PINTEREST', 'TEXT_EDITOR', 'SETTINGS'].includes(state.currentView) && (
             <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#111318]/50 backdrop-blur-sm sticky top-0 z-30 transition-colors">
              
              {/* Project Save Status */}
              {state.currentView === 'WORKSPACE' && (
                <div className="flex items-center gap-2">
                  {isSavingProject ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : isProjectSaved ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check size={16} />
                      <span>Saved</span>
                      {lastSaveTime && (
                        <span className="text-gray-400 dark:text-gray-500">
                          {lastSaveTime.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      Unsaved changes
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                {state.currentView === 'WORKSPACE' && (
                  <motion.button 
                      onClick={() => openCreateModal('video')}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0px 0px 0px rgba(59, 130, 246, 0)",
                          "0px 0px 20px rgba(59, 130, 246, 0.5)",
                          "0px 0px 0px rgba(59, 130, 246, 0)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full shadow-sm transition-all mr-4"
                  >
                      Next step: create some content
                      <span className="bg-white/20 rounded-full p-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
                  </motion.button>
                )}
            
                <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`p-2 rounded-full transition-colors ${isProfileOpen ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800'}`}
                  >
                        <User size={20} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1A1D23] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in origin-top-right">
                          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">My Account</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">demo@lyricalgenius.com</p>
                          </div>
                          <div className="p-2 space-y-1">
                              <button 
                                  onClick={toggleTheme}
                                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                  <div className="flex items-center gap-3">
                                    {state.theme === 'dark' ? <Moon size={16} className="text-gray-400"/> : <Sun size={16} className="text-gray-400"/>}
                                    Theme
                                  </div>
                                  <span className="text-xs text-gray-400 capitalize">{state.theme}</span>
                              </button>
                              <button 
                                  onClick={() => { handleNavigate('SETTINGS'); setIsProfileOpen(false); }}
                                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                  <Settings size={16} className="text-gray-400"/>
                                  Settings
                              </button>
                              <button 
                                  onClick={() => { alert('Sign out clicked'); setIsProfileOpen(false); }}
                                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                              >
                                  <LogOut size={16} className="text-red-400 group-hover:text-red-600"/>
                                  Sign Out
                              </button>
                          </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

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

          {/* Bottom Persistent Action Bar - Only in Workspace */}
          {state.currentView === 'WORKSPACE' && (
            <div className="fixed bottom-0 left-[260px] right-0 bg-sidebarLight dark:bg-sidebar p-4 z-40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center animate-slide-up transition-colors">
                <div 
                    onClick={() => openCreateModal('video')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white cursor-pointer transition-colors text-sm font-medium"
                >
                    <PenLine size={16} />
                    Create using this aesthetic
                </div>
            </div>
          )}
        </main>

        {/* Modals - Temporarily disabled for testing */}
        {state.currentModal === 'CREATE_CONTENT' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#1A1D23] p-6 rounded-lg">
                    <p className="text-slate-900 dark:text-white">Create Content Modal</p>
                    <button onClick={closeModal} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Close</button>
                </div>
            </div>
        )}

        {state.currentModal === 'CLIP_SELECTOR' && state.audioBuffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#1A1D23] p-6 rounded-lg">
                  <p className="text-slate-900 dark:text-white">Clip Selector Modal</p>
                  <button onClick={closeModal} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Close</button>
              </div>
          </div>
        )}

        {state.currentModal === 'AUDIO_ANALYSIS' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#1A1D23] p-6 rounded-lg">
                  <p className="text-slate-900 dark:text-white">Audio Analysis Modal</p>
                  <button onClick={closeModal} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Close</button>
              </div>
          </div>
        )}

        <WordTimelineModal
          isOpen={state.currentModal === 'WORD_TIMELINE'}
          words={state.words.length > 0 ? state.words : sampleLyrics}
          initialSelection={selectedLineRange}
          currentTime={currentTime}
          isPlaying={isPlaying}
          audioDuration={state.audioDuration}
          onClose={closeWordTimelineModal}
          onPlay={playAudio}
          onPause={pauseAudio}
          onSeek={seekAudio}
          onWordsUpdate={handleLyricsUpdate}
        />

        {/* Rendering Modal */}
        <RenderingModal
          isOpen={showRenderingModal}
          jobId={renderJobId}
          projectId={currentProjectId}
          onClose={closeRenderingModal}
          onComplete={handleRenderComplete}
        />

    </div>
  );
}

export default App;