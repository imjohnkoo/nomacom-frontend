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
    animation="zoom"
    :close-mask-on-click="false"
    :show-close-button="false"
    @close="emit('close')"
  >
    <div class="flex flex-col items-center justify-center px-5 py-8">
      <img src="~/assets/icons/qr.png" alt="qr" class="w-20 animate-bounce-custom" />
      <div class="flex flex-col items-center justify-center gap-y-1 pt-5">
        <p class="text-lg font-semibold text-gray-800">QR 코드를 발행하고 있습니다.</p>
        <p class="text-lg font-medium text-gray-800">잠시만 기다려주세요.</p>
      </div>
    </div>
  </BaseModal>
</template>
