import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from '@/stores/user'
import { useTeamsStore } from '@/stores/teams'
import { useRouter } from 'vue-router'
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js'

export type Story = {
  id: number
  uuid: string
  title: string | null
  description: string | null
  shortcut_id: string | null
  story_points: number | null
  epic_id: string
  estimation?: {
    id: number
    uuid: string
    user_id: string
    story_id: string
    estimation: number | null
    created_at: string
    updated_at: string
  }
  estimations?: {
    id: number
    uuid: string
    user_id: string
    story_id: string
    estimation: number | null
    profiles?: {
      full_name: string | null
    }
    created_at: string
    updated_at: string
  }[]
  created_at: string
  updated_at: string
}

export type Epic = {
  id: number
  uuid: string
  title: string | null
  description: string | null
  shortcut_id: string | null
  link: string | null
  team_id: string | null
  completed_estimation_at: string | null
  created_at: string
  updated_at: string
}

export type Estimation = {
  id: number
  uuid: string
  title: string | null
  description: string | null
  shortcut_id: string | null
  link: string | null
  team_id: string | null
  team_completed_estimation_at: string | null
  userEstimationStatus?: EstimationStatus
  stories?: Story[]
  storyCount?: number
  created_at: string
  updated_at: string
}

export enum EstimationStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETE = 'Complete',
}

export const useEstimationsStore = defineStore(
  'estimations',
  () => {
    const estimations = ref<Estimation[]>([])
    const stories = ref<Story[]>([])
    const getEstimationsError = ref<string | null>(null)
    const router = useRouter()
    const userStore = useUserStore()

    const remainingEstimations = computed(() => {
      return estimations.value.filter(
        (item) => item.userEstimationStatus !== EstimationStatus.COMPLETE,
      )
    })

    const completedEstimations = computed(() => {
      return estimations.value.filter(
        (item) => item.userEstimationStatus === EstimationStatus.COMPLETE,
      )
    })

    const allEstimations = computed(() => {
      return estimations.value
    })

    async function getEstimations() {
      let error
      let mappedEstimations: Estimation[] = []
      const user = userStore.currentUser

      if (!user) return

      const teamIds = [...new Set(user.teams.map((team) => team.uuid))]

      if (!teamIds) return

      const { data: epicData, error: epicError } = await supabase
        .from('epics')
        .select()
        .in('team_id', teamIds as string[])
        .order('updated_at', { ascending: false })

      if (epicError) error = epicError

      if (epicData) {
        mappedEstimations = epicData

        for (const estimation of mappedEstimations) {
          const stories = await getStories(estimation.uuid)

          const completedEstimation = await hasUserCompletedEstimation(estimation.uuid)

          estimation.userEstimationStatus = completedEstimation ?? EstimationStatus.NOT_STARTED

          //@ts-expect-error idk what this means dude
          if (stories) estimation.stories = stories
        }

        mappedEstimations.map(
          (estimation: Estimation) => (estimation.storyCount = estimation?.stories?.length),
        )
      }

      if (error) {
        getEstimationsError.value = error.message
        return
      }

      estimations.value = mappedEstimations
    }

    async function hasUserCompletedEstimation(epicId: string) {
      if (!epicId) {
        console.log('No Epic ID supplied')
        return
      }

      const storyCount = await getStoryCount(epicId)
      const user = userStore.currentUser
      const { count, error } = await supabase
        .from('estimations')
        .select('*', { count: 'exact', head: true })
        .eq('epic_id', epicId)
        .eq('user_id', user?.id as string)

      if (error) {
        console.log('Error confirming user estimation count')
        return
      }

      if (count === 0) {
        return EstimationStatus.NOT_STARTED
      } else if (count !== storyCount) {
        return EstimationStatus.IN_PROGRESS
      } else {
        return EstimationStatus.COMPLETE
      }
    }

    async function getEstimation(uuid: string) {
      let mappedEstimation: Estimation | undefined = undefined

      const { data: epicData, error: epicError } = await supabase
        .from('epics')
        .select()
        .eq('uuid', uuid)
        .single()

      if (epicError) {
        getEstimationsError.value = epicError.message
        return
      }

      if (epicData) {
        mappedEstimation = epicData

        const completedEstimation = await hasUserCompletedEstimation(epicData.uuid)

        mappedEstimation.userEstimationStatus = completedEstimation ?? EstimationStatus.NOT_STARTED

        const stories = await getStories(epicData.uuid)

        // @ts-expect-error idk what this means dude
        if (stories) mappedEstimation.stories = stories

        if (mappedEstimation?.stories)
          mappedEstimation.storyCount = mappedEstimation?.stories.length
      }

      return mappedEstimation
    }

    async function getStories(epicId: string) {
      const { data, error } = await supabase.from('stories').select().eq('epic_id', epicId)

      if (error) {
        return
      }

      const user = userStore.currentUser

      if (!user) return { data: null, error: 'No user found' }

      const mappedStories: Story[] = data

      if (mappedStories) {
        for (const story of mappedStories) {
          const { data } = await supabase
            .from('estimations')
            .select()
            .eq('story_id', story.uuid)
            .eq('user_id', user.id)
            .maybeSingle()

          if (data) {
            story.estimation = data
          }
        }
      }

      stories.value = mappedStories
      return mappedStories
    }

    async function getStoriesWithAllEstimations(epicId: string) {
      const { data, error } = await supabase
        .from('stories')
        .select()
        .eq('epic_id', epicId)
        .order('shortcut_id', { ascending: true })

      if (error) {
        return []
      }

      const mappedStories: Story[] = data

      if (mappedStories) {
        for (const story of mappedStories) {
          const { data } = await supabase
            .from('estimations')
            .select('*, profiles (full_name, avatar_url)')
            .eq('story_id', story.uuid)

          if (data) {
            story.estimations = data
          }
        }
      }

      return mappedStories
    }

    async function getStoryCount(epicId: string) {
      const { count, error } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('epic_id', epicId)

      if (error) return

      return count
    }

    async function submitStoryEstimation(storyId: string, epicId: string, estimation: number) {
      const user = userStore.currentUser

      if (!user) return { data: null, error: 'No user found' }

      // Get the team_id from the epic to use when updating the estimation
      const { data: teamIdData, error: teamError } = await supabase
        .from('epics')
        .select('team_id')
        .eq('uuid', epicId)
        .maybeSingle()

      if (teamError) return { data: null, error: teamError }
      if (!teamIdData) return { data: null, error: 'No team_id found' }

      // Update estimation to confirm it's been submitted
      const { data, error } = await supabase
        .from('estimations')
        .upsert(
          {
            user_id: user.id,
            story_id: storyId,
            epic_id: epicId,
            team_id: teamIdData?.team_id,
            estimation,
            estimation_submitted: true,
          },
          { onConflict: 'story_id, user_id', ignoreDuplicates: false },
        )
        .select()
        .maybeSingle()

      // Add estimation to story in stories array
      if (data) {
        stories.value.map((story) => {
          if (story.uuid === storyId) {
            story.estimation = data
          }
        })
      }

      // TODO - If review isn't required run an edge function to update shortcut

      return { data, error }
    }

    async function finishEstimation(epicId: string) {
      // Check if all members of the team have submitted their estimations
      const hasBeenCompleted = await useTeamsStore().hasTeamCompletedEstimation(epicId)

      if (!hasBeenCompleted) {
        // Just exit back to dash without calculating averages
        router.push({ path: '/' })
      } else {
        // If we have all the estimations we expect, start getting the averages

        // Collect team to get all estimations by team
        const { data: team, error: teamError } = await useTeamsStore().getTeamByEpicId(epicId)

        if (teamError) {
          console.log('Error getting team', teamError)
          return
        }
        if (!team) {
          console.log('No team found')
          return
        }

        // Get all estimations done by this team for this epic
        const { data: estimations, error } = await supabase
          .from('estimations')
          .select()
          .eq('epic_id', epicId)
          .eq('team_id', team.uuid)
          .order('story_id')

        if (error) {
          console.log('Error getting estimations', error)
          return
        }

        // Get unique story IDs so we can iterate on the estimations by storyId to collect estimation
        // averages
        const uniqueStoryIds = [...new Set(estimations.map((item) => item.story_id))]

        for (const storyId of uniqueStoryIds) {
          const stories = estimations.filter((item) => item.story_id === storyId)
          const sum = stories.reduce((prev, story) => {
            return prev + story.estimation
          }, 0)
          const average = Math.round(sum / stories.length)

          const { error: storyUpdateError } = await supabase
            .from('stories')
            .update({ story_points: average })
            .eq('uuid', storyId)
            .select()

          if (storyUpdateError) {
            console.log('Error saving average', storyUpdateError)
            return
          }
        }

        const { data: epicUpdateData, error: epicUpdateError } = await supabase
          .from('epics')
          .update({ team_completed_estimation_at: new Date().toISOString() })
          .eq('uuid', epicId)
          .select()

        if (epicUpdateError) {
          console.log('Error updating epic', epicUpdateError)
        } else {
          let createError = null

          const adminList = userStore.getUsersWithRole('admin')

          const { error } = await supabase.functions.invoke('slack-notifier', {
            body: {
              recipients: adminList?.map((user) => user.email),
              recipientType: 'email',
              message: `The estimation for epic *${epicUpdateData[0].title}* has been completed by the team!`,
              button: {
                text: 'Review Estimation',
                url: `${import.meta.env.VITE_SITE_URL}/estimation/${epicId}/admin-review`,
                style: 'primary',
              },
            },
            method: 'POST',
          })

          if (error) {
            if (error instanceof FunctionsHttpError) {
              const errorMessage = await error.context.json()
              createError = errorMessage.error
            } else if (error instanceof FunctionsRelayError) {
              createError = error.message
            } else if (error instanceof FunctionsFetchError) {
              createError = error.message
            }

            return createError
          }
        }

        router.push({ path: '/' })
      }
    }

    async function updateStoryPoints(storyId: string, points: { name: number; code: number }) {
      if (points && storyId) {
        let updateError = null

        const { error } = await supabase
          .from('stories')
          .update({ story_points: points.code })
          .eq('uuid', storyId)

        if (error) {
          updateError = `Failed to update user: ${error}`
          return updateError
        }

        return updateError
      }
    }

    async function submitEstimationToShortcut(stories: Story[]) {
      if (stories) {
        let submissionError = null

        const { error } = await supabase.functions.invoke('shortcut-data-push', {
          body: stories,
        })

        if (error) {
          if (error instanceof FunctionsHttpError) {
            const errorMessage = await error.context.json()
            submissionError = errorMessage.error
          } else if (error instanceof FunctionsRelayError) {
            submissionError = error.message
          } else if (error instanceof FunctionsFetchError) {
            submissionError = error.message
          }

          return submissionError
        }

        return submissionError
      }
    }

    return {
      getEstimations,
      remainingEstimations,
      completedEstimations,
      allEstimations,
      estimations,
      stories,
      getEstimationsError,
      getEstimation,
      getStoryCount,
      getStoriesWithAllEstimations,
      hasUserCompletedEstimation,
      submitStoryEstimation,
      finishEstimation,
      updateStoryPoints,
      submitEstimationToShortcut,
    }
  },
  { persist: true },
)
