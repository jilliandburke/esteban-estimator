<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const themeStore = useThemeStore()

themeStore.setAppTheme()
</script>

<template>
  <Suspense>
    <div>
      <Toast />
      <NavBar v-if="userStore.isLoggedIn" />
      <RouterView :key="$route.path" />
    </div>
    <template #fallback>
      <ProgressSpinner />
    </template>
  </Suspense>
</template>
