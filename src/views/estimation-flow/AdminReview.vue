<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEstimationsStore, type Estimation, type Story } from '@/stores/estimations'
import { usePointScaleStore } from '@/stores/pointScales'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import VueMarkdown from 'vue-markdown-render'
import { format } from 'date-fns'

const route = useRoute()
const estimationStore = useEstimationsStore()
const pointScaleStore = usePointScaleStore()
const estimation = ref<Estimation | undefined>(undefined)
const toast = useToast()
const stories = ref<Story[]>([])
const expandedRows = ref({})
const loading = ref(estimation.value === undefined)

const estimationOptions = computed(() => {
  const pointList = ref(pointScaleStore.getPointScale?.scale?.split(', ').map(Number))

  if (pointList.value) {
    const mappedTeams = pointList.value.map((point) => {
      return { name: point, code: point }
    })

    return mappedTeams
  } else {
    return []
  }
})

onMounted(async () => {
  if (route.params.id) {
    estimation.value = await estimationStore.getEstimation(route.params.id as string)

    if (!estimation.value) {
      loading.value = false
      toast.add({ severity: 'error', summary: 'Error', detail: 'Estimation not found', life: 3000 })
    } else {
      const allStories = await estimationStore.getStoriesWithAllEstimations(estimation.value.uuid)

      if (allStories) {
        stories.value = allStories
      }

      loading.value = false
    }
  }
})

async function submitToShortcut() {
  const result = await estimationStore.submitEstimationToShortcut(stories.value)

  if (result && result !== null) {
    toast.add({ severity: 'danger', summary: 'Error', detail: `${result}`, life: 3000 })
    return
  }

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Estimations submitted',
    life: 3000,
  })
}

async function onCellEditComplete(event: any) {
  const { data, newValue } = event

  const result = await estimationStore.updateStoryPoints(data.uuid, newValue)

  if (result && result !== null) {
    toast.add({ severity: 'danger', summary: 'Error', detail: `${result}`, life: 3000 })
    return
  }

  const allStories = await estimationStore.getStoriesWithAllEstimations(data.epic_id)

  if (allStories) {
    stories.value = allStories
  }
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Story estimation updated',
    life: 3000,
  })
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
          <DataTable
            v-model:expandedRows="expandedRows"
            dataKey="uuid"
            :value="stories"
            size="large"
            editMode="cell"
            @cell-edit-complete="onCellEditComplete"
            tableStyle="min-width: 50rem"
          >
            <Column expander style="width: 5rem" />
            <Column field="shortcut_id" header="ID">
              <template #body="slotProps">
                <Tag :value="`sc-${slotProps.data.shortcut_id}`" severity="info"></Tag>
              </template>
            </Column>
            <Column field="title" header="Title"></Column>
            <Column field="description" header="Description"></Column>
            <Column field="story_points" header="Story Points" style="width: 20%">
              <template #editor="{ data, field }">
                <Select
                  v-model="data[field]"
                  name="storyPoints"
                  :options="estimationOptions"
                  optionLabel="name"
                  placeholder="Select points"
                  size="small"
                />
              </template>
            </Column>
            <template #expansion="slotProps">
              <div class="py-4 pl-14">
                <DataTable
                  :value="slotProps.data.estimations"
                  resizableColumns
                  columnResizeMode="expand"
                >
                  <Column field="profiles" header="Estimator">
                    <template #body="slotProps">
                      {{ slotProps.data?.profiles.full_name || '' }}
                    </template>
                  </Column>
                  <Column field="updated_at" header="Estimated At">
                    <template #body="slotProps">
                      {{ format(slotProps.data?.updated_at, 'LLL d, yyyy') }}
                    </template>
                  </Column>
                  <Column field="estimation" header="Estimation"> </Column>
                </DataTable>
              </div>
            </template>
          </DataTable>
        </Panel>
      </div>
    </div>
    <div
      class="fixed flex items-center justify-end p-5 w-full bottom-0 h-24 bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
    >
      <Button label="Submit to Shortcut" :loading="loading" @click="submitToShortcut()" />
    </div>
  </div>
</template>
