<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEstimationsStore, type Estimation, EstimationStatus } from '@/stores/estimations'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import VueMarkdown from 'vue-markdown-render'

const route = useRoute()
const estimationStore = useEstimationsStore()
const estimation = ref<Estimation | undefined>(undefined)
const toast = useToast()
const isReview = ref(route.query.review === 'true')
const loading = ref(estimation.value === undefined)

onMounted(async () => {
  if (route.params.id) {
    estimation.value = await estimationStore.getEstimation(route.params.id as string)

    if (!estimation.value) {
      loading.value = false
      toast.add({ severity: 'error', summary: 'Error', detail: 'Estimation not found', life: 3000 })
    } else {
      loading.value = false
    }
  }
})

function continueOrStartEstimation() {
  const startingStoryId = estimation.value?.stories?.[0]?.uuid
  const estimationStatus = estimation.value?.userEstimationStatus
  const storiesWithoutEstimation = estimation?.value?.stories?.filter(
    (story) => !story.estimation || !story.estimation.estimation,
  )

  // If estimation is in progress, navigate to the first story without estimation
  if (estimationStatus === EstimationStatus.IN_PROGRESS && storiesWithoutEstimation) {
    return storiesWithoutEstimation[0].uuid
  } else {
    // If no stories have estimations, navigate to the first story
    return startingStoryId
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-center mt-64">
    <ProgressSpinner />
  </div>
  <div v-else class="flex h-full p-10 mx-6 justify-center mb-30">
    <div class="flex flex-col gap-10 w-full max-w-7xl">
      <div class="flex flex-col gap-4">
        <h3 class="font-bold text-2xl pl-4">Epic Overview</h3>

        <Panel v-if="estimation">
          <template #header>
            <div class="flex flex-col w-full">
              <h4 class="font-bold text-xl mb-0">
                {{ estimation.title }}
                <Button
                  as="a"
                  variant="link"
                  icon="pi pi-external-link"
                  :href="estimation.link"
                  target="_blank"
                  rel="noopener"
                  v-tooltip="{ value: 'View in Shortcut' }"
                />
              </h4>
              <Divider />
            </div>
          </template>
          <p class="-mt-5">
            <vue-markdown :source="estimation.description" :options="{ breaks: true }" />
          </p>
        </Panel>
      </div>

      <div class="flex flex-col gap-4">
        <Panel v-if="estimation && estimationStore.stories">
          <template #header>
            <div class="flex flex-col w-full -mb-6">
              <h4 class="font-bold text-xl mb-0">Stories</h4>
              <Divider />
            </div>
          </template>
          <DataTable :value="estimation.stories" size="large" tableStyle="min-width: 50rem">
            <Column header="ID" class="min-w-30">
              <template #body="slotProps">
                <Tag
                  :value="`sc-${slotProps.data.shortcut_id}`"
                  severity="info"
                  class="text-nowrap"
                ></Tag>
              </template>
            </Column>
            <Column field="title" header="Title">
              <template #body="slotProps">
                <span class="inline-flex items-center gap-2">
                  <RouterLink
                    :to="{
                      name: 'storyView',
                      params: { storyId: slotProps.data.uuid, epicId: estimation.uuid },
                    }"
                  >
                    <span class="underline mr-2">{{ slotProps.data.title }}</span>
                    <span class="inline-flex gap-1">
                      <Tag v-if="slotProps.data.blocked" icon="pi pi-ban" severity="danger"></Tag>
                      <Tag
                        v-if="slotProps.data.blocker"
                        icon="pi pi-exclamation-triangle"
                        severity="warning"
                      ></Tag>
                    </span>
                  </RouterLink>
                </span>
              </template>
            </Column>
            <Column field="description" header="Description" class="w-2/5 max-w-md">
              <template #body="slotProps">
                <ScrollPanel style="width: 100%; height: 50px">
                  <p class="m-0 text-ellipsis h-[3.125rem]">
                    <vue-markdown
                      :source="slotProps.data.description"
                      :options="{ breaks: true }"
                    />
                  </p>
                </ScrollPanel>
              </template>
            </Column>
            <Column field="story_points" header="My Estimations" class="w-40">
              <template #body="slotProps">
                {{ slotProps.data?.estimation?.estimation || 0 }}
              </template>
            </Column>
            <Column class="w-20 !text-end">
              <template #body="{ data }">
                <Button
                  as="a"
                  variant="link"
                  icon="pi pi-external-link"
                  :href="data.link"
                  target="_blank"
                  rel="noopener"
                  v-tooltip="{ value: 'View in Shortcut' }"
                />
              </template>
            </Column>
          </DataTable>
        </Panel>
      </div>
    </div>
    <div
      v-if="estimation && estimation.stories && !isReview"
      class="fixed flex items-center justify-end p-5 w-full bottom-0 h-24 bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 z-50"
    >
      <Button asChild v-slot="slotProps">
        <RouterLink
          :to="{
            name: 'storyView',
            params: { storyId: continueOrStartEstimation(), epicId: estimation.uuid },
          }"
          :class="slotProps.class"
          >{{
            estimation.userEstimationStatus === 'In Progress'
              ? 'Continue Estimation'
              : 'Start Estimation'
          }}</RouterLink
        >
      </Button>
    </div>
  </div>
</template>
