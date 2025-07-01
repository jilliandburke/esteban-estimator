<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useTeamsStore } from '@/stores/teams'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const teamsStore = useTeamsStore()
const { showNewTeamDialog } = defineProps({
  showNewTeamDialog: {
    type: Boolean,
  },
})
const emit = defineEmits(['closeDialog'])

const resolver = zodResolver(
  z.object({
    name: z.string(),
  }),
)

async function inviteUser({ valid, values }) {
  console.log(values)
  if (valid) {
    const result = await teamsStore.createTeam(values.name)

    if (result && result !== null) {
      toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
      return
    }

    emit('closeDialog')
    toast.add({ severity: 'success', summary: 'User successfully invited', life: 3000 })
  }
}
</script>

<template>
  <Dialog
    :visible="showNewTeamDialog"
    modal
    header="Create Team"
    :closable="false"
    :style="{ width: '25rem' }"
  >
    <Form v-slot="$form" :resolver @submit="inviteUser" class="flex flex-col gap-5 w-full">
      <!-- Name -->
      <div class="flex flex-col gap-2">
        <label for="name">Name</label>
        <InputText name="name" type="text" placeholder="Name" fluid />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
          $form.name.error?.message
        }}</Message>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="$emit('closeDialog')"
        ></Button>
        <Button type="submit" severity="success" label="Submit" />
      </div>
    </Form>
  </Dialog>
</template>
