<script setup lang="ts">
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { ref } from 'vue'
import AlertBanner from '@/components/AlertBanner.vue'
import { useAuthStore } from '@/stores/authentication'

const authStore = useAuthStore()
const checked1 = ref(true)
const initialValues = ref({
  email: '',
  password: '',
})

const resolver = zodResolver(
  z.object({
    email: z.string().email().min(1, { message: 'Email is required.' }),
    password: z
      .string()
      .min(3, { message: 'Minimum 3 characters.' })
      .refine((value) => /[a-z]/.test(value), {
        message: 'Must have a lowercase letter.',
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Must have an uppercase letter.',
      }),
  }),
)
</script>

<template>
  <div
    class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20 h-dvh flex items-center"
  >
    <div
      class="bg-surface-0 dark:bg-surface-900 p-8 md:p-12 shadow-sm rounded-2xl w-full max-w-xl mx-auto flex flex-col gap-8"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-4">
          <Image src="./src/assets/logo.svg" alt="Image" width="250" />
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full">
        <AlertBanner v-if="authStore.loginError" :message="authStore.loginError" variant="danger" />
        <Form
          v-slot="$form"
          :initialValues
          :resolver="resolver"
          @submit="authStore.signIn"
          class="flex flex-col gap-6 w-full"
        >
          <div class="flex flex-col gap-2 w-full">
            <label
              for="email1"
              class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
              >Email Address</label
            >
            <InputText name="email" type="email" placeholder="Email" fluid />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
              $form.email.error?.message
            }}</Message>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <label
              for="password"
              class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
              >Password</label
            >
            <InputText name="password" type="password" placeholder="Password" fluid />
            <Message
              v-if="$form.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
              >{{ $form.password.error?.message }}</Message
            >
          </div>
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0"
          >
            <div class="flex items-center gap-2">
              <Checkbox id="rememberme1" v-model="checked1" :binary="true" />
              <label for="rememberme1" class="text-surface-900 dark:text-surface-0 leading-normal"
                >Remember me</label
              >
            </div>
            <a class="text-primary font-medium cursor-pointer hover:text-primary-emphasis"
              >Forgot your password?</a
            >
          </div>
          <Button
            label="Sign In"
            type="submit"
            icon="pi pi-user"
            class="w-full py-2 rounded-lg flex justify-center items-center gap-2"
          >
            <template #icon>
              <i class="pi pi-user !text-base !leading-normal" />
            </template>
          </Button>
        </Form>
      </div>
    </div>
  </div>
</template>
