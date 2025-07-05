<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'

const userStore = useUserStore()
const toast = useToast()
const loading = ref(false)
const uploading = ref(false)

const resolver = zodResolver(
  z.object({
    email: z.string().email(),
    name: z.string(),
    theme: z.object({
      name: z.string(),
      code: z.string(),
    }),
  }),
)

const themeOptions = ref<{ name: string; code: string }[]>([
  { name: 'System', code: 'system' },
  { name: 'Light', code: 'light' },
  { name: 'Dark', code: 'dark' },
])

const defaultTheme = computed(() => {
  if (userStore.currentUser) {
    return themeOptions.value.find((theme) => theme.code === userStore?.currentUser?.theme)
  } else {
    return themeOptions.value[0].code
  }
})

const initialValues = ref({
  email: userStore?.currentUser?.email,
  name: userStore?.currentUser?.full_name,
  theme: defaultTheme.value,
})

// @ts-expect-error idk typings for this yet
const onFormSubmit = async ({ valid, values }) => {
  if (valid) {
    loading.value = true

    const userData = {
      email: values.email,
      name: values.name,
      theme: values.theme.code,
    }

    const result = await userStore.updateUser(userData)

    if (result && result !== null) {
      loading.value = false
      toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
      return
    }

    loading.value = false
    toast.add({ severity: 'success', summary: 'User succssfully updated!', life: 3000 })
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
    <Form
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full md:w-1/2 lg:w-1/2"
    >
      <!-- Name -->
      <div class="flex flex-col gap-1">
        <label for="name">Name</label>
        <InputText
          name="name"
          type="text"
          placeholder="Name"
          :disabled="loading"
          autocomplete="off"
          fluid
        />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
          $form.name.error?.message
        }}</Message>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-2 w-full">
        <label for="email" class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
          >Email Address</label
        >
        <InputText
          name="email"
          type="email"
          placeholder="Email"
          :disabled="loading"
          autocomplete="email"
          fluid
        />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
          $form.email.error?.message
        }}</Message>
      </div>

      <!-- Implement Reset Password here -->

      <!-- App Theme -->
      <div class="flex flex-col gap-1">
        <label for="theme">Theme</label>
        <Select
          name="theme"
          :options="themeOptions"
          optionLabel="name"
          placeholder="Select a theme"
          :disabled="loading"
          fluid
        />
        <Message v-if="$form.theme?.invalid" severity="error" size="small" variant="simple">{{
          $form.theme?.error?.message
        }}</Message>
      </div>
      <Button
        type="submit"
        label="Save Changes"
        :loading="loading"
        class="w-full md:w-1/2 lg:w-1/3 mt-6"
      />
    </Form>

    <div class="flex flex-row items-center md:flex-col gap-4 mt-6 md:w-50">
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
</template>
