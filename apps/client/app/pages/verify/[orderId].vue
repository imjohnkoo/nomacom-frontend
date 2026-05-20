<script setup lang="ts">
import { useOrderStore } from '~/stores/order';
import { useApi } from '~/composables/useApi';
import { formatPhoneNumber, isValidPhoneNumber } from '~/utils/formatter';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const api = useApi();

const orderId = computed(() => Number(route.params.orderId));

// Form state
const fullName = ref('');
const phoneNumber = ref('');
const errors = ref<{ fullName?: string; phoneNumber?: string }>({});

// Modal state
const isSubmitting = ref(false);
const isAlertVisible = ref(false);
const isCancelledOrderVisible = ref(false);
const isServerErrorVisible = ref(false);

// Handle phone number formatting
const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  phoneNumber.value = formatPhoneNumber(input.value);
};

// Validate form
const validate = () => {
  errors.value = {};

  if (!fullName.value.trim()) {
    errors.value.fullName = '이름을 입력해주세요.';
  }

  if (!phoneNumber.value) {
    errors.value.phoneNumber = '전화번호를 입력해주세요.';
  } else if (!isValidPhoneNumber(phoneNumber.value)) {
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
      phoneNumber: phoneNumber.value,
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
        <!-- Name field -->
        <div class="w-full">
          <div
            :class="[
              'rounded-xl px-3 pb-3 pt-3 shadow-sm focus-within:ring-2 focus-within:ring-cyan-600',
              errors.fullName ? 'ring-2 ring-red-500' : 'ring-1 ring-inset ring-gray-100',
            ]"
          >
            <label for="fullName" class="block pb-1 text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              class="w-full text-lg text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-0"
              placeholder="이름을 입력하세요"
            />
          </div>
          <p v-if="errors.fullName" class="mt-1.5 pl-3.5 text-xs text-red-500">
            {{ errors.fullName }}
          </p>
        </div>

        <!-- Phone field -->
        <div class="w-full pt-6">
          <div
            :class="[
              'rounded-xl px-3 pb-3 pt-3 shadow-sm focus-within:ring-2 focus-within:ring-cyan-600',
              errors.phoneNumber ? 'ring-2 ring-red-500' : 'ring-1 ring-inset ring-gray-100',
            ]"
          >
            <label for="phoneNumber" class="block pb-1 text-sm font-medium text-gray-700">
              전화번호
            </label>
            <input
              id="phoneNumber"
              :value="phoneNumber"
              type="tel"
              class="w-full text-lg text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-0"
              placeholder="전화번호를 입력하세요"
              @input="handlePhoneInput"
            />
          </div>
          <p v-if="errors.phoneNumber" class="mt-1.5 pl-3.5 text-xs text-red-500">
            {{ errors.phoneNumber }}
          </p>
        </div>

        <!-- Submit button -->
        <div class="mt-6">
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="[
              'flex w-full justify-center rounded-md px-3 py-4 text-lg font-semibold leading-6 text-white shadow-sm',
              isSubmitting ? 'bg-gray-500' : 'bg-cyan-600 hover:bg-cyan-700',
            ]"
          >
            주문 확인
          </button>
        </div>
      </form>
    </div>

    <!-- Modals -->
    <AlertModal :visible="isAlertVisible" @close="isAlertVisible = false" />
    <CancelledOrderAlertModal
      :visible="isCancelledOrderVisible"
      @close="isCancelledOrderVisible = false"
    />
    <ServerErrorModal :visible="isServerErrorVisible" @close="isServerErrorVisible = false" />
    <LoadingModal :visible="isSubmitting" @close="isSubmitting = false" />
  </div>
</template>
