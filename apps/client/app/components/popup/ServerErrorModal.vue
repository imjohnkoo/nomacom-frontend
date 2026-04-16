<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });
</script>

<template>
  <NAlertDialog
    v-model="visible"
    title="문제가 발생했습니다."
    description="고객센터로 문의해 주세요."
    color="error"
    closable
  >
    <template #icon>
      <img src="~/assets/icons/server-error-3d.png" alt="error" class="w-20 animate-bounce-2" />
    </template>
  </NAlertDialog>
</template>
