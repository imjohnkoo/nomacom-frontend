<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });
</script>

<template>
  <NAlertDialog
    v-model="visible"
    title="주문번호가 일치하지 않습니다."
    description="주문하실때 입력한 전화번호와 이름을 입력해 주세요."
    color="warning"
    closable
  >
    <template #icon>
      <img src="~/assets/icons/3d-fluency-no-entry.png" alt="warning" class="w-20" />
    </template>
  </NAlertDialog>
</template>
