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
      <p class="mt-2 text-lg font-semibold text-gray-800">
        주문번호가 일치하지 않습니다.
      </p>
      <p class="mt-1 text-sm text-gray-500">
        주문하실때 입력한 전화번호와 이름을 입력해 주세요.
      </p>
    </div>
  </BaseModal>
</template>
