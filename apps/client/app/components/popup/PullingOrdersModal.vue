<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });
</script>

<template>
  <NAlertDialog
    v-model="visible"
    title="주문을 확인하고 있습니다."
    :closable="false"
  >
    <template #icon>
      <img
        src="~/assets/icons/3d-fluency-info-1.png"
        alt="info"
        class="w-20 animate-bounce-custom"
      />
    </template>
  </NAlertDialog>
</template>
