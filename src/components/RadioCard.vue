<script setup lang="ts">
import { computed } from 'vue'
import RadioButton from 'primevue/radiobutton'

interface Props {
  modelValue: any
  value: any
  inputId?: string
  name?: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const isSelected = computed(() => props.modelValue === props.value)
</script>

<template>
  <label
    :for="inputId"
    class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 radio-card"
    :class="{
      'radio-card--selected': isSelected,
      'radio-card--disabled': disabled,
    }"
  >
    <RadioButton
      :model-value="modelValue"
      :input-id="inputId"
      :name="name"
      :value="value"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <slot />
  </label>
</template>

<style scoped>
.radio-card {
  border-color: var(--color-border);
  background-color: var(--color-surface);
}

.radio-card:hover:not(.radio-card--disabled) {
  background-color: var(--color-surface-variant);
  border-color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.radio-card--selected {
  background-color: var(--color-surface-variant);
  border-color: var(--color-accent);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.radio-card--selected:hover:not(.radio-card--disabled) {
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-accent) 25%, transparent);
}

.radio-card--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Dark mode adjustments */
:global(.dark) .radio-card:hover:not(.radio-card--disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

:global(.dark) .radio-card--selected {
  box-shadow: 0 2px 12px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

:global(.dark) .radio-card--selected:hover:not(.radio-card--disabled) {
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-accent) 35%, transparent);
}
</style>
