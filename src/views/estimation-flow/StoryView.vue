<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEstimationsStore, type Story } from '@/stores/estimations'
import { usePointScaleStore } from '@/stores/pointScales'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import VueMarkdown from 'vue-markdown-render'

export type StoriesToEstimate = {
  order: number
  story: Story
  current: boolean
}

const route = useRoute()
const router = useRouter()
const estimationStore = useEstimationsStore()
const pointScaleStore = usePointScaleStore()
const stories = ref<StoriesToEstimate[]>([])
const story = ref<Story | undefined>(undefined)
const nextStory = ref<Story | undefined>(undefined)
const selectedEstimation = ref<number | undefined>(undefined)
const toast = useToast()
const estimationOptions = ref(pointScaleStore.getPointScale?.scale?.split(', ').map(Number))

onMounted(() => {
  let count = 1
  for (const story of estimationStore.stories) {
    stories.value.push({
      order: count,
      story,
      current: story.uuid === route.params.storyId,
    })

    count++
  }

  initializePage()
})

const storiesWithEstimations = computed(() => {
  return stories.value.filter((item) => item.story.estimation !== null).length
})

const readyForReview = computed(() => {
  return stories.value.length === storiesWithEstimations.value
})

const activeStory = computed(() => {
  return stories.value.find((item) => item.current)
})

const isLastStory = computed(() => {
  const lastStory = stories.value.reduce(function (prev, current) {
    return prev && prev.order > current.order ? prev : current
  })

  return activeStory?.value?.order === lastStory.order
})

function initializePage() {
  if (route.params.storyId) {
    const currentStoryForEstimation = stories.value.find((item) => item.current)

    if (!currentStoryForEstimation?.story) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Story not found', life: 3000 })
    } else {
      story.value = currentStoryForEstimation?.story
      selectedEstimation.value =
        currentStoryForEstimation?.story?.estimation?.estimation ?? undefined

      const nextStoryForEstimation = stories.value.find(
        (item) => item.order === currentStoryForEstimation?.order + 1,
      )

      nextStory.value = nextStoryForEstimation?.story
    }
  }
}

async function goToNextStory() {
  // Submit the estimation
  if (story.value && selectedEstimation.value) {
    const { error } = await estimationStore.submitStoryEstimation(
      story.value.uuid,
      story.value.epic_id,
      selectedEstimation.value,
    )

    // If it errors, show why and return
    if (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `Unable to submit estimation: ${error}`,
        life: 3000,
      })
      return
    }

    // If all stories are estimated, go to the review page
    if (isLastStory.value) {
      router.push({ path: `/estimation/${route.params.epicId}/review` })
      return
    }

    // Update ID in the route with the next story's ID and re-initialize the page
    router.push({ path: `/estimation/${route.params.epicId}/story/${nextStory?.value?.uuid}` })
  }
}

function goToPreviousStory() {
  const currentStory = stories.value.find((story) => story.current)
  if (currentStory) {
    if (currentStory.order - 1 === 0) {
      router.push({ path: `/estimation/${route.params.epicId}` })
    }

    const previousStory = stories.value.find((story) => story.order === currentStory.order - 1)

    if (previousStory) {
      router.push({ path: `/estimation/${route.params.epicId}/story/${previousStory.story.uuid}` })
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: "Couldn't find previous story, please try again.",
      life: 3000,
    })
    return
  }
}
</script>

<template>
  <div class="flex h-full p-10 mx-6 justify-center">
    <div class="flex gap-10 flex-0 min-w-7xl">
      <div class="flex flex-col gap-4 w-1/2">
        <h3 class="font-bold text-2xl pl-4">Story Estimation</h3>

        <Panel v-if="story">
          <template #header>
            <div class="flex flex-col w-full">
              <h4 class="font-bold text-xl mb-0">{{ story.title }}</h4>
              <Divider />
            </div>
          </template>
          <p class="-mt-5">
            <vue-markdown :source="story.description" :options="{ breaks: true }" />
          </p>
        </Panel>
      </div>
      <div class="flex flex-col gap-3 pl-4 mt-10 w-1/2">
        <h3 class="font-bold text-xl">Select your estimation</h3>
        <p>
          Use the radio buttons below to select your story point estimation for the card shown on
          the left. When you're done, click next to record the submission.
        </p>

        <label
          v-for="estimation in estimationOptions"
          :key="estimation"
          :for="`${estimation}`"
          class="flex rounded-lg border border-surface-200 dark:border-surface-700 p-2 gap-3 cursor-pointer items-center hover:bg-surface-100 hover:dark:bg-surface-900 focus:border-blue-800 has-checked:border-primary-400 max-w-1/3"
        >
          <RadioButton
            v-model="selectedEstimation"
            :inputId="`${estimation}`"
            name="dynamic"
            :value="estimation"
          />
          <p>{{ estimation }}</p>
        </label>
      </div>
    </div>
    <div
      v-if="story"
      class="absolute flex items-center justify-end p-5 w-full bottom-0 h-24 bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
    >
      <div class="flex gap-4">
        <Button severity="secondary" @click="goToPreviousStory"> Back </Button>
        <Button
          v-if="nextStory || (readyForReview && isLastStory)"
          @click="goToNextStory"
          :disabled="!selectedEstimation"
        >
          {{ nextStory ? 'Next' : 'Review' }}
        </Button>
      </div>
    </div>
  </div>
</template>
