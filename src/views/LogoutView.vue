<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useAuthStore } from '@/stores/authentication'

const authStore = useAuthStore()

onBeforeMount(() => {
  authStore.signOut()
})
</script>

<template><span></span></template>
