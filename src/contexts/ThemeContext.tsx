import React, { createContext, useContext, useState, useEffect } from 'react'

export type AccentColor = 'purple' | 'green' | 'pink' | 'blue' | 'orange'
export type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  accent: AccentColor
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [accent, setAccent] = useState<AccentColor>('purple')

  useEffect(() => {
    if (typeof document === 'undefined') return

    const rafId = window.requestAnimationFrame(() => {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(mode)
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
