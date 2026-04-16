<script setup lang="ts">
import { usePhoneFormat } from '@imjohnkoo/design-vue';
import { useOrderStore } from '~/stores/order';
import { useApi } from '~/composables/useApi';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const api = useApi();

const orderId = computed(() => Number(route.params.orderId));

// Form state
const fullName = ref('');
const { formatted: phoneFormatted, isValid: phoneIsValid, set: setPhone } = usePhoneFormat();
const errors = ref<{ fullName?: string; phoneNumber?: string }>({});

// Modal state
const isSubmitting = ref(false);
const isAlertVisible = ref(false);
const isCancelledOrderVisible = ref(false);
const isServerErrorVisible = ref(false);

// Validate form
const validate = () => {
  errors.value = {};

  if (!fullName.value.trim()) {
    errors.value.fullName = '이름을 입력해주세요.';
  }

  if (!phoneFormatted.value) {
    errors.value.phoneNumber = '전화번호를 입력해주세요.';
  } else if (!phoneIsValid.value) {
    errors.value.phoneNumber = '유효하지 않은 전화번호 형식입니다.';
  }

  return Object.keys(errors.value).length === 0;
};

// Submit form
const onSubmit = async () => {
  if (!validate()) return;

  isSubmitting.value = true;

  // Add delay for loading animation
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    const response = await api.verifyOrder({
      fullName: fullName.value,
      phoneNumber: phoneFormatted.value,
      orderId: orderId.value,
    });

    const { verified, cancelled, details } = response;

    if (verified && !cancelled) {
      orderStore.setOrders(details || []);
      router.push(`/details/${orderId.value}`);
    } else if (verified && cancelled) {
      isCancelledOrderVisible.value = true;
    } else {
      isAlertVisible.value = true;
    }
  } catch (error) {
    console.error(error);
    isServerErrorVisible.value = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div
      class="flex h-64 flex-col justify-end rounded-b-2xl bg-cover bg-center p-4 pb-5"
      :style="{ backgroundImage: `url('/images/background-2.png')` }"
    >
      <p class="pb-2 text-sm text-white">1/4</p>
      <h1 class="pb-2 text-xl font-semibold text-white">주문을 확인합니다.</h1>
      <p class="pb-1 text-xs text-white">주문번호</p>
      <p class="text-xs font-medium text-white">{{ orderId }}</p>
    </div>

    <!-- Form -->
    <div class="mt-4 flex flex-col items-center justify-center gap-y-2">
      <form class="w-full p-2" @submit.prevent="onSubmit">
        <NFormField label="이름" :error="errors.fullName">
          <NInput v-model="fullName" placeholder="이름을 입력하세요" :error="!!errors.fullName" />
        </NFormField>

        <div class="pt-6">
          <NFormField label="전화번호" :error="errors.phoneNumber">
            <NInput
              :model-value="phoneFormatted"
              type="tel"
              placeholder="전화번호를 입력하세요"
              :error="!!errors.phoneNumber"
              @update:model-value="setPhone"
            />
          </NFormField>
        </div>

        <div class="mt-6">
          <NButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            주문 확인
          </NButton>
        </div>
      </form>
    </div>

    <!-- Modals -->
    <AlertModal v-model="isAlertVisible" />
    <CancelledOrderAlertModal v-model="isCancelledOrderVisible" />
    <ServerErrorModal v-model="isServerErrorVisible" />
    <LoadingModal v-model="isSubmitting" />
  </div>
</template>
