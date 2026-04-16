<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });

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
  <NAlertDialog
    v-model="visible"
    title="주문 정보를 불러오고 있습니다..."
    :closable="false"
  >
    <template #icon>
      <img :src="randomImage" alt="loading" class="h-14 animate-bounce-custom object-contain" />
    </template>
  </NAlertDialog>
</template>
