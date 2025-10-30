import { supabase } from '@/lib/supabaseClient'
import { type User } from '@/stores/user'
import { type Estimation, EstimationStatus } from '@/stores/estimations'
import { listEstimations } from '@/services/estimationService'

const listEpics = async (user: User) => {
  const errors: Error[] = []
  let mappedEpics: Estimation[] = []

  if (!user) {
    errors.push(new Error('No user supplied'))
  }

  const teamIds = [...new Set(user.teams.map((team) => team.uuid))]

  if (!teamIds) {
    errors.push(new Error('No teams found for user'))
  }

  const { data: epicData, error: epicError } = await supabase
    .from('epics')
    .select()
    .in('team_id', teamIds as string[])
    .order('updated_at', { ascending: false })

  if (epicError) {
    errors.push(epicError)
  }

  if (epicData) {
    // @ts-expect-error idk what this means dude
    mappedEpics = epicData

    for (const epic of mappedEpics) {
      const { total, error } = await listEstimations({ epicId: epic.uuid, userId: user.id })

      if (error) {
        errors.push(...error)
      }

      if (total === 0) {
        epic.userEstimationStatus = EstimationStatus.NOT_STARTED
      } else if (total !== epic.story_count) {
        epic.userEstimationStatus = EstimationStatus.IN_PROGRESS
      } else {
        epic.userEstimationStatus = EstimationStatus.COMPLETE
      }
    }
  }

  return { data: mappedEpics, error: errors.length > 0 ? errors : null }
}

export { listEpics }
