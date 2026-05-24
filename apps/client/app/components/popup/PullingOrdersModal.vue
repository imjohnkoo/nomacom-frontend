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
    <div class="flex flex-col items-center justify-center px-6 py-12">
      <img
        src="~/assets/icons/3d-fluency-info-1.png"
        alt="info"
        class="w-20 animate-bounce-custom"
      />
      <p class="mt-8 text-lg font-semibold text-gray-800">주문을 확인하고 있습니다.</p>
    </div>
  </BaseModal>
</template>
