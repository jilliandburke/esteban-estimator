<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import { darkThemes, lightThemes, type DarkThemeKey, type LightThemeKey } from '@/config/themes'

const userStore = useUserStore()
const toast = useToast()
const submittingDisplaySettings = ref(false)
const submittingLoginSettings = ref(false)
const uploading = ref(false)

const displaySettingsResolver = zodResolver(
  z.object({
    name: z.string(),
    theme: z.object({
      name: z.string(),
      code: z.string(),
    }),
    darkTheme: z
      .object({
        name: z.string(),
        code: z.string(),
      })
      .optional()
      .nullable(),
    lightTheme: z
      .object({
        name: z.string(),
        code: z.string(),
      })
      .optional()
      .nullable(),
  }),
)

const loginSettingsResolver = zodResolver(
  z
    .object({
      email: z.string().email(),
      password: z
        .string()
        .min(3, { message: 'Minimum 3 characters.' })
        .refine((value) => /[a-z]/.test(value), {
          message: 'Must have a lowercase letter.',
        })
        .refine((value) => /[A-Z]/.test(value), {
          message: 'Must have an uppercase letter.',
        }),
      passwordConfirmation: z
        .string()
        .min(3, { message: 'Minimum 3 characters.' })
        .refine((value) => /[a-z]/.test(value), {
          message: 'Must have a lowercase letter.',
        })
        .refine((value) => /[A-Z]/.test(value), {
          message: 'Must have an uppercase letter.',
        }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation'],
    }),
)

const themeOptions = ref<{ name: string; code: string }[]>([
  { name: 'System', code: 'system' },
  { name: 'Light', code: 'light' },
  { name: 'Dark', code: 'dark' },
])

const darkThemeOptions = ref<{ name: string; code: DarkThemeKey }[]>([
  { name: darkThemes.midnightSage.name, code: 'midnightSage' },
  { name: darkThemes.deepForest.name, code: 'deepForest' },
  { name: darkThemes.slateLime.name, code: 'slateLime' },
  { name: darkThemes.neonNoir.name, code: 'neonNoir' },
])

const lightThemeOptions = ref<{ name: string; code: LightThemeKey }[]>([
  { name: lightThemes.mintFresh.name, code: 'mintFresh' },
  { name: lightThemes.springMeadow.name, code: 'springMeadow' },
  { name: lightThemes.limelight.name, code: 'limelight' },
  { name: lightThemes.forestLight.name, code: 'forestLight' },
])

const defaultTheme = computed((): { name: string; code: string } | undefined => {
  if (userStore.currentUser) {
    return themeOptions.value.find((theme) => theme.code === userStore?.currentUser?.theme)
  } else {
    return themeOptions.value[0]
  }
})

const defaultDarkTheme = computed(() => {
  if (userStore.currentUser && userStore.currentUser.dark_theme) {
    return darkThemeOptions.value.find((theme) => theme.code === userStore.currentUser?.dark_theme)
  } else {
    // Default to Midnight Sage if no theme is set
    return darkThemeOptions.value[0] // This is Midnight Sage
  }
})

const defaultLightTheme = computed(() => {
  if (userStore.currentUser && userStore.currentUser.light_theme) {
    return lightThemeOptions.value.find(
      (theme) => theme.code === userStore.currentUser?.light_theme,
    )
  } else {
    // Default to Mint Fresh if no theme is set
    return lightThemeOptions.value[0] // This is Mint Fresh
  }
})

const selectedTheme = ref<{ name: string; code: string } | undefined>(defaultTheme.value)
const showDarkThemeSelector = computed(() => {
  return selectedTheme.value?.code === 'dark' || selectedTheme.value?.code === 'system'
})

const showLightThemeSelector = computed(() => {
  return selectedTheme.value?.code === 'light' || selectedTheme.value?.code === 'system'
})

const displayInitialValues = ref({
  name: userStore?.currentUser?.full_name,
  theme: defaultTheme.value,
  darkTheme: defaultDarkTheme.value,
  lightTheme: defaultLightTheme.value,
})

const loginInitialValues = ref({
  email: userStore?.currentUser?.email,
})

// @ts-expect-error idk typings for this yet
const submitDisplaySettings = async ({ valid, values }) => {
  if (valid) {
    submittingDisplaySettings.value = true

    const userData: any = {
      name: values.name,
      theme: values.theme.code,
    }

    // Always set dark_theme (default to midnightSage if none selected)
    userData.dark_theme = values.darkTheme?.code || 'midnightSage'

    // Always set light_theme (default to mintFresh if none selected)
    userData.light_theme = values.lightTheme?.code || 'mintFresh'

    const result = await userStore.updateUser(userData)

    if (result && result !== null) {
      submittingDisplaySettings.value = false
      toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
      return
    }

    submittingDisplaySettings.value = false
    toast.add({ severity: 'success', summary: 'User succssfully updated!', life: 3000 })
  }
}

// @ts-expect-error idk typings for this yet
const submitLoginSettings = async ({ valid, values }) => {
  if (valid) {
    submittingLoginSettings.value = true
    let userData

    // Only need password here because the form won't submit if passwordConfirmation is invalid
    if (values.password) {
      userData = {
        password: values.password,
      }
    }

    if (values.email) {
      userData = {
        ...userData,
        email: values.email,
      }
    }

    if (userData) {
      const result = await userStore.updateUserAuth(userData)

      if (result && result !== null) {
        submittingLoginSettings.value = false
        toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
        return
      }

      submittingLoginSettings.value = false
      toast.add({ severity: 'success', summary: 'User succssfully updated!', life: 3000 })
    }
  }
}

const uploadAvatar = async (event: { files: any[] }) => {
  uploading.value = true
  const file = event.files[0]

  if (!file) {
    toast.add({ severity: 'error', summary: 'No file selected', life: 3000 })
    uploading.value = false
    return
  }

  try {
    const result = await userStore.uploadAvatar(file)

    if (result && result !== null) {
      toast.add({ severity: 'error', summary: 'Error', detail: `${result}`, life: 3000 })
      uploading.value = false
      return
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Avatar uploaded successfully!',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Success',
      detail: `Error uploading avatar: ${error}`,
      life: 3000,
    })
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row p-6 gap-10 w-full">
    <div class="flex flex-col flex-wrap w-full gap-14">
      <div class="flex w-full gap-20">
        <Form
          v-slot="$form"
          :initialValues="displayInitialValues"
          :resolver="displaySettingsResolver"
          @submit="submitDisplaySettings"
          class="flex flex-col gap-4 w-full md:w-1/2 lg:w-1/2"
        >
          <h3 class="font-bold text-xl">Display Settings</h3>

          <!-- Name -->
          <div class="flex flex-col gap-1">
            <label for="name">Name</label>
            <InputText
              name="name"
              type="text"
              placeholder="Name"
              :disabled="submittingDisplaySettings"
              autocomplete="off"
              fluid
            />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
              $form.name.error?.message
            }}</Message>
          </div>

          <!-- App Theme -->
          <div class="flex flex-col gap-1">
            <label for="theme">Theme</label>
            <Select
              name="theme"
              :options="themeOptions"
              optionLabel="name"
              placeholder="Select a theme"
              :disabled="submittingDisplaySettings"
              v-model="selectedTheme"
              fluid
            />
            <Message v-if="$form.theme?.invalid" severity="error" size="small" variant="simple">{{
              $form.theme?.error?.message
            }}</Message>
          </div>

          <!-- Dark Theme Variant (only shown when dark or system theme is selected) -->
          <div v-if="showDarkThemeSelector" class="flex flex-col gap-1">
            <label for="darkTheme">Dark Theme Style</label>
            <Select
              name="darkTheme"
              :options="darkThemeOptions"
              optionLabel="name"
              placeholder="Select a dark theme variant"
              :disabled="submittingDisplaySettings"
              fluid
            />
            <small class="text-[var(--p-text-muted-color)]">
              Choose your preferred dark theme appearance. Midnight Sage is the default.
            </small>
          </div>

          <!-- Light Theme Variant (only shown when light or system theme is selected) -->
          <div v-if="showLightThemeSelector" class="flex flex-col gap-1">
            <label for="lightTheme">Light Theme Style</label>
            <Select
              name="lightTheme"
              :options="lightThemeOptions"
              optionLabel="name"
              placeholder="Select a light theme variant"
              :disabled="submittingDisplaySettings"
              fluid
            />
            <small class="text-[var(--p-text-muted-color)]">
              Choose your preferred light theme appearance. Mint Fresh is the default.
            </small>
          </div>

          <Button
            type="submit"
            label="Save Changes"
            :loading="submittingDisplaySettings"
            class="w-full md:w-1/2 lg:w-1/3 mt-6"
          />
        </Form>

        <div class="flex flex-row items-center md:flex-col gap-4 mt-16 md:w-50">
          <div class="max-w-60">
            <img
              v-if="userStore.avatarLink"
              :src="userStore.avatarLink"
              alt="Image"
              class="shadow-md rounded-xl w-full"
            />
          </div>
          <FileUpload
            mode="basic"
            name="demo[]"
            accept="image/*"
            :maxFileSize="1000000"
            chooseIcon="pi pi-upload"
            @select="uploadAvatar"
            :auto="true"
            chooseLabel="Upload"
            class="md:w-50"
          />
        </div>
      </div>
      <Form
        v-slot="$form"
        :initialValues="loginInitialValues"
        :resolver="loginSettingsResolver"
        @submit="submitLoginSettings"
        class="flex flex-col gap-4 w-full md:w-1/2 lg:w-1/2"
      >
        <h3 class="font-bold text-xl">Login Settings</h3>

        <!-- Email -->
        <div class="flex flex-col gap-2 w-full">
          <label for="email" class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
            >Email Address</label
          >
          <InputText
            name="email"
            type="email"
            placeholder="Email"
            :disabled="submittingLoginSettings"
            autocomplete="email"
            fluid
          />
          <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
            $form.email.error?.message
          }}</Message>
        </div>

        <!-- Reset Password -->
        <!-- New -->
        <div class="flex flex-col gap-1">
          <label for="name">Password</label>
          <InputText
            name="password"
            type="password"
            placeholder="New password"
            :disabled="submittingLoginSettings"
            autocomplete="off"
            fluid
          />
          <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
            $form.password.error?.message
          }}</Message>
          <Message size="small" severity="secondary" variant="simple">
            Updating this will reset your current password.
          </Message>
        </div>

        <!-- New Confirmed -->
        <div class="flex flex-col gap-1">
          <label for="name">Password Confirmation</label>
          <InputText
            name="passwordConfirmation"
            type="password"
            placeholder="Confirm password"
            :disabled="submittingLoginSettings"
            autocomplete="off"
            fluid
          />
          <Message
            v-if="$form.passwordConfirmation?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.passwordConfirmation.error?.message }}</Message
          >
        </div>

        <Button
          type="submit"
          label="Save Changes"
          :loading="submittingLoginSettings"
          class="w-full md:w-1/2 lg:w-1/3 mt-6"
        />
      </Form>
    </div>
  </div>
</template>
