import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'primevue/usetoast'
import { useEstimationsStore } from '@/stores/estimations'
import { useThemeStore } from '@/stores/theme'

export type Team = {
  uuid: string | null
  name: string | null
}

export type Role = {
  uuid: string | null
  name: string | null
}

export type User = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  theme: 'system' | 'light' | 'dark'
  teams: Team[]
  roles: Role[]
}

export const useUserSessionStore = defineStore(
  'userSession',
  () => {
    const currentUser = ref<null | User>(null)
    const allUsers = ref<User[] | null>(null)
    const getUserError = ref<null | string>(null)
    const estimationsStore = useEstimationsStore()
    const themeStore = useThemeStore()
    const toast = useToast()

    const isLoggedIn = computed(() => {
      return currentUser.value !== null
    })

    const listAllUsers = computed(() => {
      return allUsers.value
    })

    function resetGetUserError() {
      getUserError.value = null
    }

    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`*, teams (uuid, name), roles( uuid, name )`)
          .eq('id', authUser.id)

        if (error) {
          toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
          getUserError.value = error.message
        } else {
          const profile = data[0]

          resetGetUserError()
          currentUser.value = profile
          await estimationsStore.getEstimations()
        }
      }
    }

    async function updateUser(userData: {
      email: string
      name: string
      theme: 'system' | 'light' | 'dark'
    }) {
      if (userData && currentUser.value) {
        const userId = currentUser.value.id
        let updateError = null

        // Update user attributes in our db
        const { error } = await supabase
          .from('profiles')
          .update({
            email: userData.email,
            full_name: userData.name,
            theme: userData.theme,
          })
          .eq('id', userId)

        if (error) {
          updateError = `Failed to update user: ${error}`
          return updateError
        }

        // Update user attributes in the auth db
        const { error: authError } = await supabase.auth.updateUser({
          email: userData.email,
        })

        if (authError) {
          updateError = `Failed to update user: ${authError}`
          return updateError
        }

        // Update current user and their new app theme
        await getUser()
        themeStore.setAppTheme()

        return updateError
      }
    }

    async function getAllUsers() {
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, teams (uuid, name), roles( uuid, name )`)

      console.log(data)

      if (error) {
        console.log('Error retriving users', error)
        return
      }

      allUsers.value = data
    }

    async function inviteUser(userData: {
      name: string
      team: { name: string; code: string }
      email: string
    }) {
      if (userData) {
        let inviteError = null

        const { error } = await supabase.functions.invoke('invite-user', {
          body: userData,
        })

        if (error) {
          inviteError = `Failed to update user: ${error}`
          return inviteError
        }

        await getAllUsers()
        return inviteError
      }
    }

    return {
      getUser,
      updateUser,
      getAllUsers,
      inviteUser,
      getUserError,
      isLoggedIn,
      currentUser,
      allUsers,
      listAllUsers,
    }
  },
  { persist: true },
)
