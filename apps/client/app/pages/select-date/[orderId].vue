<script setup lang="ts">
import {
  NStepProgress,
  NPageHeading,
  NInfoChip,
  NFieldCard,
  NHighlightCard,
  NTrustNote,
  NDurationCalendar,
  NBottomSheet,
  NButton,
  NAlertDialog,
  NLoaderDialog,
} from '@imjohnkoo/design-vue'
import type { CalDate } from '@imjohnkoo/design-vue'
import { addDays, format } from 'date-fns'
import { useOrderStore } from '~/stores/order'
import { useApi } from '~/composables/useApi'
import type { Order } from '~/types/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const api = useApi()

const orderId = computed(() => Number(route.params.orderId))
const order = computed(() => orderStore.singleOrder)

const combinedCountries = computed(() => {
  if (!order.value) return []
  return order.value.planCountriesKr.map((country, index) => ({
    kr: country,
    en: order.value?.planCountriesEng[index] || '',
    iso: order.value?.planCountriesIso[index] || '',
    timeZone: order.value?.timeZones[index] || '',
  }))
})

const selectedCountry = ref<string>('')
const selectedDate = ref<CalDate | null>(null)

const errors = ref<{ country?: string; date?: string }>({})

const isCountrySheetOpen = ref(false)
const isDateSheetOpen = ref(false)
const isSubmitting = ref(false)
const isIssueQrCodesVisible = ref(false)
const isNoOrderAlertVisible = ref(false)
const isCancelledOrderVisible = ref(false)
const isConfirmOrderVisible = ref(false)

const formatDate = (d: CalDate | null) => {
  if (!d) return ''
  const dow = ['일', '월', '화', '수', '목', '금', '토']
  const js = new Date(d.year, d.month - 1, d.day)
  return `${d.year}.${String(d.month).padStart(2, '0')}.${String(d.day).padStart(2, '0')} (${dow[js.getDay()]})`
}

const endDateLabel = computed(() => {
  if (!selectedDate.value || !order.value) return ''
  const start = new Date(
    selectedDate.value.year,
    selectedDate.value.month - 1,
    selectedDate.value.day,
  )
  const end = addDays(start, order.value.planDataDuration)
  const dow = ['일', '월', '화', '수', '목', '금', '토']
  return `${format(end, 'yyyy.MM.dd')} (${dow[end.getDay()]})`
})

const startDateLabel = computed(() => formatDate(selectedDate.value))

const countryLabel = computed(() => {
  if (!selectedCountry.value) return ''
  const c = combinedCountries.value.find((c) => c.kr === selectedCountry.value)
  return c ? `${c.kr} · ${c.timeZone}` : selectedCountry.value
})

const getTimeZone = () => {
  const c = combinedCountries.value.find((c) => c.kr === selectedCountry.value)
  return c?.timeZone || 'Asia/Seoul'
}

const onCountrySelect = (kr: string) => {
  selectedCountry.value = kr
  isCountrySheetOpen.value = false
  errors.value.country = undefined
}

const onDateConfirm = () => {
  if (selectedDate.value) errors.value.date = undefined
  isDateSheetOpen.value = false
}

const validate = () => {
  errors.value = {}
  if (!selectedCountry.value) errors.value.country = '국가를 선택해 주세요.'
  if (!selectedDate.value) errors.value.date = '시작 날짜를 선택해 주세요.'
  return Object.keys(errors.value).length === 0
}

const onSubmit = () => {
  if (!validate()) return

  if (order.value && selectedDate.value) {
    const start = new Date(
      selectedDate.value.year,
      selectedDate.value.month - 1,
      selectedDate.value.day,
    )
    const end = addDays(start, order.value.planDataDuration)

    const updatedOrder: Order = {
      ...order.value,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      startTime: 0,
      startTimeZone: getTimeZone(),
      startCountry: selectedCountry.value,
    }
    orderStore.setSingleOrder(updatedOrder)
    isConfirmOrderVisible.value = true
  } else {
    isNoOrderAlertVisible.value = true
    setTimeout(() => {
      isNoOrderAlertVisible.value = false
      router.push(`/verify/${orderId.value}`)
    }, 3000)
  }
}

const onConfirm = async () => {
  isConfirmOrderVisible.value = false
  isIssueQrCodesVisible.value = true

  if (!order.value) {
    isIssueQrCodesVisible.value = false
    isNoOrderAlertVisible.value = true
    setTimeout(() => {
      isNoOrderAlertVisible.value = false
      router.push(`/verify/${orderId.value}`)
    }, 3000)
    return
  }

  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    const verifyResponse = await api.verifyOrder({
      orderId: orderId.value,
      phoneNumber: order.value.receiverPhoneNumber,
      fullName: order.value.receiverName,
    })
    const { verified, cancelled } = verifyResponse

    if (verified && !cancelled) {
      const activateResponse = await api.activateOrder(orderStore.singleOrder!)
      const { verified: activateVerified, details } = activateResponse
      if (activateVerified && details) {
        isSubmitting.value = false
        isIssueQrCodesVisible.value = false
        orderStore.setSingleOrder(details[0])

        const updatedOrders = await api.verifyOrder({
          orderId: orderId.value,
          phoneNumber: order.value.receiverPhoneNumber,
          fullName: order.value.receiverName,
        })
        if (updatedOrders.details) orderStore.setOrders(updatedOrders.details)

        router.push(`/view/${orderId.value}`)
      }
    } else if (verified && cancelled) {
      isIssueQrCodesVisible.value = false
      isCancelledOrderVisible.value = true
      setTimeout(() => {
        isCancelledOrderVisible.value = false
        router.push(`/verify/${orderId.value}`)
      }, 2000)
    } else {
      isIssueQrCodesVisible.value = false
      isNoOrderAlertVisible.value = true
      setTimeout(() => {
        isNoOrderAlertVisible.value = false
        router.push(`/verify/${orderId.value}`)
      }, 2000)
    }
  } catch (error) {
    console.error(error)
    isSubmitting.value = false
    isIssueQrCodesVisible.value = false
    isNoOrderAlertVisible.value = true
    setTimeout(() => {
      isNoOrderAlertVisible.value = false
      router.push(`/verify/${orderId.value}`)
    }, 3000)
  }
}

// Design preview seed — store.singleOrder 가 비어있을 때만 주입
const DESIGN_PREVIEW_SINGLE: Order = {
  orderId: 2026052671032971,
  productOrderId: 2026052646969541,
  productName: '[유럽이심전문] 북유럽4개국 무제한데이터',
  placeOrderDate: new Date('2026-05-25T13:56:47.560Z'),
  quantity: 1,
  totalPaymentAmount: 21600,
  optionManageCode: 'EU043U02D10V2',
  receiverName: '',
  receiverPhoneNumber: '',
  planNameKr: '북유럽4개국',
  planDataTypeKr: '무제한 데이터',
  planDataLimitKr: '매일 2기가 + 무제한 500Kbps',
  planDataDuration: 10,
  planCountriesKr: ['덴마크', '노르웨이', '스웨덴', '핀란드'],
  planCountriesEng: ['Denmark', 'Norway', 'Sweden', 'Finland'],
  planCountriesIso: ['DNK', 'NOR', 'SWE', 'FIN'],
  timeZones: ['Europe/Copenhagen', 'Europe/Oslo', 'Europe/Stockholm', 'Europe/Helsinki'],
  startDate: '',
  startTime: 0,
  endDate: '',
  startCountry: '',
  startTimeZone: '',
  planTypeId: 'EU043U02D10V2',
  esims: [],
}

onMounted(() => {
  if (!order.value) {
    orderStore.setSingleOrder(DESIGN_PREVIEW_SINGLE)
  } else if (order.value.esims && order.value.esims.length > 0) {
    router.push(`/details/${orderId.value}`)
  }
})
</script>

<template>
  <div class="select-date-page">
    <div class="select-date-page__top">
      <NStepProgress :step="3" :total="4" label="사용 일시" />
    </div>

    <div class="select-date-page__heading">
      <NPageHeading
        eyebrow="eSIM QR 코드 발급"
        :title="`사용 시작 날짜를\n선택해 주세요`"
        :description="`현지에 도착하는 날짜를 골라 주시면\n그날부터 회선이 자동으로 켜져요.`"
      />
    </div>

    <div class="select-date-page__chip-row">
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
      <NInfoChip v-if="order" :value="order.planNameKr">
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
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </template>
      </NInfoChip>
    </div>

    <div class="select-date-page__fields">
      <div class="select-date-page__field-wrap">
        <NFieldCard
          label="시작 국가"
          :value="countryLabel"
          placeholder="국가를 선택해 주세요"
          :active="!!selectedCountry"
          :error="!!errors.country"
          @click="isCountrySheetOpen = true"
        />
        <p v-if="errors.country" class="select-date-page__err">{{ errors.country }}</p>
      </div>

      <div class="select-date-page__field-wrap">
        <NFieldCard
          label="시작 날짜"
          :value="startDateLabel"
          placeholder="날짜를 선택해 주세요"
          :active="!!selectedDate"
          :error="!!errors.date"
          @click="isDateSheetOpen = true"
        />
        <p v-if="errors.date" class="select-date-page__err">{{ errors.date }}</p>
      </div>
    </div>

    <div v-if="selectedDate" class="select-date-page__preview">
      <NHighlightCard>
        <template #icon>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 8v4l3 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </template>
        eSIM 사용 예상 기간은
        <b style="color: var(--color-primary-700)">{{ startDateLabel }} ~ {{ endDateLabel }}</b>
        이에요.
      </NHighlightCard>
    </div>

    <div class="select-date-page__notes">
      <NTrustNote>
        <template #icon>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7v5l3 2" />
          </svg>
        </template>
        <b style="color: #111827">사용 일수는 첫 연결 시점부터 24시간 단위로 차감돼요.</b><br />
        현지에 도착해 처음 회선이 연결된 순간부터 24시간이 지나면 1일이 차감돼요. 선택한 날짜에
        도착하지 않아도 실제 연결 전까지는 사용일이 줄지 않아요.
      </NTrustNote>
      <div style="height: 8px" />
      <NTrustNote>
        <template #icon>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
          </svg>
        </template>
        <b style="color: #111827">다국가 이심은 자동 로밍으로 그대로 사용할 수 있어요.</b><br />
        한 번 개통된 다음에는 포함된 국가들을 오가도 추가 설치나 설정 변경 없이 자동으로 연결돼요.
      </NTrustNote>
    </div>

    <div class="select-date-page__cta">
      <NButton
        type="button"
        variant="primary"
        size="xl"
        full-width
        :disabled="isSubmitting"
        @click="onSubmit"
      >
        QR 코드 발행하기
      </NButton>
    </div>

    <!-- Country bottom sheet -->
    <NBottomSheet v-model="isCountrySheetOpen" title="시작 국가 선택">
      <div class="select-date-page__sheet-list">
        <button
          v-for="c in combinedCountries"
          :key="c.iso"
          type="button"
          class="select-date-page__sheet-row"
          :class="{ 'select-date-page__sheet-row--active': selectedCountry === c.kr }"
          @click="onCountrySelect(c.kr)"
        >
          <span class="select-date-page__sheet-row-main">{{ c.kr }}</span>
          <span class="select-date-page__sheet-row-sub">{{ c.timeZone }}</span>
        </button>
      </div>
    </NBottomSheet>

    <!-- Date bottom sheet -->
    <NBottomSheet v-model="isDateSheetOpen" title="시작 날짜 선택">
      <div class="select-date-page__cal">
        <NDurationCalendar v-model="selectedDate" :duration="order?.planDataDuration || 0" />
      </div>
      <template #footer>
        <NButton variant="primary" size="xl" full-width @click="onDateConfirm"> 선택 완료 </NButton>
      </template>
    </NBottomSheet>

    <!-- Confirm summary -->
    <NAlertDialog
      v-model="isConfirmOrderVisible"
      title="이 내용으로 발급할까요?"
      color="primary"
      :closable="false"
    >
      <div v-if="order" class="select-date-page__confirm">
        <div class="select-date-page__confirm-row">
          <span>상품</span><b>{{ order.planNameKr }}</b>
        </div>
        <div class="select-date-page__confirm-row">
          <span>시작 국가</span><b>{{ selectedCountry }}</b>
        </div>
        <div class="select-date-page__confirm-row">
          <span>시작 날짜</span><b>{{ startDateLabel }}</b>
        </div>
        <div class="select-date-page__confirm-row">
          <span>사용 기간</span><b>{{ order.planDataDuration }}일</b>
        </div>
        <div class="select-date-page__confirm-row">
          <span>수량</span><b>{{ order.quantity }}개</b>
        </div>
      </div>
      <template #actions>
        <div class="select-date-page__confirm-actions">
          <NButton variant="secondary" @click="isConfirmOrderVisible = false">뒤로</NButton>
          <NButton variant="primary" @click="onConfirm">발급하기</NButton>
        </div>
      </template>
    </NAlertDialog>

    <NLoaderDialog
      v-model="isIssueQrCodesVisible"
      title="QR 코드를 발급하고 있어요"
      description="잠시만 기다려주세요…"
    />

    <NAlertDialog
      v-model="isNoOrderAlertVisible"
      title="주문 정보를 찾을 수 없어요"
      color="warning"
      :closable="false"
    >
      <p class="select-date-page__dialog-desc">
        주문번호를 다시 확인해 주세요.<br />본인 확인 페이지로 돌아갈게요.
      </p>
    </NAlertDialog>

    <NAlertDialog
      v-model="isCancelledOrderVisible"
      title="이미 취소된 주문이에요"
      color="warning"
      :closable="false"
    >
      <p class="select-date-page__dialog-desc">
        취소된 주문은 발급할 수 없어요.<br />본인 확인 페이지로 돌아갈게요.
      </p>
    </NAlertDialog>
  </div>
</template>

<style scoped>
.select-date-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px 24px 32px;
  background: #ffffff;
}

.select-date-page__heading {
  margin-top: 28px;
}

.select-date-page__chip-row {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.select-date-page__fields {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-date-page__field-wrap {
  display: flex;
  flex-direction: column;
}

.select-date-page__err {
  margin: 6px 0 0 4px;
  font-size: 12px;
  color: var(--color-error-500, #ef4444);
}

.select-date-page__preview {
  margin-top: 20px;
}

.select-date-page__notes {
  margin-top: 16px;
}

.select-date-page__cta {
  margin-top: auto;
  padding-top: 32px;
}

.select-date-page__sheet-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.select-date-page__sheet-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  padding: 14px 12px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease;
}

.select-date-page__sheet-row:hover {
  background: #f8fafc;
}

.select-date-page__sheet-row--active {
  background: var(--color-primary-50, #f3efff);
}

.select-date-page__sheet-row-main {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.select-date-page__sheet-row-sub {
  font-size: 11.5px;
  color: #94a3b8;
}

.select-date-page__cal {
  padding: 0 4px 12px;
}

.select-date-page__confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  background: #f9fafb;
  border-radius: 14px;
  padding: 14px;
  font-size: 13px;
}

.select-date-page__confirm-row {
  display: flex;
  justify-content: space-between;
}

.select-date-page__confirm-row span {
  color: #6b7280;
}

.select-date-page__confirm-row b {
  font-weight: 600;
  color: #111827;
}

.select-date-page__confirm-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
  width: 100%;
}

.select-date-page__dialog-desc {
  margin: -6px 0 0;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  line-height: 1.55;
}
</style>
