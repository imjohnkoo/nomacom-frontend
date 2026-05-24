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
    :close-mask-on-click="false"
    :show-close-button="true"
    @close="emit('close')"
  >
    <div class="flex flex-col items-center justify-center px-6 pb-8 pt-6">
      <img src="~/assets/icons/server-error-3d.png" alt="error" class="w-20 animate-bounce-2" />
      <p class="mt-2 text-lg font-semibold text-gray-800">문제가 발생했습니다.</p>
      <p class="mt-1 text-sm text-gray-500">고객센터로 문의해 주세요.</p>
    </div>
  </BaseModal>
</template>
