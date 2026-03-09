<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEstimationsStore, type Story, type StoryLink } from '@/stores/estimations'
import { usePointScaleStore } from '@/stores/pointScales'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import VueMarkdown from 'vue-markdown-render'
import RadioCard from '@/components/RadioCard.vue'

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

const estimationOptions = computed(() => {
  const scale = pointScaleStore.getPointScale?.scale
  if (!scale) return []

  try {
    // Parse the JSON array string
    const parsed = JSON.parse(scale)
    // Convert to numbers, filtering out any non-numeric values
    return parsed.map(Number).filter((n: number) => !isNaN(n))
  } catch (e) {
    console.error('Failed to parse point scale:', e)
    return []
  }
})

onMounted(() => {
  if (estimationStore.stories.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No stories loaded. Please navigate from the epic overview page.',
      life: 5000,
    })
    return
  }

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

function getStoryByShortcutId(shortcutId: string) {
  return stories.value.find((item) => item.story.shortcut_id === shortcutId)?.story
}

function isBlocked(item: StoryLink, storyId: string) {
  return item.object_id === storyId && item.type === 'object'
}

async function initializePage() {
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
    <div class="flex flex-col md:flex-row md:gap-10 w-full max-w-7xl mb-30">
      <div class="flex flex-col gap-4 md:w-2/3">
        <h3 class="font-bold text-2xl pl-4">Story Overview</h3>
        <Panel v-if="story">
          <template #header>
            <div class="flex flex-col w-full">
              <h4 class="font-bold text-xl mb-0">
                {{ story.title }}
                <Button
                  as="a"
                  variant="link"
                  icon="pi pi-external-link"
                  :href="story.link"
                  target="_blank"
                  rel="noopener"
                  v-tooltip="{ value: 'View in Shortcut' }"
                />
              </h4>
              <Divider />
            </div>
          </template>
          <p class="-mt-5">
            <vue-markdown :source="story.description" :options="{ breaks: true, html: true }" />
          </p>
          <div class="flex flex-col w-full mt-10">
            <h4 class="font-bold mb-0">Story Relationships</h4>
            <Divider />

            <!-- This code is horrendous I'm so sorry to whoever finds themselves here -->
            <DataView :value="story.storyLinks" v-if="story.storyLinks?.length !== 0">
              <template #list="slotProps">
                <div class="flex flex-col gap-2 px-3">
                  <div v-for="(item, index) in slotProps.items" :key="index">
                    <div class="flex gap-4 justify-between w-full items-start">
                      <div class="flex items-start gap-3">
                        <Tag
                          :severity="isBlocked(item, story.shortcut_id) ? 'danger' : 'warning'"
                          class="flex items-center"
                        >
                          <i
                            v-if="isBlocked(item, story.shortcut_id)"
                            class="pi pi-ban text-3xl font-bold"
                          ></i>
                          <i v-else class="pi pi-exclamation-triangle text-3xl font-bold"></i>
                        </Tag>
                        <div>
                          {{ isBlocked(item, story.shortcut_id) ? 'Blocked by' : 'Blocks' }}
                          <RouterLink
                            v-if="
                              getStoryByShortcutId(
                                isBlocked(item, story.shortcut_id)
                                  ? item.subject_id
                                  : item.object_id,
                              )
                            "
                            :to="{
                              name: 'storyView',
                              params: {
                                storyId: getStoryByShortcutId(
                                  isBlocked(item, story.shortcut_id)
                                    ? item.subject_id
                                    : item.object_id,
                                )?.uuid,
                                epicId: getStoryByShortcutId(
                                  isBlocked(item, story.shortcut_id)
                                    ? item.subject_id
                                    : item.object_id,
                                )?.epic_id,
                              },
                            }"
                            class="text-surface-300 hover:underline"
                          >
                            {{
                              getStoryByShortcutId(
                                isBlocked(item, story.shortcut_id)
                                  ? item.subject_id
                                  : item.object_id,
                              )?.title
                            }}
                          </RouterLink>
                        </div>
                      </div>
                      <Tag :value="`sc-${item.object_id}`" severity="info" class="min-w-16"></Tag>
                    </div>
                  </div>
                </div>
              </template>
            </DataView>
            <div v-else>No relationships</div>
          </div>
        </Panel>
      </div>
      <div class="flex flex-col gap-3 md:pl-4 mt-10 md:w-1/3">
        <h3 class="font-bold text-xl">Select your estimation</h3>
        <p>
          Use the radio buttons below to select your story point estimation for the card shown on
          the left. When you're done, click next to record the submission.
        </p>

        <RadioCard
          v-for="estimation in estimationOptions"
          :key="estimation"
          v-model="selectedEstimation"
          :input-id="`${estimation}`"
          name="estimation"
          :value="estimation"
        >
          <p class="text-lg font-medium">{{ estimation }}</p>
        </RadioCard>
      </div>
    </div>
    <div
      v-if="story"
      class="fixed flex items-center justify-end p-5 w-full bottom-0 h-24 bg-[var(--color-surface)] border-t-2 border-(--color-border)"
    >
      <div class="flex justify-between w-full">
        <div>
          <Button
            as="router-link"
            severity="secondary"
            icon="pi pi-angle-left"
            label="Back to Epic"
            :to="{ name: 'epicOverview', params: { id: route.params.epicId } }"
          />
        </div>
        <div class="flex items-center gap-4">
          <Button severity="secondary" @click="goToPreviousStory"> Previous </Button>
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
  </div>
</template>
