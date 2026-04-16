<script setup lang="ts">
import VueTailwindDatepicker from 'vue-tailwind-datepicker';
import { addDays, format, parseISO } from 'date-fns';
import { useOrderStore } from '~/stores/order';
import { useApi } from '~/composables/useApi';
import type { Order } from '~/types/order';

interface CombinedCountry {
  kr: string;
  en: string;
  iso: string;
  timeZone: string;
}

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const api = useApi();

const orderId = computed(() => Number(route.params.orderId));
const order = computed(() => orderStore.singleOrder);

// Form state
const selectedCountry = ref('');
const selectedHour = ref<number | null>(null);
const dateValue = ref({
  startDate: '',
  endDate: '',
});

// NSelect requires string values for hours
const selectedHourStr = computed({
  get: () => (selectedHour.value !== null ? String(selectedHour.value) : ''),
  set: (val: string) => {
    selectedHour.value = val !== '' ? Number(val) : null;
  },
});

// Validation errors
const errors = ref<{ country?: string; date?: string; hour?: string }>({});

// Combined countries for dropdown
const combinedCountries = computed<CombinedCountry[]>(() => {
  if (!order.value) return [];
  return order.value.planCountriesKr.map((country, index) => ({
    kr: country,
    en: order.value?.planCountriesEng[index] || '',
    iso: order.value?.planCountriesIso[index] || '',
    timeZone: order.value?.timeZones[index] || '',
  }));
});

// NSelect items
const countryItems = computed(() =>
  combinedCountries.value.map((c) => ({ label: c.kr, value: c.kr })),
);

const hourItems = computed(() =>
  Array.from({ length: 24 }, (_, i) => ({
    label: formatHour(i),
    value: String(i),
  })),
);

// Modal state
const isSubmitting = ref(false);
const isIssueQrCodesVisible = ref(false);
const isNoOrderAlertVisible = ref(false);
const isCancelledOrderVisible = ref(false);
const isConfirmOrderVisible = ref(false);

// Format hour display
const formatHour = (hour: number) => {
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}시`;
};

// Get timezone for selected country
const getTimeZone = () => {
  const country = combinedCountries.value.find((c) => c.kr === selectedCountry.value);
  return country?.timeZone || 'Asia/Seoul';
};

// Handle date change
const handleDateChange = (value: unknown) => {
  const dateData = value as { startDate: string; endDate: string } | null;
  if (dateData && dateData.startDate) {
    const duration = order.value?.planDataDuration || 0;
    const dateObj = parseISO(dateData.startDate);
    const newEndDate = addDays(dateObj, duration);
    dateValue.value = {
      startDate: dateData.startDate,
      endDate: format(newEndDate, 'yyyy-MM-dd'),
    };
  } else {
    dateValue.value = { startDate: '', endDate: '' };
  }
};

// Validate form
const validate = () => {
  errors.value = {};

  if (!selectedCountry.value) {
    errors.value.country = '국가를 선택해 주세요.';
  }

  if (!dateValue.value.startDate) {
    errors.value.date = '시작날짜를 선택해 주세요.';
  }

  if (selectedHour.value === null) {
    errors.value.hour = '시작시간을 선택해주세요.';
  }

  return Object.keys(errors.value).length === 0;
};

// Submit form
const onSubmit = () => {
  if (!validate()) return;

  if (order.value) {
    const updatedOrder: Order = {
      ...order.value,
      startDate: dateValue.value.startDate,
      endDate: dateValue.value.endDate,
      startTime: selectedHour.value!,
      startTimeZone: getTimeZone(),
      startCountry: selectedCountry.value,
    };

    orderStore.setSingleOrder(updatedOrder);
    isConfirmOrderVisible.value = true;
  } else {
    isNoOrderAlertVisible.value = true;
    setTimeout(() => {
      isNoOrderAlertVisible.value = false;
      router.push(`/verify/${orderId.value}`);
    }, 3000);
  }
};

// Confirm and activate
const onConfirm = async () => {
  isConfirmOrderVisible.value = false;
  isIssueQrCodesVisible.value = true;

  if (!order.value) {
    isIssueQrCodesVisible.value = false;
    isNoOrderAlertVisible.value = true;
    setTimeout(() => {
      isNoOrderAlertVisible.value = false;
      router.push(`/verify/${orderId.value}`);
    }, 3000);
    return;
  }

  // Add delay for loading animation
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // Verify order first
    const verifyResponse = await api.verifyOrder({
      orderId: orderId.value,
      phoneNumber: order.value.receiverPhoneNumber,
      fullName: order.value.receiverName,
    });

    const { verified, cancelled } = verifyResponse;

    if (verified && !cancelled) {
      // Activate order
      const activateResponse = await api.activateOrder(orderStore.singleOrder!);
      const { verified: activateVerified, details } = activateResponse;

      if (activateVerified && details) {
        isSubmitting.value = false;
        isIssueQrCodesVisible.value = false;
        orderStore.setSingleOrder(details[0]);

        // Refresh orders list
        const updatedOrders = await api.verifyOrder({
          orderId: orderId.value,
          phoneNumber: order.value.receiverPhoneNumber,
          fullName: order.value.receiverName,
        });
        if (updatedOrders.details) {
          orderStore.setOrders(updatedOrders.details);
        }

        router.push(`/view/${orderId.value}`);
      }
    } else if (verified && cancelled) {
      isIssueQrCodesVisible.value = false;
      isCancelledOrderVisible.value = true;
      setTimeout(() => {
        isCancelledOrderVisible.value = false;
        router.push(`/verify/${orderId.value}`);
      }, 2000);
    } else {
      isIssueQrCodesVisible.value = false;
      isNoOrderAlertVisible.value = true;
      setTimeout(() => {
        isNoOrderAlertVisible.value = false;
        router.push(`/verify/${orderId.value}`);
      }, 2000);
    }
  } catch (error) {
    console.error(error);
    isSubmitting.value = false;
    isIssueQrCodesVisible.value = false;
    isNoOrderAlertVisible.value = true;
    setTimeout(() => {
      isNoOrderAlertVisible.value = false;
      router.push(`/verify/${orderId.value}`);
    }, 3000);
  }
};

// Check order on mount
onMounted(() => {
  if (!order.value) {
    isNoOrderAlertVisible.value = true;
    setTimeout(() => {
      isNoOrderAlertVisible.value = false;
      router.push(`/verify/${orderId.value}`);
    }, 3000);
  } else if (order.value.esims && order.value.esims.length > 0) {
    router.push(`/details/${orderId.value}`);
  }
});
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div
      class="flex h-72 flex-col justify-end rounded-b-2xl bg-cover bg-center p-4 pb-5"
      :style="{ backgroundImage: `url('/images/background-2.png')` }"
    >
      <p class="pb-2 text-sm text-white">3/4</p>
      <h1 class="pb-2 text-2xl font-semibold text-white">사용 시작 일시를 선택하세요.</h1>
      <p class="pb-1 text-xs text-white">주문번호</p>
      <p class="text-xs font-medium text-white">{{ orderId }}</p>
    </div>

    <!-- Form -->
    <div class="flex w-full flex-col px-2 py-5">
      <div
        class="flex w-full flex-col items-center justify-center rounded-2xl px-4 py-4 ring-1 ring-inset ring-gray-200"
      >
        <form class="flex w-full flex-col gap-y-4" @submit.prevent="onSubmit">
          <!-- Country select -->
          <NFormField label="이심 사용을 시작할 국가를 선택해 주세요." :error="errors.country">
            <NSelect
              v-model="selectedCountry"
              :items="countryItems"
              placeholder="국가를 선택하세요."
            />
          </NFormField>

          <!-- Date picker -->
          <div class="flex w-full flex-col items-start justify-center">
            <label class="text-sm font-medium text-gray-800">시작 날짜를 선택해 주세요.</label>
            <p class="text-xs text-gray-500">도착하는 날짜를 선택해 주세요.</p>
            <VueTailwindDatepicker
              v-model="dateValue"
              :formatter="{ date: 'YYYY-MM-DD', month: 'MMM' }"
              as-single
              use-range
              :shortcuts="false"
              input-classes="text-md border border-gray-300 rounded-md px-4 py-2 w-full mt-1"
              @update:model-value="handleDateChange"
            />
            <p v-if="errors.date" class="mt-1.5 pl-3.5 text-xs text-red-500">
              {{ errors.date }}
            </p>
          </div>

          <!-- Hour select -->
          <NFormField label="시작 시간을 선택해 주세요" :error="errors.hour">
            <NSelect
              v-model="selectedHourStr"
              :items="hourItems"
              placeholder="시간을 선택하세요"
            />
          </NFormField>

          <!-- Submit button -->
          <div class="mt-6">
            <NButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :disabled="isSubmitting"
              :loading="isSubmitting"
            >
              QR코드 발행하기
            </NButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Modals -->
    <NoOrderAlertModal v-model="isNoOrderAlertVisible" />
    <IssueQrCodesModal v-model="isIssueQrCodesVisible" />
    <CancelledOrderAlertModal v-model="isCancelledOrderVisible" />
    <ConfirmOrderModal
      v-if="orderStore.singleOrder"
      v-model="isConfirmOrderVisible"
      :order="orderStore.singleOrder"
      @confirm="onConfirm"
    />
  </div>
</template>
