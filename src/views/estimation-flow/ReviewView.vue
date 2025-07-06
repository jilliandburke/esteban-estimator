<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEstimationsStore, type Story } from '@/stores/estimations'
import VueMarkdown from 'vue-markdown-render'

const route = useRoute()
const router = useRouter()
const estimationStore = useEstimationsStore()
const stories = ref<Story[]>(estimationStore.stories)

function goToPreviousStory() {
  router.push({
    path: `/estimation/${route.params.epicId}/story/${
      stories.value[stories.value.length - 1].uuid
    }`,
  })

  return
}
</script>

<template>
  <div class="flex h-full p-10 mx-6 justify-center mb-30">
    <div class="flex flex-col gap-10 w-full max-w-7xl">
      <div class="flex flex-col gap-4">
        <h3 class="font-bold text-2xl pl-4">Review Estimates</h3>
        <Panel v-if="stories">
          <template #header>
            <div class="flex flex-col w-full -mb-6">
              <h4 class="font-bold text-xl mb-0">Stories</h4>
              <Divider />
            </div>
          </template>
          <DataTable :value="stories" size="large" tableStyle="min-width: 50rem">
            <Column header="ID" class="min-w-30">
              <template #body="slotProps">
                <Tag :value="`sc-${slotProps.data.shortcut_id}`" severity="info"></Tag>
              </template>
            </Column>
            <Column field="title" header="Title">
              <template #body="slotProps">
                <span class="inline-flex items-center gap-2">
                  <RouterLink
                    :to="{
                      name: 'storyView',
                      params: { storyId: slotProps.data.uuid, epicId: slotProps.data.uuid },
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
            <Column field="description" header="Description" class="w-2/5">
              <template #body="slotProps">
                <ScrollPanel style="width: 100%; height: 50px">
                  <p class="m-0 text-ellipsis h-[3.125rem]">
                    <vue-markdown
                      :source="slotProps.data.description.slice(13)"
                      :options="{ breaks: true }"
                    />
                  </p>
                </ScrollPanel>
              </template>
            </Column>
            <Column field="story_points" header="My Estimations" class="w-40">
              <template #body="slotProps">
                {{ slotProps.data.estimation.estimation || 0 }}
              </template>
            </Column>
          </DataTable>
        </Panel>
      </div>
    </div>
    <div
      class="fixed flex items-center justify-end p-5 w-full bottom-0 h-24 bg-surface-0 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
    >
      <div class="flex gap-4">
        <Button severity="secondary" @click="goToPreviousStory"> Back </Button>
        <Button @click="estimationStore.finishEstimation(stories[0].epic_id)"> Submit </Button>
      </div>
    </div>
  </div>
</template>
