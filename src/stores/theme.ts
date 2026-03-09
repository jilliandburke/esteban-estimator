import { defineStore } from 'pinia'
import { ref } from 'vue'
import { updatePreset } from '@primeuix/themes'
import { useUserStore } from '@/stores/user'
import { darkThemes, lightThemes, type DarkThemeKey, type LightThemeKey } from '@/config/themes'
import { darkThemePresets, lightThemePresets } from '@/config/primeVueThemes'

// Default theme constants
const DEFAULT_DARK_THEME: DarkThemeKey = 'midnightSage'
const DEFAULT_LIGHT_THEME: LightThemeKey = 'mintFresh'

// Theme CSS variables to manage
const THEME_CSS_VARS = [
  '--color-background',
  '--color-surface',
  '--color-surface-variant',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-accent',
  '--color-accent-secondary',
  '--color-border',
] as const

export const useThemeStore = defineStore('theme', () => {
  const root = document.getElementsByTagName('html')[0]
  const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')
  const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)')
  const currentTheme = ref<'system' | 'light' | 'dark'>('dark')
  const currentDarkTheme = ref<DarkThemeKey | null>(null)
  const currentLightTheme = ref<LightThemeKey | null>(null)
  const userStore = useUserStore()

  // Helper: Generate theme class name from key
  function generateThemeClassName(mode: 'dark' | 'light', themeKey: string): string {
    return `${mode}-theme-${themeKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`
  }

  // Helper: Remove all theme variant classes for a given mode
  function removeAllThemeClasses(mode: 'dark' | 'light') {
    const themes = mode === 'dark' ? darkThemes : lightThemes
    const classNames = Object.keys(themes).map((key) => generateThemeClassName(mode, key))
    root.classList.remove(...classNames)
  }

  // Helper: Reset theme CSS variables to defaults
  function resetThemeVariables() {
    THEME_CSS_VARS.forEach((varName) => root.style.removeProperty(varName))
  }

  function setSystemTheme() {
    if (prefersDarkTheme.matches) {
      setDarkTheme()
    }

    if (prefersLightTheme.matches) {
      setLightTheme()
    }
  }

  function applyDarkThemeVariant(themeKey: DarkThemeKey | null) {
    // Remove all dark theme variant classes
    removeAllThemeClasses('dark')

    // Add the specific dark theme class if provided
    if (themeKey) {
      root.classList.add(generateThemeClassName('dark', themeKey))
      currentDarkTheme.value = themeKey

      // Update CSS variables for Tailwind
      const theme = darkThemes[themeKey]
      if (theme) {
        Object.entries(theme.cssVars).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })
      }

      // Update PrimeVue preset with the selected theme
      const preset = darkThemePresets[themeKey]
      if (preset) {
        updatePreset(preset)
      }
    } else {
      currentDarkTheme.value = null
      // Reset CSS variables to default when no specific theme is selected
      resetThemeVariables()
    }
  }

  function applyLightThemeVariant(themeKey: LightThemeKey | null) {
    // Remove all light theme variant classes
    removeAllThemeClasses('light')

    // Add the specific light theme class if provided
    if (themeKey) {
      root.classList.add(generateThemeClassName('light', themeKey))
      currentLightTheme.value = themeKey

      // Update CSS variables for Tailwind
      const theme = lightThemes[themeKey]
      if (theme) {
        Object.entries(theme.cssVars).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })
      }

      // Update PrimeVue preset with the selected theme
      const preset = lightThemePresets[themeKey]
      if (preset) {
        updatePreset(preset)
      }
    } else {
      currentLightTheme.value = null
      // Reset CSS variables to default when no specific theme is selected
      resetThemeVariables()
    }
  }

  function setDarkTheme() {
    root.classList.add('p-dark')
    currentTheme.value = 'dark'

    // Apply the user's preferred dark theme variant if they have one
    const user = userStore.currentUser
    const themeVariant = (user?.dark_theme as DarkThemeKey) || DEFAULT_DARK_THEME
    applyDarkThemeVariant(themeVariant)
  }

  function setLightTheme() {
    root.classList.remove('p-dark')
    currentTheme.value = 'light'
    // Remove dark theme variants when in light mode
    applyDarkThemeVariant(null)

    // Apply the user's preferred light theme variant if they have one
    const user = userStore.currentUser
    const themeVariant = (user?.light_theme as LightThemeKey) || DEFAULT_LIGHT_THEME
    applyLightThemeVariant(themeVariant)
  }

  async function setAppTheme() {
    const currentUser = userStore.currentUser

    if (!currentUser) {
      setSystemTheme()
      return
    }

    switch (currentUser?.theme) {
      case 'light':
        setLightTheme()
        break

      case 'dark':
        setDarkTheme()
        break

      case 'system':
        setSystemTheme()
        break

      default:
        break
    }
  }

  return {
    setAppTheme,
    setDarkTheme,
    setLightTheme,
    currentTheme,
    currentDarkTheme,
    currentLightTheme,
    applyDarkThemeVariant,
    applyLightThemeVariant,
  }
})
