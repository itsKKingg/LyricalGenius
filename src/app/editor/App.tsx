import React, { useState } from 'react';
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
import { User, PenLine, Video, PlaySquare, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { AppState, Section, LyricWord, ViewType, Aesthetic, MediaAsset } from './types';
import { generateId } from './utils';

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
    photos: []
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const openCreateModal = (type: 'video' | 'slideshow') => {
      setState(prev => ({ ...prev, currentModal: 'CREATE_CONTENT', createContentType: type }));
  };

  const closeModal = () => setState(prev => ({ ...prev, currentModal: 'NONE' }));

  // --- View Rendering ---

  const renderContent = () => {
    switch (state.currentView) {
      case 'HOME':
        return (
          <HomeView 
            onCreate={handleCreateAesthetic} 
            onViewAesthetics={() => handleNavigate('AESTHETICS')} 
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
        return <PexelsView />;
      
      case 'PINTEREST':
        return <PinterestView />;

      case 'TEXT_EDITOR':
        return <TextEditorView />;

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
             <div className="h-16 flex items-center justify-end px-8 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#111318]/50 backdrop-blur-sm sticky top-0 z-30 transition-colors">
            {state.currentView === 'WORKSPACE' && (
              <button 
                  onClick={() => openCreateModal('video')}
                  className="flex items-center gap-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full shadow-sm transition-all mr-4"
              >
                  Next step: create some content
                  <span className="bg-white/20 rounded-full p-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </button>
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
          )}

          {renderContent()}

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

        {/* Modals */}
        {state.currentModal === 'CREATE_CONTENT' && (
            <CreateContentModal 
                type={state.createContentType || 'video'} 
                onClose={closeModal}
                onCreate={() => {
                    alert('Create flow started!');
                    closeModal();
                }}
            />
        )}

        {state.currentModal === 'CLIP_SELECTOR' && state.audioBuffer && (
          <ClipSelectorModal 
            audioBuffer={state.audioBuffer}
            fileName={state.fileName}
            duration={state.audioDuration}
            initialRange={state.clipRange}
            onClose={closeModal} 
            onConfirm={handleClipConfirm} 
          />
        )}

        {state.currentModal === 'AUDIO_ANALYSIS' && (
          <AudioAnalysisModal 
            sections={state.sections}
            onUpdateSections={handleSectionsUpdate}
            onClose={closeModal} 
            onRunAnalysis={() => setState(prev => ({...prev, currentModal: 'WORD_TIMELINE'}))} 
          />
        )}

        {state.currentModal === 'WORD_TIMELINE' && state.audioBuffer && (
          <WordTimelineModal 
              words={state.words}
              audioBuffer={state.audioBuffer}
              duration={state.clipRange[1] - state.clipRange[0]}
              offset={state.clipRange[0]}
              onSave={handleWordTimingsSave}
              onClose={closeModal} 
          />
        )}
      </div>
    </div>
  );
}

export default App;