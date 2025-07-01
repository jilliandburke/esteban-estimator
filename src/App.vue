<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useUserSessionStore } from '@/stores/userSession'

const userSessionStore = useUserSessionStore()
const themeStore = useThemeStore()

themeStore.setAppTheme()
</script>

<template>
  <Suspense>
    <div>
      <Toast />
      <NavBar v-if="userSessionStore.isLoggedIn" />
      <RouterView :key="$route.path" />
    </div>
    <template #fallback>
      <ProgressSpinner />
    </template>
  </Suspense>
</template>
