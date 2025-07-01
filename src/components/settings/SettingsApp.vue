<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useSettingsStore } from '@/stores/settings'
import { usePointScaleStore } from '@/stores/pointScales'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { useClipboard } from '@vueuse/core'

const teamsStore = useTeamsStore()
const settingsStore = useSettingsStore()
const pointScaleStore = usePointScaleStore()
const toast = useToast()
const settings = ref(settingsStore.settings)
const webhookUrl = ref('https://bfsfpimsxdjjjcsspeal.supabase.co/functions/v1/shortcut-data-pull')
const apiKeyFormType = ref('password')
const visibilityIcon = ref('pi pi-eye')
const submittingEstimation = ref(false)
const submittingShortcut = ref(false)

const estimationResolver = zodResolver(
  z.object({
    scale: z.object({
      name: z.string(),
      code: z.string(),
    }),
    team: z.object({
      name: z.string(),
      code: z.string(),
    }),
    requireReview: z.array(z.coerce.boolean()),
  }),
)

const shortcutResolver = zodResolver(
  z.object({
    labelId: z.coerce.number(),
    apiKey: z.nullable(z.string()),
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

const scaleOptions = computed(() => {
  const pointScalesList = ref(pointScaleStore?.pointScales)

  if (pointScalesList.value) {
    const mappedTeams = pointScalesList.value.map((scale) => {
      return { name: scale.name, code: scale.uuid }
    })

    return mappedTeams
  } else {
    return []
  }
})

const estimationFormInitialValues = ref({
  scale: { name: settings?.value?.pointScale.name, code: settings?.value?.pointScale.uuid },
  team: { name: settings?.value?.team.name, code: settings?.value?.team.uuid },
  requireReview: [settings?.value?.requireReview.toString()],
})

const shortcutFormInitialValues = ref({
  labelId: settings?.value?.scLabelId,
  apiKey: settings?.value?.scApiKey,
})

const onEstimationFormSubmit = async ({ valid, values }) => {
  if (valid) {
    submittingEstimation.value = true

    const updateData = {
      pointScale: values.scale.code,
      team: values.team.code,
      requireReview: values.requireReview.length ? values.requireReview[0] : false,
    }

    const result = await settingsStore.updateSettings(updateData)

    if (result && result !== null) {
      submittingEstimation.value = false
      toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
      return
    }

    submittingEstimation.value = false
    toast.add({ severity: 'success', summary: 'Estimation details updated.', life: 3000 })
  }
}

const onShortcutFormSubmit = async ({ valid, values }) => {
  if (valid) {
    submittingShortcut.value = true

    const updateData = {
      labelId: values.labelId,
      apiKey: values.apiKey,
    }

    const result = await settingsStore.updateSettings(updateData)

    if (result && result !== null) {
      submittingShortcut.value = false
      toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
      return
    }

    submittingShortcut.value = false
    toast.add({ severity: 'success', summary: 'Shortcut details updated', life: 3000 })
  }
}

function copyToClipboard() {
  const { copy, copied } = useClipboard()

  copy(webhookUrl.value)

  if (copied) {
    toast.add({ severity: 'success', summary: 'URL copied to clipboard', life: 3000 })
  }
}

function toggleApiKeyVisibility() {
  if (apiKeyFormType.value === 'password') {
    apiKeyFormType.value = 'text'
    visibilityIcon.value = 'pi pi-eye-slash'
  } else {
    apiKeyFormType.value = 'password'
    visibilityIcon.value = 'pi pi-eye'
  }
}
</script>

<template>
  <div class="flex p-6 gap-20">
    <div class="flex flex-col flex-wrap w-full gap-14">
      <Form
        v-slot="$form"
        :initialValues="estimationFormInitialValues"
        :resolver="estimationResolver"
        @submit="onEstimationFormSubmit"
        class="flex flex-col gap-4 w-full max-w-1/2"
      >
        <h3 class="font-bold text-xl">Estimation</h3>
        <!-- Point Scale -->
        <div class="flex flex-col gap-1">
          <label for="theme">Point Scale</label>
          <Select
            name="scale"
            :options="scaleOptions"
            optionLabel="name"
            placeholder="Select a scale"
            :disabled="submittingEstimation"
            fluid
          />
          <Message
            v-if="$form.estimationScale?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.estimationScale?.error?.message }}</Message
          >
        </div>

        <!-- Team to Estimate -->
        <div class="flex flex-col gap-1">
          <label for="theme">Team to Estimate</label>
          <Select
            name="team"
            :options="teamOptions"
            optionLabel="name"
            placeholder="Select a team"
            :disabled="submittingEstimation"
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

        <!-- Estimation Review Required -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-3 items-center">
            <!-- <Checkbox name="reviewRequired" inputId="reviewRequired" value="true" /> -->
            <Checkbox
              name="requireReview"
              inputId="requireReview"
              value="true"
              :disabled="submittingEstimation"
            />
            <label for="requireReview"> Require a final review </label>
          </div>
          <Message size="small" severity="secondary" variant="simple"
            >Determines whether the admin will need to review the final estimation results before
            syncing the SP values to Shortcut</Message
          >
        </div>

        <Button
          type="submit"
          severity="success"
          label="Save Changes"
          :loading="submittingEstimation"
          class="w-1/3 mt-6"
        />
      </Form>

      <div class="flex w-full gap-20">
        <Form
          v-slot="$form"
          :initialValues="shortcutFormInitialValues"
          :resolver="shortcutResolver"
          @submit="onShortcutFormSubmit"
          class="flex flex-col gap-4 w-full max-w-1/2"
        >
          <h3 class="font-bold text-xl">Shortcut</h3>
          <!-- Estimation Shortcut Label ID -->
          <div class="flex flex-col gap-1">
            <label for="name">Label ID</label>
            <InputText
              name="labelId"
              type="number"
              placeholder="Label ID"
              :disabled="submittingShortcut"
              fluid
            />
            <Message size="small" severity="secondary" variant="simple"
              >This can be found in the URL of the label on Shortcut</Message
            >
            <Message v-if="$form.labelId?.invalid" severity="error" size="small" variant="simple">{{
              $form.labelId.error?.message
            }}</Message>
          </div>

          <!--Shortcut API Key -->
          <div class="flex flex-col gap-1">
            <label for="name">API Key</label>
            <InputGroup>
              <InputText
                name="apiKey"
                :type="apiKeyFormType"
                placeholder="API Key"
                :disabled="submittingShortcut"
                fluid
              />
              <InputGroupAddon>
                <!-- TODO - implement show/hide -->
                <Button
                  :icon="visibilityIcon"
                  severity="secondary"
                  @click="toggleApiKeyVisibility"
                />
              </InputGroupAddon>
            </InputGroup>
            <Message v-if="$form.apiKey?.invalid" severity="error" size="small" variant="simple">{{
              $form.apiKey.error?.message
            }}</Message>
          </div>

          <Button
            type="submit"
            severity="success"
            label="Save Changes"
            :loading="submittingShortcut"
            class="w-1/3 mt-6"
          />
        </Form>

        <!-- Allows user to copy Shortcut Webhook URL -->
        <div class="flex flex-col gap-2 w-full max-w-1/2 mt-9.5">
          <label for="theme">Webhook URL</label>
          <InputGroup>
            <InputText placeholder="Webhook URL" :value="webhookUrl" disabled />
            <InputGroupAddon>
              <Button label="Copy" severity="secondary" @click="copyToClipboard" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </div>
  </div>
</template>
