export interface Shortcut {
  key: string
  description: string
  action: string
}

export const KEYBOARD_SHORTCUTS: Shortcut[] = [
  { key: 'Space', description: 'Play/Pause', action: 'toggle-play' },
  { key: '←', description: 'Skip backward 5s', action: 'skip-back' },
  { key: '→', description: 'Skip forward 5s', action: 'skip-forward' },
  { key: 'Cmd/Ctrl + S', description: 'Save project', action: 'save' },
  { key: 'Cmd/Ctrl + Z', description: 'Undo', action: 'undo' },
  { key: 'Cmd/Ctrl + Shift + Z', description: 'Redo', action: 'redo' },
  { key: 'Cmd/Ctrl + E', description: 'Export video', action: 'export' },
  { key: '0', description: 'Jump to start', action: 'jump-start' },
  { key: 'Cmd/Ctrl + K', description: 'Search shortcuts', action: 'search-shortcuts' },
]

export function handleKeyboardShortcut(
  event: KeyboardEvent,
  callbacks: {
    togglePlay?: () => void
    skipBack?: () => void
    skipForward?: () => void
    save?: () => void
    undo?: () => void
    redo?: () => void
    export?: () => void
    jumpStart?: () => void
  }
): boolean {
  const { key, metaKey, ctrlKey, shiftKey } = event
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? metaKey : ctrlKey

  // Space - Play/Pause
  if (key === ' ' && !modKey) {
    event.preventDefault()
    callbacks.togglePlay?.()
    return true
  }

  // Arrow keys
  if (key === 'ArrowLeft' && !modKey) {
    event.preventDefault()
    callbacks.skipBack?.()
    return true
  }

  if (key === 'ArrowRight' && !modKey) {
    event.preventDefault()
    callbacks.skipForward?.()
    return true
  }

  // Save
  if (key === 's' && modKey && !shiftKey) {
    event.preventDefault()
    callbacks.save?.()
    return true
  }

  // Undo
  if (key === 'z' && modKey && !shiftKey) {
    event.preventDefault()
    callbacks.undo?.()
    return true
  }

  // Redo
  if (key === 'z' && modKey && shiftKey) {
    event.preventDefault()
    callbacks.redo?.()
    return true
  }

  // Export
  if (key === 'e' && modKey) {
    event.preventDefault()
    callbacks.export?.()
    return true
  }

  // Jump to start
  if (key === '0' && !modKey) {
    event.preventDefault()
    callbacks.jumpStart?.()
    return true
  }

  return false
}
