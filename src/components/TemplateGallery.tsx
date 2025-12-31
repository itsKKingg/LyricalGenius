import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'

export interface AnimationTemplate {
  id: string
  name: string
  description: string
  animationStyle: 'fade' | 'scale' | 'slide' | 'bounce' | 'typewriter' | 'karaoke' | 'none'
  settings: Partial<{
    fontSize: number
    fontWeight: number
    textShadow: boolean
    textGlow: boolean
    textStroke: boolean
  }>
}

const TEMPLATES: AnimationTemplate[] = [
  {
    id: 'karaoke-highlight',
    name: 'Karaoke Highlight Bar',
    description: 'Horizontal bar sweeps left-to-right, text color fills',
    animationStyle: 'karaoke',
    settings: { fontSize: 56, fontWeight: 700, textGlow: true },
  },
  {
    id: 'bottom-static',
    name: 'Bottom Third Static',
    description: 'Bold text at bottom third with white outline',
    animationStyle: 'none',
    settings: { fontSize: 52, fontWeight: 900, textStroke: true },
  },
  {
    id: 'center-pop-in',
    name: 'Center Large Pop-In',
    description: 'Text scales in from 0 → 1 with bouncy easing',
    animationStyle: 'scale',
    settings: { fontSize: 72, fontWeight: 700, textShadow: true },
  },
  {
    id: 'word-bounce',
    name: 'Word-by-Word Bounce',
    description: 'Each word animates in with vertical bounce',
    animationStyle: 'bounce',
    settings: { fontSize: 60, fontWeight: 600 },
  },
  {
    id: 'neon-glow',
    name: 'Neon Outline Glow',
    description: 'Text with neon color, pulsing shadow/glow',
    animationStyle: 'fade',
    settings: { fontSize: 56, fontWeight: 700, textGlow: true, textStroke: true },
  },
  {
    id: 'typewriter',
    name: 'Typewriter Sequential',
    description: 'Letters appear one-by-one with reveal animation',
    animationStyle: 'typewriter',
    settings: { fontSize: 48, fontWeight: 500 },
  },
  {
    id: 'gradient-sweep',
    name: 'Gradient Fill Sweep',
    description: 'Color gradient animates across text',
    animationStyle: 'fade',
    settings: { fontSize: 56, fontWeight: 700, textGlow: true },
  },
  {
    id: 'blur-fade',
    name: 'Blur Fade In',
    description: 'Text appears with blur then sharpens',
    animationStyle: 'fade',
    settings: { fontSize: 56, fontWeight: 600 },
  },
  {
    id: 'scale-pulse',
    name: 'Scale Pulse',
    description: 'Text grows/shrinks rhythmically',
    animationStyle: 'scale',
    settings: { fontSize: 52, fontWeight: 700 },
  },
  {
    id: 'flip-3d',
    name: 'Flip 3D',
    description: 'Text flips in 3D perspective',
    animationStyle: 'bounce',
    settings: { fontSize: 56, fontWeight: 600 },
  },
  {
    id: 'slide-sides',
    name: 'Slide In from Sides',
    description: 'Text slides from left/right edges',
    animationStyle: 'slide',
    settings: { fontSize: 56, fontWeight: 600 },
  },
  {
    id: 'explode-particles',
    name: 'Explode Particles',
    description: 'Text shatters/explodes on entry',
    animationStyle: 'bounce',
    settings: { fontSize: 64, fontWeight: 700 },
  },
  {
    id: 'rainbow-cycle',
    name: 'Rainbow Cycle',
    description: 'Text color cycles through rainbow',
    animationStyle: 'fade',
    settings: { fontSize: 56, fontWeight: 700, textGlow: true },
  },
  {
    id: 'bold-entrance',
    name: 'Bold Entrance',
    description: 'Quick scale + opacity from 0 to 1',
    animationStyle: 'scale',
    settings: { fontSize: 68, fontWeight: 900, textShadow: true },
  },
  {
    id: 'jitter-shake',
    name: 'Jitter Shake',
    description: 'Text shakes briefly on appearance',
    animationStyle: 'bounce',
    settings: { fontSize: 56, fontWeight: 600 },
  },
  {
    id: 'outline-draw',
    name: 'Outline Stroke Draw',
    description: 'SVG-like outline draws on text',
    animationStyle: 'typewriter',
    settings: { fontSize: 56, fontWeight: 700, textStroke: true },
  },
  {
    id: 'underline-wipe',
    name: 'Underline Wipe',
    description: 'Underline draws beneath text',
    animationStyle: 'slide',
    settings: { fontSize: 52, fontWeight: 600 },
  },
  {
    id: 'fade-blur',
    name: 'Fade + Blur',
    description: 'Opacity + blur-out transition',
    animationStyle: 'fade',
    settings: { fontSize: 56, fontWeight: 600 },
  },
  {
    id: 'skew-perspective',
    name: 'Skew Perspective',
    description: 'Text skews in from angle',
    animationStyle: 'slide',
    settings: { fontSize: 56, fontWeight: 700 },
  },
  {
    id: 'bounce-scale',
    name: 'Bounce Scale',
    description: 'Text bounces with scale oscillation',
    animationStyle: 'bounce',
    settings: { fontSize: 60, fontWeight: 700, textShadow: true },
  },
]

export default function TemplateGallery() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const updateSettings = useProjectStore(state => state.updateSettings)
  const currentProject = useProjectStore(state => state.currentProject)

  const handleApplyTemplate = (template: AnimationTemplate) => {
    setSelectedTemplate(template.id)

    // Apply template settings to project
    updateSettings({
      animationStyle: template.animationStyle,
      ...template.settings,
    })

    // Clear selection after a delay
    setTimeout(() => setSelectedTemplate(null), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-sm">Lyric Animation Templates</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto scrollbar-thin">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleApplyTemplate(template)}
            className={`
              relative p-3 rounded-lg border-2 text-left transition-all
              ${selectedTemplate === template.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
              }
            `}
          >
            {/* Applied indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}

            {/* Preview Thumbnail */}
            <div className="w-full aspect-[3/2] rounded bg-gray-900 mb-2 flex items-center justify-center overflow-hidden relative">
              <div className="text-center px-2">
                <p className="text-xs font-bold text-gray-300 line-clamp-2">
                  {template.name.split(' ')[0]}
                </p>
              </div>
              {/* Preview animation indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              </div>
            </div>

            {/* Template Name */}
            <h4 className="text-sm font-medium text-gray-200 line-clamp-1">
              {template.name}
            </h4>

            {/* Description */}
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {template.description}
            </p>
          </button>
        ))}
      </div>

      {/* Info Message */}
      {currentProject && currentProject.lyrics.length > 0 && (
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs text-purple-300">
            Selected template will apply to all {currentProject.lyrics.length} lyric lines
          </p>
        </div>
      )}
    </div>
  )
}
