<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps({
  message: String,
  variant: String,
})

const title = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'Error'
    case 'info':
      return 'Attention'
    case 'warning':
      return 'Warning'

    default:
      return ''
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'border-1 border-red-700 bg-red-700/15'
    case 'info':
      return 'border-1 border-sky-700 bg-sky-700/15'
    case 'warning':
      return 'border-1 border-yellow-700 bg-yellow-700/15'

    default:
      return ''
  }
})
</script>

<template>
  <div :class="[variantClasses, 'flex flex-col w-full rounded-lg min-h-14 p-8']">
    <p class="font-bold">{{ title }}</p>
    <p>{{ message }}</p>
  </div>
</template>
