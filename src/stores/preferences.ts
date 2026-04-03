import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'rm-theme'

type PreferencesState = {
  theme: ThemeMode
  isDarkMode: boolean
  initializeTheme: () => void
  toggleTheme: () => void
}

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  theme: 'light',
  isDarkMode: false,
  initializeTheme: () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    const theme =
      savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

    applyTheme(theme)
    set({ theme, isDarkMode: theme === 'dark' })
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
    set({ theme: nextTheme, isDarkMode: nextTheme === 'dark' })
  },
}))
