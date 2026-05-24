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
    :show-close-button="false"
    @close="emit('close')"
  >
    <div class="flex flex-col items-center justify-center px-6 pb-8 pt-6">
      <img src="~/assets/icons/3d-fluency-no-entry.png" alt="warning" class="w-20" />
      <p class="mt-2 text-lg font-semibold text-gray-800">
        주문데이터를 불러오지 못했습니다.
      </p>
      <p class="mt-1 text-sm text-gray-500">한번 더 주문 정보를 입력해 주세요.</p>
    </div>
  </BaseModal>
</template>
