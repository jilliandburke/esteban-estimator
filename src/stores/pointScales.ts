import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useSettingsStore } from '@/stores/settings'

export type PointScale = {
  id: number
  uuid: string
  name: string | null
  scale: string | null
  created_at: string
  updated_at: string
}

export const usePointScaleStore = defineStore(
  'pointScale',
  () => {
    const settingsStore = useSettingsStore()
    const pointScale = ref<PointScale | null>(null)
    const pointScales = ref<PointScale[] | null>(null)

    const getPointScale = computed(() => {
      return pointScale.value
    })

    async function readPointScale() {
      const pointScaleId = settingsStore.settings?.pointScale.uuid

      if (!pointScaleId) {
        return 'No point scale set'
      }

      const { data, error } = await supabase
        .from('point_scales')
        .select()
        .eq('uuid', pointScaleId)
        .maybeSingle()

      if (error) {
        return error
      } else {
        pointScale.value = data
      }
    }

    async function listPointScales() {
      const { data, error } = await supabase.from('point_scales').select()

      if (error) {
        console.log('Error collecting point scales', error)
        return
      } else {
        pointScales.value = data
      }
    }

    return { pointScale, getPointScale, pointScales, readPointScale, listPointScales }
  },
  { persist: true },
)
