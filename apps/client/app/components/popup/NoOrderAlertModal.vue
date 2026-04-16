<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });
</script>

<template>
  <NAlertDialog
    v-model="visible"
    title="주문데이터를 불러오지 못했습니다."
    description="한번 더 주문 정보를 입력해 주세요."
    color="warning"
    :closable="false"
  >
    <template #icon>
      <img src="~/assets/icons/3d-fluency-no-entry.png" alt="warning" class="w-20" />
    </template>
  </NAlertDialog>
</template>
