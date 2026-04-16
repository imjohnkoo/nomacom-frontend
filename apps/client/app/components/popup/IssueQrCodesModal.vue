<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });
</script>

<template>
  <NAlertDialog
    v-model="visible"
    title="QR 코드를 발행하고 있습니다."
    description="잠시만 기다려주세요."
    :closable="false"
  >
    <template #icon>
      <img src="~/assets/icons/qr.png" alt="qr" class="w-20 animate-bounce-custom" />
    </template>
  </NAlertDialog>
</template>
