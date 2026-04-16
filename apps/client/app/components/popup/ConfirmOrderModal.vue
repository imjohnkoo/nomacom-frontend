<script setup lang="ts">
import {
  CalendarDaysIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/vue/24/solid';
import { WalletIcon } from '@heroicons/vue/24/outline';
import type { Order } from '~/types/order';
import { formatDateStringToKorean } from '~/utils/date';

interface Props {
  order: Order;
}

const props = defineProps<Props>();
const visible = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  confirm: [];
}>();

const formattedStartTime = computed(() => {
  return String(props.order.startTime).padStart(2, '0');
});
</script>

<template>
  <NConfirmDialog
    v-model="visible"
    title="주문을 확인해 주세요."
    confirm-text="QR 발급하기"
    cancel-text="뒤로가기"
    @confirm="emit('confirm')"
  >
    <div class="flex flex-col items-center">
      <img src="~/assets/icons/3d-fluency-test-passed.png" alt="confirm" class="w-20" />

      <div class="flex w-full flex-col items-center pt-4">
        <div
          class="flex w-full flex-col items-center gap-y-4 rounded-lg bg-gray-50 px-5 py-6 text-center shadow-md ring-1 ring-inset ring-gray-200"
        >
          <!-- Plan info -->
          <div class="flex w-full flex-col items-start gap-y-1">
            <p class="text-md font-semibold text-gray-800">
              {{ order.planNameKr }}
            </p>
            <p class="text-xs font-medium text-gray-500">
              {{ order.planDataTypeKr }} ({{ order.planDataLimitKr }})
            </p>
            <div class="flex flex-row flex-wrap gap-x-1 gap-y-1">
              <NBadge
                v-for="(country, index) in order.planCountriesKr"
                :key="index"
                color="neutral"
                variant="outline"
                size="xs"
              >
                {{ country }}
              </NBadge>
            </div>
          </div>

          <!-- First row: Country, Duration, Quantity -->
          <div class="flex w-full flex-row gap-x-1">
            <div class="flex flex-1 flex-col gap-y-0.5 text-left">
              <div class="flex flex-row items-center">
                <MapPinIcon class="h-4 w-4 text-gray-500" />
                <p class="text-xs font-light text-gray-500">시작국가</p>
              </div>
              <p class="text-sm font-medium text-gray-800">
                {{ order.startCountry }}
              </p>
            </div>
            <div class="flex flex-1 flex-col gap-y-0.5 text-left">
              <div class="flex flex-row items-center gap-x-0.5">
                <CalendarIcon class="h-4 w-4 text-gray-500" />
                <p class="text-xs font-light text-gray-500">사용일수</p>
              </div>
              <p class="text-sm font-medium text-gray-800">{{ order.planDataDuration }}일</p>
            </div>
            <div class="flex flex-1 flex-col gap-y-0.5 text-left">
              <div class="flex flex-row items-center gap-x-0.5">
                <WalletIcon class="h-4 w-4 text-gray-500" />
                <p class="text-xs font-light text-gray-500">주문수량</p>
              </div>
              <p class="text-sm font-medium text-gray-800">{{ order.quantity }}개</p>
            </div>
          </div>

          <!-- Second row: Start/End dates -->
          <div class="flex w-full flex-row gap-x-1">
            <div class="flex flex-1 flex-col gap-y-0.5 text-left">
              <div class="flex flex-row items-center gap-x-0.5">
                <CalendarDaysIcon class="h-4 w-4 text-gray-500" />
                <p class="text-xs font-light text-gray-500">시작일시</p>
              </div>
              <p class="text-xs font-medium text-gray-800">
                {{ formatDateStringToKorean(order.startDate || '2023-12-01') }}
                {{ formattedStartTime }}시
              </p>
            </div>
            <div class="flex flex-1 flex-col gap-y-0.5 text-left">
              <div class="flex flex-row items-center gap-x-0.5">
                <CalendarDaysIcon class="h-4 w-4 text-gray-500" />
                <p class="text-xs font-light text-gray-500">종료일시</p>
              </div>
              <p class="text-xs font-medium text-gray-800">
                {{ formatDateStringToKorean(order.endDate || '2023-12-01') }}
                {{ formattedStartTime }}시
              </p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-md pt-4 font-semibold text-gray-800">QR코드를 발급하시겠습니까?</p>
      <p class="pt-1 text-xs text-red-600">*발급 후에는 취소와 환불이 불가합니다.</p>
    </div>
  </NConfirmDialog>
</template>
