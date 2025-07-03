import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export type Role = {
  id: number
  uuid: string
  name: string | null
  created_at: string
  updated_at: string
}

export const useRolesStore = defineStore(
  'roles',
  () => {
    const roleList = ref<Role[]>([])

    const getRoleList = computed(() => {
      return roleList
    })

    async function getAllRoles() {
      const { data, error } = await supabase.from('roles').select()

      if (error) {
        console.log('Error collecting role list', error)
        return
      } else {
        roleList.value = data
      }
    }

    return {
      getAllRoles,
      getRoleList,
      roleList,
    }
  },
  { persist: true },
)
