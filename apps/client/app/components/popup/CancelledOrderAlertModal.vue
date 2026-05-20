<script setup lang="ts">
interface Props {
  visible: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <BaseModal
    :visible="visible"
    :width="350"
    animation="slideDown"
    :close-mask-on-click="true"
    :show-close-button="true"
    @close="emit('close')"
  >
    <div class="flex flex-col items-center justify-center px-6 pb-8 pt-6">
      <img src="~/assets/icons/3d-fluency-no-entry.png" alt="warning" class="w-20" />
      <p class="mt-6 text-lg font-semibold text-gray-800">취소된 주문입니다.</p>
      <p class="mt-1 text-sm text-gray-500">취소를 철회하시거나 다시 구매해 주세요.</p>
    </div>
  </BaseModal>
</template>
