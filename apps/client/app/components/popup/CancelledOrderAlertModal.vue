<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });
</script>

<template>
  <NAlertDialog
    v-model="visible"
    title="취소된 주문입니다."
    description="취소를 철회하시거나 다시 구매해 주세요."
    color="warning"
    closable
  >
    <template #icon>
      <img src="~/assets/icons/3d-fluency-no-entry.png" alt="warning" class="w-20" />
    </template>
  </NAlertDialog>
</template>
