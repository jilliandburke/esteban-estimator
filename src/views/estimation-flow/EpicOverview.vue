<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEstimationsStore, type Estimation } from '@/stores/estimations'
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
</script>

<template>
  <div v-if="loading" class="flex justify-center mt-64">
    <ProgressSpinner />
  </div>
  <div v-else class="flex h-full p-10 mx-6 justify-center">
    <div class="flex flex-col gap-10 w-full max-w-7xl">
      <div class="flex flex-col gap-4">
        <h3 class="font-bold text-2xl pl-4">Epic Overview</h3>

        <Panel v-if="estimation">
          <template #header>
            <div class="flex flex-col w-full">
              <h4 class="font-bold text-xl mb-0">{{ estimation.title }}</h4>
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
            <Column header="ID">
              <template #body="slotProps">
                <Tag :value="`sc-${slotProps.data.shortcut_id}`" severity="info"></Tag>
              </template>
            </Column>
            <Column field="title" header="Title"></Column>
            <Column field="description" header="Description"></Column>
            <Column field="story_points" header="My Estimations">
              <template #body="slotProps">
                {{ slotProps.data?.estimation?.estimation || 0 }}
              </template>
            </Column>
          </DataTable>
        </Panel>
      </div>
    </div>
    <div
      v-if="estimation && estimation.stories && !isReview"
      class="absolute flex items-center justify-end p-5 w-full bottom-0 h-24 bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
    >
      <Button asChild v-slot="slotProps">
        <RouterLink
          :to="{
            name: 'storyView',
            params: { storyId: estimation.stories[0].uuid, epicId: estimation.uuid },
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
