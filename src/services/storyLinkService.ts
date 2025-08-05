import { supabase } from '@/lib/supabaseClient'

export type ListEstimationsProps = {
  shortcutId: string
  type: 'subject' | 'object'
}

const listStoryLinks = async (props: ListEstimationsProps) => {
  const errors: Error[] = []
  const { shortcutId, type } = props

  if (!shortcutId || !type) {
    errors.push(new Error('Missing required parameters: shortcutId and type'))
    return { data: [], total: 0, error: errors }
  }

  // Build query
  const query = supabase.from('story_links').select('*', { count: 'exact', head: false })

  if (type === 'subject') {
    query.eq('subject_id', shortcutId)
    query.eq('type', 'subject')
  }

  if (type === 'object') {
    query.eq('object_id', shortcutId)
    query.eq('type', 'object')
  }

  // Run query
  const { data, count, error } = await query

  if (error) {
    errors.push(error)
  }

  return { data, total: count, error: errors.length > 0 ? errors : null }
}

export { listStoryLinks }
