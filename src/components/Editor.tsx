import { useEffect } from 'react';
import { useEditor } from '../hooks/useEditor';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAutoSave } from '../hooks/useAutoSave';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import PreviewCanvas from './PreviewCanvas';
import Timeline from './Timeline';
import PropertiesPanel from './PropertiesPanel';

export default function Editor() {
  const { currentProject, createNewProject } = useEditor();
  useKeyboardShortcuts();
  useAutoSave();

  useEffect(() => {
    if (!currentProject) {
      createNewProject('Untitled Project');
    }
  }, [currentProject, createNewProject]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Editor...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Preview Canvas */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <PreviewCanvas />
          <Timeline />
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
