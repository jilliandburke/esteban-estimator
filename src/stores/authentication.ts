import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useRolesStore } from '@/stores/roles'
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
  const userStore = useUserStore()
  const rolesStore = useRolesStore()
  const settingsStore = useSettingsStore()
  const pointScaleStore = usePointScaleStore()
  const loginLoading = ref(false)

  function resetLoginError() {
    loginError.value = null
  }

  function resetLogoutError() {
    loginError.value = null
  }

  async function signIn(formEvent: {
    valid: boolean
    values: { email: string; password: string }
  }) {
    if (formEvent.valid) {
      loginLoading.value = true
      const { error } = await supabase.auth.signInWithPassword({
        email: formEvent.values.email,
        password: formEvent.values.password,
      })

      if (error) {
        loginLoading.value = false
        loginError.value = error.message
        return
      } else {
        // Initialize App
        await userStore.getUser()
        await settingsStore.getSettings()
        await pointScaleStore.listPointScales()
        await pointScaleStore.readPointScale()
        await rolesStore.getAllRoles()

        // Reset errors and push to the Dashboard
        resetLoginError()
        router.push('/')
        loginLoading.value = false
      }
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      logoutError.value = error.message
      return
    } else {
      userStore.currentUser = null
      resetLogoutError()
      router.push('/login')
    }
  }

  return { loginError, loginLoading, signIn, signOut }
})
