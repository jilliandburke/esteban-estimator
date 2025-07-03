<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useRolesStore } from '@/stores/roles'
import { useUserSessionStore } from '@/stores/userSession'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const teamsStore = useTeamsStore()
const rolesStore = useRolesStore()
const userSessionStore = useUserSessionStore()
const { showCreateUserDialog } = defineProps({
  showCreateUserDialog: {
    type: Boolean,
  },
})
const emit = defineEmits(['closeDialog'])
const passwordFormType = ref('password')
const visibilityIcon = ref('pi pi-eye')
const createUserError = ref<string | null>(null)
const loading = ref(false)

const resolver = zodResolver(
  z.object({
    name: z.string(),
    password: z
      .string()
      .min(3, { message: 'Minimum 3 characters.' })
      .refine((value) => /[a-z]/.test(value), {
        message: 'Must have a lowercase letter.',
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Must have an uppercase letter.',
      }),
    email: z.string().email(),
    team: z.object({
      name: z.string(),
      code: z.string(),
    }),
    role: z.object({
      name: z.string(),
      code: z.string(),
    }),
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

const roleOptions = computed(() => {
  const roleList = ref(rolesStore.getRoleList)

  if (roleList.value) {
    const mappedRoles = roleList.value.map((role) => {
      return { name: role.name, code: role.uuid }
    })

    return mappedRoles
  } else {
    return []
  }
})

function togglePasswordVisibility() {
  if (passwordFormType.value === 'password') {
    passwordFormType.value = 'text'
    visibilityIcon.value = 'pi pi-eye-slash'
  } else {
    passwordFormType.value = 'password'
    visibilityIcon.value = 'pi pi-eye'
  }
}

// @ts-expect-error idk typings for this yet
async function createUser({ valid, values }) {
  if (valid) {
    loading.value = true
    const result = await userSessionStore.createUser(values)

    if (result && result !== null) {
      createUserError.value = result
      loading.value = false
      return
    }

    emit('closeDialog')
    loading.value = false
    toast.add({ severity: 'success', summary: 'User successfully created', life: 3000 })
  }
}
</script>

<template>
  <Dialog
    :visible="showCreateUserDialog"
    modal
    header="Create User"
    :closable="false"
    :style="{ width: '25rem' }"
  >
    <Form v-slot="$form" :resolver @submit="createUser" class="flex flex-col gap-5 w-full">
      <Message v-if="createUserError" severity="error" icon="pi pi-times-circle">{{
        createUserError
      }}</Message>

      <!-- Name -->
      <div class="flex flex-col gap-2">
        <label for="name">Name</label>
        <InputText name="name" type="text" placeholder="Name" fluid />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
          $form.name.error?.message
        }}</Message>
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

      <!-- Password -->
      <div class="flex flex-col gap-1">
        <label for="name">Password</label>
        <InputGroup>
          <InputText name="password" :type="passwordFormType" placeholder="Password" fluid />
          <InputGroupAddon>
            <Button
              :icon="visibilityIcon"
              severity="secondary"
              @click="togglePasswordVisibility()"
            />
          </InputGroupAddon>
        </InputGroup>
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
          $form.password.error?.message
        }}</Message>
      </div>

      <!-- Team -->
      <div class="flex flex-col gap-1">
        <label for="theme">Team</label>
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

      <!-- Role -->
      <div class="flex flex-col gap-1">
        <label for="theme">Role</label>
        <Select
          name="role"
          :options="roleOptions"
          optionLabel="name"
          placeholder="Select a role"
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

      <div class="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="$emit('closeDialog')"
        ></Button>
        <Button type="submit" severity="success" label="Submit" :loading="loading" />
      </div>
    </Form>
  </Dialog>
</template>
