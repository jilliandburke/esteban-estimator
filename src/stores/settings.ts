import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

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
      const { data, error } = await supabase
        .from('settings')
        .select(`*, teams (uuid, name), point_scales (uuid, name, scale)`)
        .maybeSingle()

      if (error) {
        console.log('Error getting settings', error)
        return
      }

      if (data) {
        const mappedSettings = {
          id: data.uuid,
          team: {
            uuid: data?.teams?.uuid ?? null,
            name: data?.teams?.name ?? null,
          },
          pointScale: {
            uuid: data?.point_scales?.uuid ?? null,
            name: data?.point_scales?.name ?? null,
          },
          requireReview: data.require_review,
          scApiKey: data.sc_api_key,
          scLabelId: data.sc_label_id,
        }

        settings.value = mappedSettings
      }
    }

    async function updateSettings(updateData: any) {
      if (updateData && settings.value) {
        const settingsId = settings.value.id
        let updateError = null

        // This could use a refactor so if the item in question isn't passed in then it isn't
        // updated
        const { error } = await supabase
          .from('settings')
          .update({
            point_scale_id: updateData.pointScale || settings.value.pointScale.uuid,
            team_id: updateData.team || settings.value.team.uuid,
            require_review: updateData.requireReview || settings.value.requireReview,
            sc_label_id: updateData.labelId || settings.value.scLabelId,
            sc_api_key: updateData.apiKey ?? settings.value.scApiKey,
          })
          .eq('uuid', settingsId)

        if (error) {
          updateError = `Failed to update settings: ${error}`
          return updateError
        }

        await getSettings()
        return updateError
      }
    }

    return { getSettings, settings, updateSettings }
  },
  { persist: true },
)
