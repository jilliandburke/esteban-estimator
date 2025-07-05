import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

export const useThemeStore = defineStore('theme', () => {
  const root = document.getElementsByTagName('html')[0]
  const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')
  const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)')
  const currentTheme = ref<'system' | 'light' | 'dark'>('dark')
  const userStore = useUserStore()

  function setSystemTheme() {
    if (prefersDarkTheme.matches) {
      setDarkTheme()
    }

    if (prefersLightTheme.matches) {
      setLightTheme()
    }
  }

  function setDarkTheme() {
    root.classList.add('p-dark')
    currentTheme.value = 'dark'
  }

  function setLightTheme() {
    root.classList.remove('p-dark')
    currentTheme.value = 'light'
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

  return { setAppTheme, setDarkTheme, setLightTheme, currentTheme }
})
