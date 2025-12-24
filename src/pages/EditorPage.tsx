import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import Sidebar from '../components/editor/Sidebar'
import VideoPreview from '../components/editor/VideoPreview'
import Timeline from '../components/editor/Timeline'
import ControlPanel from '../components/editor/ControlPanel'

export default function EditorPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const currentProject = useProjectStore(state => state.currentProject)
  const loadProjectById = useProjectStore(state => state.loadProjectById)
  const saveCurrentProject = useProjectStore(state => state.saveCurrentProject)

  useEffect(() => {
    if (projectId) {
      loadProject()
    } else if (!currentProject) {
      navigate('/')
    } else {
      setLoading(false)
    }
  }, [projectId])

  const loadProject = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      await loadProjectById(projectId)
    } catch (error) {
      console.error('Failed to load project:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCurrentProject()
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!currentProject) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-sm">{currentProject.name}</h1>
            <p className="text-xs text-gray-400">
              {currentProject.settings.videoFormat} · {currentProject.settings.resolution}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center - Video Preview */}
        <main className="flex-1 flex flex-col bg-gray-950">
          <VideoPreview />
          <Timeline />
        </main>

        {/* Right Panel */}
        <ControlPanel />
      </div>
    </div>
  )
}
