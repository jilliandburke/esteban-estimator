<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserSessionStore } from '@/stores/userSession'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'

const userSessionStore = useUserSessionStore()
const toast = useToast()
const loading = ref(false)

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
  if (userSessionStore.currentUser) {
    return themeOptions.value.find((theme) => theme.code === userSessionStore?.currentUser?.theme)
  } else {
    return themeOptions.value[0].code
  }
})

const initialValues = ref({
  email: userSessionStore?.currentUser?.email,
  name: userSessionStore?.currentUser?.full_name,
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

    const result = await userSessionStore.updateUser(userData)

    if (result && result !== null) {
      loading.value = false
      toast.add({ severity: 'danger', summary: `${result}`, life: 3000 })
      return
    }

    loading.value = false
    toast.add({ severity: 'success', summary: 'User succssfully updated!', life: 3000 })
  }
}
</script>

<template>
  <div class="flex p-6 gap-10 w-full">
    <Form
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full lg:w-1/2"
    >
      <!-- Name -->
      <div class="flex flex-col gap-1">
        <label for="name">Name</label>
        <InputText name="name" type="text" placeholder="Name" :disabled="loading" fluid />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
          $form.name.error?.message
        }}</Message>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-2 w-full">
        <label for="email1" class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
          >Email Address</label
        >
        <InputText name="email" type="email" placeholder="Email" :disabled="loading" fluid />
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
      <Button type="submit" label="Save Changes" :loading="loading" class="md:w-1/3 mt-6" />
    </Form>

    <!-- FIX/IMPLEMENT USER AVATAR UPLOAD LATER -->
    <!-- <div class="flex flex-col gap-4 mt-6"> -->
    <!--   <img v-if="avatarLink" :src="avatarLink" alt="Image" class="shadow-md rounded-xl w-36" /> -->
    <!--   <FileUpload -->
    <!--     mode="basic" -->
    <!--     name="demo[]" -->
    <!--     url="/api/upload" -->
    <!--     accept="image/*" -->
    <!--     :maxFileSize="1000000" -->
    <!--     chooseIcon="pi pi-upload" -->
    <!--     :auto="true" -->
    <!--     chooseLabel="Upload" -->
    <!--   /> -->
    <!-- </div> -->
  </div>
</template>
