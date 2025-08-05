import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from '@/stores/user'
import { type Story } from '@/stores/estimations'
import { listEstimations } from '@/services/estimationService'
import { listStoryLinks } from '@/services/storyLinkService'

const listStories = async (epicId: string) => {
  let mappedStories: Story[] = []
  const currentUser = useUserStore().currentUser
  const errors: Error[] = []

  if (!currentUser) {
    errors.push(new Error('User not authenticated'))
    return { data: [], total: 0, error: errors }
  }

  // Build query
  const query = supabase.from('stories').select('*', { count: 'exact', head: false })

  if (epicId) {
    query.eq('epic_id', epicId)
  }

  // Run query
  const { data, count, error } = await query

  if (error) {
    errors.push(error)
  }

  if (data) {
    // @ts-expect-error idk what this means dude
    mappedStories = data

    for (const story of mappedStories) {
      story.storyLinks = []

      // Get user's estimation for this story if present
      const { data: estimationData } = await listEstimations({
        userId: currentUser?.id as string,
        storyId: story.uuid,
      })

      // Get story links where this story is the subject
      const { data: subjectLinks } = await listStoryLinks({
        shortcutId: story.shortcut_id,
        type: 'subject',
      })

      // Get story links where this story is the object
      const { data: objectLinks } = await listStoryLinks({
        shortcutId: story.shortcut_id,
        type: 'object',
      })

      if (estimationData) {
        story.estimation = estimationData[0]
      }

      if (subjectLinks) {
        story.storyLinks.push(...subjectLinks)
      }

      if (objectLinks) {
        story.storyLinks.push(...objectLinks)
      }
    }
  }

  return { data: mappedStories, total: count, error: error }
}

const readStory = async (storyId: string) => {
  let mappedStory: Story
  const currentUser = useUserStore().currentUser
  const errors: Error[] = []

  if (!currentUser) {
    errors.push(new Error('User not authenticated'))
    return { data: {}, error: errors }
  }

  if (!storyId) {
    errors.push(new Error('Missing required parameter: storyId'))
    return { data: {}, error: errors }
  }

  // Build query
  const query = supabase.from('stories').select('*')

  console.log('readStory', storyId)
  query.eq('uuid', storyId).maybeSingle()

  // Run query
  const { data, error } = await query

  if (error) {
    errors.push(error)
  }

  if (data) {
    // @ts-expect-error idk what this means dude
    mappedStory = data
    mappedStory.storyLinks = []

    // Get user's estimation for this story if present
    const { data: estimationData } = await listEstimations({
      userId: currentUser?.id as string,
      storyId: storyId,
    })

    // Get story links where this story is the subject
    const { data: subjectLinks } = await listStoryLinks({
      shortcutId: mappedStory?.shortcut_id as string,
      type: 'subject',
    })

    // Get story links where this story is the object
    const { data: objectLinks } = await listStoryLinks({
      shortcutId: mappedStory?.shortcut_id as string,
      type: 'object',
    })

    if (estimationData && mappedStory) {
      mappedStory.estimation = estimationData[0]
    }

    if (subjectLinks) {
      mappedStory?.storyLinks.push(...subjectLinks)
    }

    if (objectLinks) {
      mappedStory?.storyLinks.push(...objectLinks)
    }
  }

  // @ts-expect-error shhhhh
  return { data: mappedStory, error: errors.length > 0 ? errors : null }
}

export { listStories, readStory }
