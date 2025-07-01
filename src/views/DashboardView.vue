<script setup lang="ts">
import { useUserSessionStore } from '@/stores/userSession'
import { useEstimationsStore } from '@/stores/estimations'
import AlertBanner from '@/components/AlertBanner.vue'
import VueMarkdown from 'vue-markdown-render'

const userSessionStore = useUserSessionStore()
const estimationsStore = useEstimationsStore()

userSessionStore.getUser()
</script>

<template>
  <AlertBanner
    v-if="userSessionStore.getUserError"
    :message="userSessionStore.getUserError"
    variant="danger"
  />

  <div class="flex flex-col h-full p-10 mx-6 gap-20">
    <div class="flex flex-col gap-4">
      <h3 class="font-bold text-2xl">Estimations Remaining</h3>

      <div class="flex gap-6" v-if="estimationsStore.remainingEstimations.length">
        <Card
          class="w-96 overflow-hidden"
          :pt="{ body: { class: 'flex flex-col justify-between h-full' } }"
          v-for="estimation in estimationsStore.remainingEstimations"
          :key="estimation.uuid"
        >
          <template #title>{{ estimation.title }}</template>
          <template #subtitle> {{ estimation.storyCount }} stories </template>
          <template #content>
            <ScrollPanel style="width: 100%; height: 150px">
              <p class="m-0 text-ellipsis">
                <vue-markdown :source="estimation.description" />
              </p>
            </ScrollPanel>
          </template>
          <template #footer>
            <div class="flex gap-4 mt-1 justify-end self-end">
              <Button asChild v-slot="slotProps">
                <RouterLink
                  :to="{ name: 'epicOverview', params: { id: estimation.uuid } }"
                  :class="slotProps.class"
                  >{{
                    estimation.userEstimationStatus === 'In Progress' ? 'Continue' : 'Estimate'
                  }}</RouterLink
                >
              </Button>
            </div>
          </template>
        </Card>
      </div>
      <div v-else class="flex items-center justify-center min-h-44 w-full">
        <h3 class="text-xl">Congratulations! You've completed all your estimations</h3>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h3 class="font-bold text-2xl">Completed Estimations</h3>

      <div class="flex gap-6">
        <Card
          class="w-96 overflow-hidden"
          :pt="{ body: { class: 'flex flex-col justify-between h-full' } }"
          v-for="estimation in estimationsStore.completedEstimations"
          :key="estimation.uuid"
        >
          <template #title>{{ estimation.title }}</template>
          <template #subtitle> {{ estimation.storyCount }} stories </template>
          <template #content>
            <ScrollPanel style="width: 100%; height: 150px">
              <p class="m-0 text-ellipsis">
                <vue-markdown :source="estimation.description" />
              </p>
            </ScrollPanel>
          </template>
          <template #footer>
            <div class="flex gap-4 mt-1 justify-end self-end">
              <Button asChild v-slot="slotProps">
                <RouterLink
                  :to="{
                    name: 'epicOverview',
                    params: { id: estimation.uuid },
                    query: { review: 'true' },
                  }"
                  :class="slotProps.class"
                  >Review</RouterLink
                >
              </Button>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
