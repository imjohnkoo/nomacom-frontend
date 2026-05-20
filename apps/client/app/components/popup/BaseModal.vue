<script setup lang="ts">
interface Props {
  visible: boolean;
  width?: number;
  height?: number;
  animation?: 'slideDown' | 'zoom';
  closeMaskOnClick?: boolean;
  showCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 350,
  height: undefined,
  animation: 'slideDown',
  closeMaskOnClick: true,
  showCloseButton: true,
});

const emit = defineEmits<{
  close: [];
}>();

const animationClass = computed(() => {
  return props.animation === 'zoom' ? 'animate-zoom-in' : 'animate-slide-down';
});

const handleMaskClick = () => {
  if (props.closeMaskOnClick) {
    emit('close');
  }
};

const handleContentClick = (e: Event) => {
  e.stopPropagation();
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click="handleMaskClick"
      >
        <div
          :class="[
            'relative flex flex-col rounded-xl bg-white shadow-xl',
            animationClass,
          ]"
          :style="{
            width: `${width}px`,
            maxWidth: '90vw',
            maxHeight: height ? `${height}px` : '90vh',
          }"
          @click="handleContentClick"
        >
          <!-- Close button -->
          <button
            v-if="showCloseButton"
            class="absolute right-3 top-3 z-10 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            @click="emit('close')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Content -->
          <div class="overflow-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
