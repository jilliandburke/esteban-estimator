import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserSessionStore } from '@/stores/userSession'
import { useTeamsStore } from '@/stores/teams'
import { useSettingsStore } from '@/stores/settings'
import { usePointScaleStore } from '@/stores/pointScales'
import { supabase } from '@/lib/supabaseClient'

export type User = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  theme: 'system' | 'light' | 'dark'
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const loginError = ref<null | string>(null)
  const logoutError = ref<null | string>(null)
  const userSessionStore = useUserSessionStore()
  const teamStore = useTeamsStore()
  const settingsStore = useSettingsStore()
  const pointScaleStore = usePointScaleStore()

  function resetLoginError() {
    loginError.value = null
  }

  function resetLogoutError() {
    loginError.value = null
  }

  async function signIn(formEvent: any) {
    if (formEvent.valid) {
      const { error } = await supabase.auth.signInWithPassword({
        email: formEvent.values.email,
        password: formEvent.values.password,
      })

      if (error) {
        loginError.value = error.message
        return
      } else {
        // Initialize App
        await userSessionStore.getUser()
        await userSessionStore.getAllUsers()
        await teamStore.getAllTeams()
        await settingsStore.getSettings()
        await pointScaleStore.listPointScales()
        await pointScaleStore.readPointScale()

        // Reset errors and push to the Dashboard
        resetLoginError()
        router.push('/')
      }
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      logoutError.value = error.message
      return
    } else {
      userSessionStore.currentUser = null
      resetLogoutError()
      router.push('/login')
    }
  }

  return { loginError, signIn, signOut }
})
