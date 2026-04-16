<script setup lang="ts">
import { CheckIcon } from '@heroicons/vue/20/solid';
import { useOrderStore } from '~/stores/order';
import { useApi } from '~/composables/useApi';
import { formatDateString } from '~/utils/date';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const api = useApi();

const orderId = computed(() => Number(route.params.orderId));

// Modal state
const isPullingOrderVisible = ref(false);
const isNoOrderAlertVisible = ref(false);
const isCancelledOrderVisible = ref(false);
const isLoadingVisible = ref(false);

// Select an order
const handleSelectOrder = async (idx: number) => {
  const orders = orderStore.orders;

  if (!orders) {
    isNoOrderAlertVisible.value = true;
    setTimeout(() => {
      isNoOrderAlertVisible.value = false;
      router.push(`/verify/${orderId.value}`);
    }, 3000);
    return;
  }

  isLoadingVisible.value = true;

  // Add delay for loading animation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const verifyDto = {
      orderId: orderId.value,
      phoneNumber: orders[idx]?.receiverPhoneNumber || '',
      fullName: orders[idx]?.receiverName || '',
    };

    const response = await api.verifyOrder(verifyDto);
    const { verified, cancelled, details } = response;

    if (verified && !cancelled) {
      orderStore.setOrders(details || []);
      orderStore.setSingleOrder(details?.[idx] || orders[idx]);

      if (orders[idx].esims && orders[idx].esims.length > 0) {
        isLoadingVisible.value = false;
        router.push(`/view/${orderId.value}`);
      } else {
        isLoadingVisible.value = false;
        router.push(`/select-date/${orderId.value}`);
      }
    } else if (verified && cancelled) {
      isLoadingVisible.value = false;
      isCancelledOrderVisible.value = true;
      setTimeout(() => {
        isCancelledOrderVisible.value = false;
        router.push(`/verify/${orderId.value}`);
      }, 2000);
    } else {
      isLoadingVisible.value = false;
      isNoOrderAlertVisible.value = true;
      setTimeout(() => {
        isNoOrderAlertVisible.value = false;
        router.push(`/verify/${orderId.value}`);
      }, 2000);
    }
  } catch (error) {
    console.error(error);
    isLoadingVisible.value = false;
    isNoOrderAlertVisible.value = true;
    setTimeout(() => {
      isNoOrderAlertVisible.value = false;
      router.push(`/verify/${orderId.value}`);
    }, 2000);
  }
};

// Check if orders data exists on mount
onMounted(() => {
  if (!orderStore.orders || orderStore.orders.length === 0) {
    isPullingOrderVisible.value = true;

    setTimeout(() => {
      isPullingOrderVisible.value = false;
      isNoOrderAlertVisible.value = true;

      setTimeout(() => {
        isNoOrderAlertVisible.value = false;
        router.push(`/verify/${orderId.value}`);
      }, 3000);
    }, 3000);
  }
});
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div
      class="flex h-64 flex-col justify-end rounded-b-2xl bg-cover bg-center p-4 pb-5"
      :style="{ backgroundImage: `url('/images/background-2.png')` }"
    >
      <p class="pb-2 text-sm text-white">2/4</p>
      <h1 class="pb-2 text-2xl font-semibold text-white">발행할 이심을 선택하세요.</h1>
      <p class="pb-1 text-xs text-white">주문번호</p>
      <p class="text-xs font-medium text-white">{{ orderId }}</p>
    </div>

    <!-- Order list -->
    <div class="flex flex-col items-center justify-center gap-y-4 px-2 py-4">
      <div
        v-if="orderStore.orders && orderStore.orders.length > 0"
        class="flex w-full flex-col gap-y-4"
      >
        <NCard
          v-for="(order, index) in orderStore.orders"
          :key="order.productOrderId"
          variant="elevated"
        >
          <div class="flex w-full flex-col gap-y-4">
            <!-- Status badge -->
            <div class="flex w-full items-center gap-x-3">
              <NBadge
                v-if="order.esims && order.esims.length > 0"
                color="info"
                variant="solid"
                size="sm"
              >
                <CheckIcon class="mr-1 h-4 w-4" />
                발급완료
              </NBadge>
              <NBadge v-else color="success" variant="subtle" size="sm">
                주문완료
              </NBadge>
            </div>

            <!-- Order details -->
            <div class="flex w-full items-start gap-x-3">
              <div class="flex w-full flex-col gap-y-1.5">
                <p class="overflow-hidden text-xs font-light text-gray-900">
                  {{ formatDateString(order.placeOrderDate) }}
                </p>
                <p class="overflow-hidden text-lg font-bold text-gray-900">
                  {{ order.planNameKr }}
                </p>
                <p class="truncate text-sm font-medium text-gray-500">
                  {{ order.planDataTypeKr }} {{ order.planDataLimitKr }}
                </p>
                <div class="flex flex-row flex-wrap gap-x-1 gap-y-1">
                  <NBadge
                    v-for="(country, countryIndex) in order.planCountriesKr"
                    :key="countryIndex"
                    color="neutral"
                    variant="outline"
                    size="xs"
                  >
                    {{ country }}
                  </NBadge>
                </div>
                <p class="truncate text-sm font-medium text-gray-500">
                  사용일수 : {{ order.planDataDuration }}일
                </p>
                <p class="truncate text-sm text-gray-500">수량 : {{ order.quantity }}개</p>
              </div>
            </div>

            <!-- Action button -->
            <NButton variant="secondary" full-width @click="handleSelectOrder(index)">
              {{ order.esims && order.esims.length > 0 ? 'QR코드 보기' : '선택하기' }}
            </NButton>
          </div>
        </NCard>
      </div>
    </div>

    <!-- Modals -->
    <PullingOrdersModal v-model="isPullingOrderVisible" />
    <NoOrderAlertModal v-model="isNoOrderAlertVisible" />
    <CancelledOrderAlertModal v-model="isCancelledOrderVisible" />
    <LoadingModal v-model="isLoadingVisible" />
  </div>
</template>
