import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from '@/stores/user'

export type Settings = {
  id: number
  uuid: string
  teams: {
    name: string
  }
  point_scales: {
    name: string
  }
  team_id: string | null
  require_review: boolean
  sc_api_key: string | null
  sc_label_id: number | null
  created_at: string
  updated_at: string
}

export type MappedSettings = {
  id: string
  team: {
    uuid: string | null
    name: string | null
  }
  pointScale: {
    uuid: string | null
    name: string | null
  }
  requireReview: boolean
  scApiKey: string | null
  scLabelId: number | null
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const settings = ref<MappedSettings | null>(null)

    async function getSettings() {
      // Get the user store inside the function to avoid circular dependency
      const userStore = useUserStore()
      const userTeam = userStore.currentUser?.teams?.[0]?.uuid

      if (!userTeam) {
        console.error('No user team found, cannot get settings')
        return
      }

      const { data, error } = await supabase
        .from('settings')
        .select(`*, teams!inner (uuid, name), point_scales (uuid, name, scale)`)
        .eq('team_id', userTeam)
        .single()

      if (error) {
        console.error('Error getting settings:', error)
        return
      }

      if (data) {
        settings.value = {
          id: data.uuid,
          team: {
            uuid: data.teams?.uuid ?? null,
            name: data.teams?.name ?? null,
          },
          pointScale: {
            uuid: data.point_scales?.uuid ?? null,
            name: data.point_scales?.name ?? null,
          },
          requireReview: data.require_review,
          scApiKey: data.sc_api_key,
          scLabelId: data.sc_label_id,
        }
      }
    }

    async function updateSettings(updateData: {
      pointScale?: string
      team?: string
      requireReview?: boolean
      labelId?: number
      apiKey?: string
    }) {
      if (!updateData || !settings.value) return

      const { error } = await supabase
        .from('settings')
        .update({
          point_scale_id: updateData.pointScale ?? settings.value.pointScale.uuid,
          team_id: updateData.team ?? settings.value.team.uuid,
          require_review: updateData.requireReview ?? settings.value.requireReview,
          sc_label_id: updateData.labelId ?? settings.value.scLabelId,
          sc_api_key: updateData.apiKey ?? settings.value.scApiKey,
        })
        .eq('uuid', settings.value.id)

      if (error) {
        console.error('Failed to update settings:', error)
        return error.message
      }

      await getSettings()
    }

    return { getSettings, settings, updateSettings }
  },
  { persist: true },
)
