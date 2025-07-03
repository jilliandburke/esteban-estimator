import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useEstimationsStore } from './estimations'

export type Team = {
  id: number
  uuid: string
  name: string | null
  member_count: number | null
  created_at: string
  updated_at: string
}

export const useTeamsStore = defineStore(
  'teams',
  () => {
    const teamList = ref<Team[]>([])

    const getTeamList = computed(() => {
      return teamList
    })

    async function getTeamByEpicId(epicId: string) {
      const { data: teamData, error: teamError } = await supabase
        .from('epics')
        .select(`*, teams ( * )`)
        .eq('uuid', epicId)
        .maybeSingle()

      if (teamError) return { data: null, error: teamError }
      if (!teamData) return { data: null, error: 'No team found' }

      return { data: teamData.teams, error: null }
    }

    async function hasTeamCompletedEstimation(epicId: string) {
      // Get team epic is assigned to
      const { data: team, error: teamError } = await getTeamByEpicId(epicId)
      const storyCount = await useEstimationsStore().getStoryCount(epicId)

      // If no team or storyCount, do not continue
      if (teamError) return
      if (!team) return
      if (!storyCount) return

      // Collect all estimations by that team for that epic
      const { count: totalEstimations, error } = await supabase
        .from('estimations')
        .select('*', { count: 'exact', head: true })
        .eq('epic_id', epicId)
        .eq('team_id', team.uuid)

      if (error) return

      if (team.member_count) {
        const totalEstimationsExpected = team.member_count * storyCount

        // If we have all the estimations we expect, start getting the averages
        if (totalEstimationsExpected === totalEstimations) {
          return true
        } else {
          return false
        }
      }
    }

    async function getAllTeams() {
      const { data, error } = await supabase.from('teams').select()

      if (error) {
        console.log('Error collecting team list', error)
        return
      } else {
        teamList.value = data
      }
    }

    async function createTeam(teamName: string) {
      const { error } = await supabase.from('teams').insert({
        name: teamName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.log('Error creating team', error)
        return error
      } else {
        await getAllTeams()
      }
    }

    return {
      hasTeamCompletedEstimation,
      getTeamByEpicId,
      getAllTeams,
      createTeam,
      getTeamList,
      teamList,
    }
  },
  { persist: true },
)
