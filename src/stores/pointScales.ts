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
    const pointScale = ref<PointScale | null>(null)
    const pointScales = ref<PointScale[] | null>(null)

    const getPointScale = computed(() => pointScale.value)

    async function readPointScale() {
      // Get settings store inside function to avoid circular dependency
      const settingsStore = useSettingsStore()
      const pointScaleId = settingsStore.settings?.pointScale.uuid

      if (!pointScaleId) {
        console.error('No point scale ID found in settings')
        return
      }

      const { data, error } = await supabase
        .from('point_scales')
        .select()
        .eq('uuid', pointScaleId)
        .maybeSingle()

      if (error) {
        console.error('Error reading point scale:', error)
        return
      }

      pointScale.value = data
    }

    async function listPointScales() {
      const { data, error } = await supabase.from('point_scales').select()

      if (error) {
        console.error('Error listing point scales:', error)
        return
      }

      pointScales.value = data
    }

    return { pointScale, getPointScale, pointScales, readPointScale, listPointScales }
  },
  { persist: true },
)
