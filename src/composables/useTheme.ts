import { ref } from 'vue'
import type { AccentTheme, ThemeMode } from '../types'

const currentTheme = ref<ThemeMode>('dark')
const currentAccent = ref<AccentTheme>('coral')

function readPreference(key: string) {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn(`Unable to read the ${key} preference.`, error)
    return null
  }
}

function savePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn(`Unable to save the ${key} preference.`, error)
  }
}

const savedTheme = readPreference('followdesk-theme')
if (savedTheme === 'auto' || savedTheme === 'dark' || savedTheme === 'light') currentTheme.value = savedTheme
const savedAccent = readPreference('followdesk-accent')
if (savedAccent === 'coral' || savedAccent === 'violet' || savedAccent === 'cyan' || savedAccent === 'mint' || savedAccent === 'orange') {
  currentAccent.value = savedAccent
}

export function useTheme() {
  function setTheme(theme: ThemeMode) {
    currentTheme.value = theme
    savePreference('followdesk-theme', theme)
  }

  function setAccent(accent: AccentTheme) {
    currentAccent.value = accent
    savePreference('followdesk-accent', accent)
  }

  return { currentTheme, setTheme, currentAccent, setAccent }
}
