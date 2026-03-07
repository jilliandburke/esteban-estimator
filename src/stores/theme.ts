import { defineStore } from 'pinia'
import { ref } from 'vue'
import { updatePreset } from '@primeuix/themes'
import { useUserStore } from '@/stores/user'
import { darkThemes, lightThemes, type DarkThemeKey, type LightThemeKey } from '@/config/themes'
import { darkThemePresets, lightThemePresets } from '@/config/primeVueThemes'

export const useThemeStore = defineStore('theme', () => {
  const root = document.getElementsByTagName('html')[0]
  const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')
  const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)')
  const currentTheme = ref<'system' | 'light' | 'dark'>('dark')
  const currentDarkTheme = ref<DarkThemeKey | null>(null)
  const currentLightTheme = ref<LightThemeKey | null>(null)
  const userStore = useUserStore()

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
    root.classList.remove(
      'dark-theme-deep-forest',
      'dark-theme-midnight-sage',
      'dark-theme-slate-lime',
      'dark-theme-neon-noir',
    )

    // Add the specific dark theme class if provided
    if (themeKey) {
      const className = `dark-theme-${themeKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.classList.add(className)
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
      root.style.removeProperty('--color-background')
      root.style.removeProperty('--color-surface')
      root.style.removeProperty('--color-surface-variant')
      root.style.removeProperty('--color-text-primary')
      root.style.removeProperty('--color-text-secondary')
      root.style.removeProperty('--color-accent')
      root.style.removeProperty('--color-accent-secondary')
      root.style.removeProperty('--color-border')
    }
  }

  function applyLightThemeVariant(themeKey: LightThemeKey | null) {
    // Remove all light theme variant classes
    root.classList.remove(
      'light-theme-spring-meadow',
      'light-theme-mint-fresh',
      'light-theme-limelight',
      'light-theme-forest-light',
    )

    // Add the specific light theme class if provided
    if (themeKey) {
      const className = `light-theme-${themeKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.classList.add(className)
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
      root.style.removeProperty('--color-background')
      root.style.removeProperty('--color-surface')
      root.style.removeProperty('--color-surface-variant')
      root.style.removeProperty('--color-text-primary')
      root.style.removeProperty('--color-text-secondary')
      root.style.removeProperty('--color-accent')
      root.style.removeProperty('--color-accent-secondary')
      root.style.removeProperty('--color-border')
    }
  }

  function setDarkTheme() {
    root.classList.add('p-dark')
    currentTheme.value = 'dark'

    // Apply the user's preferred dark theme variant if they have one
    const user = userStore.currentUser
    if (user?.dark_theme) {
      applyDarkThemeVariant(user.dark_theme as DarkThemeKey)
    } else {
      // Default to Midnight Sage when no specific theme is set
      applyDarkThemeVariant('midnightSage')
    }
  }

  function setLightTheme() {
    root.classList.remove('p-dark')
    currentTheme.value = 'light'
    // Remove dark theme variants when in light mode
    applyDarkThemeVariant(null)

    // Apply the user's preferred light theme variant if they have one
    const user = userStore.currentUser
    if (user?.light_theme) {
      applyLightThemeVariant(user.light_theme as LightThemeKey)
    } else {
      // Default to Mint Fresh when no specific theme is set
      applyLightThemeVariant('mintFresh')
    }
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
