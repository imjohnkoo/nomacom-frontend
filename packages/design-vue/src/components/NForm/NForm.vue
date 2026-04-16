<template>
  <form
    :class="[
      'n-form',
      {
        'n-form--disabled': disabled,
      },
    ]"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { provideForm } from '../../composables'

export interface NFormProps {
  disabled?: boolean
}

const props = withDefaults(defineProps<NFormProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  submit: [event: Event]
}>()

provideForm({
  disabled: toRef(props, 'disabled'),
})

function handleSubmit(event: Event) {
  if (!props.disabled) {
    emit('submit', event)
  }
}
</script>

<style scoped>
.n-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4, 1rem);
  width: 100%;
}

.n-form--disabled {
  opacity: 0.7;
  pointer-events: none;
}
</style>
