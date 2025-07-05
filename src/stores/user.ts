import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from 'primevue/usetoast'
import { useEstimationsStore } from '@/stores/estimations'
import { useThemeStore } from '@/stores/theme'
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js'

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

export const useUserStore = defineStore(
  'user',
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

    const avatarLink = computed(() => {
      return (
        currentUser.value?.avatar_url ||
        'https://static1.personalitydatabase.net/2/pdb-images-prod/b805995f/profile_images/c192170f01b245a1a180eb77aa6bb40f.png'
      )
    })

    function resetGetUserError() {
      getUserError.value = null
    }

    function getUsersWithRole(roleName: string) {
      return allUsers.value?.filter((user) => {
        if (user.roles.some((role) => role.name === roleName)) {
          return user
        }
      })
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
      email?: string
      name?: string
      avatar_url?: string
      theme?: 'system' | 'light' | 'dark'
    }) {
      if (userData && currentUser.value) {
        const userId = currentUser.value.id
        let updateError = null

        // Update user attributes in our db
        const { error } = await supabase
          .from('profiles')
          .update({
            email: userData.email || currentUser.value.email,
            full_name: userData.name || currentUser.value.full_name,
            avatar_url: userData.avatar_url || currentUser.value.avatar_url,
            theme: userData.theme || currentUser.value.theme,
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

      if (error) {
        console.log('Error retriving users', error)
        return
      }

      allUsers.value = data
    }

    async function createUser(userData: {
      name: string
      email: string
      password: string
      team: { name: string; code: string }
      role: { name: string; code: string }
    }) {
      if (userData) {
        let createError = null

        const { error } = await supabase.functions.invoke('create-user', {
          body: userData,
        })

        if (error) {
          if (error instanceof FunctionsHttpError) {
            const errorMessage = await error.context.json()
            createError = errorMessage.error
          } else if (error instanceof FunctionsRelayError) {
            createError = error.message
          } else if (error instanceof FunctionsFetchError) {
            createError = error.message
          }

          return createError
        }

        await getAllUsers()
        return createError
      }
    }

    async function uploadAvatar(file: any) {
      const fileName = `avatar-${currentUser.value?.id}-${Date.now()}.${file.type.split('/').pop()}`

      const { data: uploadData, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (error) {
        console.error('Error uploading avatar:', error)
        return error
      } else {
        const { data: avatarUrl } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)

        currentUser.value!.avatar_url = avatarUrl.publicUrl
        const result = await updateUser({ avatar_url: avatarUrl.publicUrl })

        if (result) {
          return result
        }

        return null
      }
    }

    return {
      getUser,
      updateUser,
      getAllUsers,
      createUser,
      getUsersWithRole,
      uploadAvatar,
      avatarLink,
      getUserError,
      isLoggedIn,
      currentUser,
      allUsers,
      listAllUsers,
    }
  },
  { persist: true },
)
