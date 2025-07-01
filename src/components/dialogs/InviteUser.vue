<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useUserSessionStore } from '@/stores/userSession'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const teamsStore = useTeamsStore()
const userSessionStore = useUserSessionStore()
const { showInviteUserDialog } = defineProps({
  showInviteUserDialog: {
    type: Boolean,
  },
})
const emit = defineEmits(['closeDialog'])

const resolver = zodResolver(
  z.object({
    name: z.string(),
    team: z.object({
      name: z.string(),
      code: z.string(),
    }),
    email: z.string().email(),
  }),
)

const teamOptions = computed(() => {
  const teamList = ref(teamsStore.getTeamList)

  if (teamList.value) {
    const mappedTeams = teamList.value.map((team) => {
      return { name: team.name, code: team.uuid }
    })

    return mappedTeams
  } else {
    return []
  }
})

async function inviteUser({ valid, values }) {
  console.log(values)
  if (valid) {
    const result = await userSessionStore.inviteUser(values)

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
    :visible="showInviteUserDialog"
    modal
    header="Invite User"
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

      <!-- Team to Estimate -->
      <div class="flex flex-col gap-1">
        <label for="theme">Team to Estimate</label>
        <Select
          name="team"
          :options="teamOptions"
          optionLabel="name"
          placeholder="Select a team"
          fluid
        />
        <Message
          v-if="$form.estimationTeam?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $form.estimationTeam?.error?.message }}</Message
        >
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-2 w-full">
        <label for="email1" class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
          >Email Address</label
        >
        <InputText name="email" type="email" placeholder="Email" fluid />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
          $form.email.error?.message
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
