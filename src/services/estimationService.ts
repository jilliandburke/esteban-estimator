import { supabase } from '@/lib/supabaseClient'

export type ListEstimationsProps = {
  userId?: string
  epicId?: string
  storyId?: string
}

const listEstimations = async (props: ListEstimationsProps) => {
  const errors: Error[] = []
  const { userId, epicId, storyId } = props

  // Build query
  const query = supabase.from('estimations').select('*', { count: 'exact', head: false })

  if (userId) {
    query.eq('user_id', userId)
  }

  if (epicId) {
    query.eq('epic_id', epicId)
  }

  if (storyId) {
    query.eq('story_id', storyId)
  }

  // Run query
  const { data, count, error } = await query

  if (error) {
    errors.push(error)
  }

  return { data, total: count, error: errors.length > 0 ? errors : null }
}

export { listEstimations }
