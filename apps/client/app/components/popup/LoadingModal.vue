<script setup lang="ts">
interface Props {
  visible: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

// Random loading image
const images = [
  '/icons/ball.png',
  '/icons/carrier.png',
  '/icons/hat.png',
  '/icons/icon-airplane-3d.png',
  '/icons/esimmany-logo.png',
  '/icons/flipflop.png',
];

const randomImage = computed(() => {
  return images[Math.floor(Math.random() * images.length)];
});
</script>

<template>
  <BaseModal
    :visible="visible"
    :width="350"
    animation="zoom"
    :close-mask-on-click="false"
    :show-close-button="false"
    @close="emit('close')"
  >
    <div class="flex flex-col items-center justify-center px-6 py-12">
      <img :src="randomImage" alt="loading" class="h-14 animate-bounce-custom object-contain" />
      <p class="mt-8 text-lg font-semibold text-gray-800">
        주문 정보를 불러오고 있습니다...
      </p>
    </div>
  </BaseModal>
</template>
