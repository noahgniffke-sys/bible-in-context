import { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, THEME_IDS } from '../lib/themes'

const ThemeContext = createContext({})

export function useTheme() {
  return useContext(ThemeContext)
}

function storedTheme() {
  try {
    const saved = localStorage.getItem('bic_theme')
    if (THEME_IDS.has(saved)) return saved
  } catch {
    // Private mode can block storage. Fall through to the default.
  }
  return 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(storedTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('bic_theme', theme) } catch { /* ignore */ }
  }, [theme])

  const setTheme = (next) => {
    if (THEME_IDS.has(next)) setThemeState(next)
  }

  const toggleTheme = () => {
    const index = THEMES.findIndex((item) => item.id === theme)
    const next = THEMES[(index + 1) % THEMES.length]
    setThemeState(next.id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
