<script setup lang="ts">
import {
  NStepProgress,
  NPageHeading,
  NInfoChip,
  NStatusPill,
  NButton,
  NAlertDialog,
  NLoaderDialog,
} from '@imjohnkoo/design-vue'
import { useOrderStore } from '~/stores/order'
import { useApi } from '~/composables/useApi'
import { formatDateString } from '~/utils/date'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const api = useApi()

const orderId = computed(() => Number(route.params.orderId))

const isPullingOrderVisible = ref(false)
const isNoOrderAlertVisible = ref(false)
const isCancelledOrderVisible = ref(false)
const isLoadingVisible = ref(false)

const handleSelectOrder = async (idx: number) => {
  const orders = orderStore.orders

  if (!orders) {
    isNoOrderAlertVisible.value = true
    setTimeout(() => {
      isNoOrderAlertVisible.value = false
      router.push(`/verify/${orderId.value}`)
    }, 3000)
    return
  }

  isLoadingVisible.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))

  try {
    const verifyDto = {
      orderId: orderId.value,
      phoneNumber: orders[idx]?.receiverPhoneNumber || '',
      fullName: orders[idx]?.receiverName || '',
    }

    const response = await api.verifyOrder(verifyDto)
    const { verified, cancelled, details } = response

    if (verified && !cancelled) {
      orderStore.setOrders(details || [])
      orderStore.setSingleOrder(details?.[idx] || orders[idx])
      isLoadingVisible.value = false
      if (orders[idx].esims && orders[idx].esims.length > 0) {
        router.push(`/view/${orderId.value}`)
      } else {
        router.push(`/select-date/${orderId.value}`)
      }
    } else if (verified && cancelled) {
      isLoadingVisible.value = false
      isCancelledOrderVisible.value = true
      setTimeout(() => {
        isCancelledOrderVisible.value = false
        router.push(`/verify/${orderId.value}`)
      }, 2000)
    } else {
      isLoadingVisible.value = false
      isNoOrderAlertVisible.value = true
      setTimeout(() => {
        isNoOrderAlertVisible.value = false
        router.push(`/verify/${orderId.value}`)
      }, 2000)
    }
  } catch (error) {
    console.error(error)
    isLoadingVisible.value = false
    isNoOrderAlertVisible.value = true
    setTimeout(() => {
      isNoOrderAlertVisible.value = false
      router.push(`/verify/${orderId.value}`)
    }, 2000)
  }
}

onMounted(() => {
  if (!orderStore.orders || orderStore.orders.length === 0) {
    isPullingOrderVisible.value = true
    setTimeout(() => {
      isPullingOrderVisible.value = false
      isNoOrderAlertVisible.value = true
      setTimeout(() => {
        isNoOrderAlertVisible.value = false
        router.push(`/verify/${orderId.value}`)
      }, 3000)
    }, 3000)
  }
})
</script>

<template>
  <div class="details-page">
    <div class="details-page__top">
      <NStepProgress :step="2" :total="4" label="이심 선택" />
    </div>

    <div class="details-page__heading">
      <NPageHeading
        eyebrow="eSIM QR 코드 발급"
        :title="`발행할 이심을\n선택해 주세요`"
        :description="`주문하신 상품이 여러 개라면\n발급할 항목을 골라 주세요.`"
      />
    </div>

    <div class="details-page__chip">
      <NInfoChip label="주문번호" :value="String(orderId)">
        <template #icon>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
        </template>
      </NInfoChip>
    </div>

    <ul v-if="orderStore.orders && orderStore.orders.length > 0" class="details-page__list">
      <li
        v-for="(order, index) in orderStore.orders"
        :key="order.productOrderId"
        class="details-page__card"
      >
        <div class="details-page__card-head">
          <NStatusPill v-if="order.esims && order.esims.length > 0" color="info" dot>
            발급완료
          </NStatusPill>
          <NStatusPill v-else color="success" dot>주문완료</NStatusPill>
          <span class="details-page__date">
            {{ formatDateString(order.placeOrderDate) }}
          </span>
        </div>

        <h3 class="details-page__plan">{{ order.planNameKr }}</h3>
        <p class="details-page__meta">
          {{ order.planDataTypeKr }} · {{ order.planDataLimitKr }} · {{ order.planDataDuration }}일
        </p>

        <div class="details-page__countries">
          <span
            v-for="(country, countryIndex) in order.planCountriesKr"
            :key="countryIndex"
            class="details-page__country"
          >
            {{ country }}
          </span>
        </div>

        <div class="details-page__qty">
          <span>수량</span>
          <strong>{{ order.quantity }}개</strong>
        </div>

        <div class="details-page__action">
          <NButton
            :variant="order.esims && order.esims.length > 0 ? 'secondary' : 'primary'"
            size="lg"
            full-width
            @click="handleSelectOrder(index)"
          >
            {{ order.esims && order.esims.length > 0 ? 'QR 코드 보기' : '선택하기' }}
          </NButton>
        </div>
      </li>
    </ul>

    <div v-else class="details-page__empty">
      <p>주문 정보를 불러오는 중이에요…</p>
    </div>

    <NLoaderDialog
      v-model="isPullingOrderVisible"
      title="주문을 불러오고 있어요"
      description="잠시만 기다려주세요…"
    />
    <NLoaderDialog
      v-model="isLoadingVisible"
      title="이심을 준비하고 있어요"
      description="잠시만 기다려주세요…"
    />

    <NAlertDialog
      v-model="isNoOrderAlertVisible"
      title="주문 정보를 찾을 수 없어요"
      color="warning"
      :closable="false"
    >
      <p class="details-page__dialog-desc">
        주문번호를 다시 확인해 주세요.<br />본인 확인 페이지로 돌아갈게요.
      </p>
    </NAlertDialog>

    <NAlertDialog
      v-model="isCancelledOrderVisible"
      title="이미 취소된 주문이에요"
      color="warning"
      :closable="false"
    >
      <p class="details-page__dialog-desc">
        취소된 주문은 발급할 수 없어요.<br />본인 확인 페이지로 돌아갈게요.
      </p>
    </NAlertDialog>
  </div>
</template>

<style scoped>
.details-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px 24px 32px;
  background: #ffffff;
}

.details-page__heading {
  margin-top: 28px;
}

.details-page__chip {
  margin-top: 18px;
}

.details-page__list {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.details-page__card {
  display: flex;
  flex-direction: column;
  padding: 18px;
  border-radius: var(--radius-xl, 18px);
  background: #ffffff;
  border: 1px solid #eef2f7;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px -16px rgba(15, 23, 42, 0.12);
}

.details-page__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.details-page__date {
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: -0.01em;
}

.details-page__plan {
  margin: 14px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.details-page__meta {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
  letter-spacing: -0.005em;
}

.details-page__countries {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.details-page__country {
  font-size: 11.5px;
  font-weight: 500;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 999px;
}

.details-page__qty {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13px;
  color: #64748b;
}

.details-page__qty strong {
  color: #0f172a;
  font-weight: 700;
}

.details-page__action {
  margin-top: 16px;
}

.details-page__empty {
  margin-top: 60px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.details-page__dialog-desc {
  margin: -6px 0 0;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  line-height: 1.55;
}
</style>
