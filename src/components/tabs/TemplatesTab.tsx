import { animationTemplates } from '../../utils/animationTemplates';
import { useEditor } from '../../hooks/useEditor';

export default function TemplatesTab() {
  const { selectedClips, currentProject, batchUpdateCaptions } = useEditor();

  const applyTemplate = (templateId: string) => {
    if (selectedClips.length === 0) {
      alert('Please select one or more caption clips first');
      return;
    }

    // Filter for caption clips only
    const captionIds = selectedClips.filter((id) => {
      if (!currentProject) return false;
      for (const track of currentProject.tracks) {
        if (track.type === 'caption') {
          const found = track.clips.find((c) => c.id === id);
          if (found) return true;
        }
      }
      return false;
    });

    if (captionIds.length === 0) {
      alert('Please select caption clips to apply animation');
      return;
    }

    batchUpdateCaptions(captionIds, { animationStyle: templateId as import('../../types').AnimationStyle });
  };

  return (
    <div className="p-6">
      <h4 className="font-semibold text-gray-200 mb-3">Animation Templates</h4>
      <p className="text-gray-400 text-sm mb-4">
        Select one or more captions on the timeline, then click a template to apply.
      </p>

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {animationTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template.id)}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors text-left group"
          >
            <div className="h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded mb-2 flex items-center justify-center text-white font-bold text-sm">
              Aa
            </div>
            <h5 className="text-sm font-semibold text-white mb-1">{template.name}</h5>
            <p className="text-xs text-gray-400">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
