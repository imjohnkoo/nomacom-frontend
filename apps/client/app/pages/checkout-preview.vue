<script setup lang="ts">
// 테스트 체크아웃 (K9 · spec S-7) — PG 심사 캡처 전용. 사이트 어디에서도 링크하지 않는다 · noindex.
// 주문 저장 · 발급 · 서버 호출 0. 키는 runtimeConfig.public.portone(테스트 채널키만 — 이름에 TEST).
import { NButton, NCheckbox } from '@imjohnkoo/design-vue'
import {
  PENDING_PAYMENT_KEY,
  PREVIEW_ITEM,
  PREVIEW_ORDER_NAME,
  createPaymentId,
  formatWon,
  readPaymentResult,
} from '~/utils/checkout-preview'

definePageMeta({ layout: 'flow' })
useHead({ title: '결제하기' })

const config = useRuntimeConfig()
const route = useRoute()

const storeId = config.public.portone.storeId
const channelKey = config.public.portone.testChannelKey
const isConfigured = Boolean(storeId && channelKey)

const agreed = ref(false)
const isRequesting = ref(false)
const openError = ref<string | null>(null)
// 이 탭이 만든 결제 ID(sessionStorage) — 복귀 쿼리가 이것과 같을 때만 결과 줄을 그린다(링크로 만든 임의 문구 차단)
const expectedPaymentId = ref<string | null>(null)
const result = computed(() => readPaymentResult(route.query, expectedPaymentId.value))

const readPendingPayment = () => {
  try {
    return sessionStorage.getItem(PENDING_PAYMENT_KEY)
  } catch {
    return null
  }
}
const writePendingPayment = (paymentId: string) => {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, paymentId)
  } catch {
    /* 저장이 막힌 브라우저 — 결과 줄만 안 보인다 */
  }
}

// 결제창에서 뒤로 와 bfcache 로 복원되면 promise 가 끝나지 않은 채라 로딩으로 굳는다 — 되돌린다 (spec D-21)
const onPageShow = (event: PageTransitionEvent) => {
  if (event.persisted) isRequesting.value = false
}
onMounted(() => {
  expectedPaymentId.value = readPendingPayment()
  window.addEventListener('pageshow', onPageShow)
})
onBeforeUnmount(() => window.removeEventListener('pageshow', onPageShow))

const onPay = async () => {
  if (!isConfigured || !agreed.value || isRequesting.value) return
  isRequesting.value = true
  openError.value = null
  try {
    // SDK 는 클릭 때만 불러온다(SSR 번들 제외) — 첫 호출에 PortOne CDN 스크립트를 넣는다
    const PortOne = await import('@portone/browser-sdk/v2')
    const paymentId = createPaymentId(Date.now(), crypto.getRandomValues(new Uint8Array(12)))
    writePendingPayment(paymentId)
    expectedPaymentId.value = paymentId
    const response = await PortOne.requestPayment({
      storeId,
      channelKey,
      paymentId,
      orderName: PREVIEW_ORDER_NAME,
      totalAmount: PREVIEW_ITEM.amount,
      currency: 'KRW',
      payMethod: 'CARD',
      redirectUrl: `${window.location.origin}/checkout-preview`,
      // PC(iframe) · 모바일(리다이렉트) 모두 결과를 복귀 쿼리로 받는다 — 결과 처리는 readPaymentResult 하나
      forceRedirect: true,
    })
    if (response) {
      await navigateTo(
        {
          path: '/checkout-preview',
          query: { paymentId: response.paymentId, code: response.code, message: response.message },
        },
        { replace: true },
      )
    }
  } catch (error) {
    openError.value = error instanceof Error ? error.message : String(error)
  } finally {
    isRequesting.value = false
  }
}
</script>

<template>
  <div class="checkout">
    <h1 class="checkout__title">결제하기</h1>

    <section class="checkout__card" aria-labelledby="checkout-item-title">
      <h2 id="checkout-item-title" class="checkout__label">주문 상품</h2>
      <p class="checkout__product">{{ PREVIEW_ITEM.productName }}</p>
      <p class="checkout__option">{{ PREVIEW_ITEM.optionName }}</p>
      <dl class="checkout__rows">
        <div class="checkout__row">
          <dt>수량</dt>
          <dd>{{ PREVIEW_ITEM.quantity }}개</dd>
        </div>
        <div class="checkout__row">
          <dt>사용 기간</dt>
          <dd>{{ PREVIEW_ITEM.usage }}</dd>
        </div>
        <div class="checkout__row checkout__row--total">
          <dt>결제 금액</dt>
          <dd>{{ formatWon(PREVIEW_ITEM.amount) }}</dd>
        </div>
      </dl>
    </section>

    <section class="checkout__section" aria-labelledby="checkout-check-title">
      <h2 id="checkout-check-title" class="checkout__label">구매 전 확인</h2>
      <p class="checkout__text">
        eSIM 지원 기기인지 먼저 확인해 주세요.
        <NuxtLink to="/supported-devices" class="checkout__link">지원 기기 확인</NuxtLink>
      </p>
    </section>

    <section class="checkout__section" aria-labelledby="checkout-method-title">
      <h2 id="checkout-method-title" class="checkout__label">결제 수단</h2>
      <p class="checkout__method">
        <span class="checkout__radio" aria-hidden="true" />
        신용 · 체크카드
      </p>
    </section>

    <section class="checkout__agree">
      <NCheckbox
        v-model="agreed"
        label="주문 내용을 확인했고, 이용약관 · 개인정보 수집 · 이용 · 환불정책에 동의해요"
      />
      <p class="checkout__policy-links">
        <NuxtLink to="/terms" class="checkout__link">이용약관</NuxtLink>
        <NuxtLink to="/privacy" class="checkout__link">개인정보 수집 · 이용</NuxtLink>
        <NuxtLink to="/refund" class="checkout__link">환불정책</NuxtLink>
      </p>
    </section>

    <div class="checkout__cta">
      <NButton
        variant="primary"
        size="xl"
        full-width
        :disabled="!isConfigured || !agreed"
        :loading="isRequesting"
        @click="onPay"
      >
        {{ formatWon(PREVIEW_ITEM.amount) }} 결제하기
      </NButton>
      <p v-if="!isConfigured" class="checkout__note">결제 설정을 준비하고 있어요.</p>
    </div>

    <p
      v-if="!openError && result.status === 'success'"
      class="checkout__result checkout__result--ok"
      role="status"
    >
      결제창 호출과 승인을 확인했어요. 테스트 결제라 실제로 청구되지 않아요.
      <span class="checkout__result-id">결제 ID {{ result.paymentId }}</span>
    </p>
    <p v-else-if="!openError && result.status === 'failed'" class="checkout__result" role="status">
      결제가 완료되지 않았어요. ({{ result.message }})
    </p>
    <p v-if="openError" class="checkout__result" role="alert">
      결제창을 열지 못했어요. ({{ openError }})
    </p>
  </div>
</template>

<style scoped>
.checkout {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100vh;
  padding: 24px 20px 32px;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.checkout__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--n-color-neutral-900, #171717);
}

.checkout__card {
  padding: 18px;
  border: 1px solid var(--n-color-neutral-100, #f5f5f5);
  border-radius: 16px;
  background: var(--n-color-neutral-0, #ffffff);
  box-shadow: 0 8px 24px -16px rgba(15, 23, 42, 0.12);
}

.checkout__label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--n-color-neutral-500, #737373);
}

.checkout__product {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--n-color-neutral-900, #171717);
}

.checkout__option {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--n-color-neutral-600, #525252);
}

.checkout__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 14px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--n-color-neutral-100, #f5f5f5);
  font-size: 14px;
  line-height: 1.55;
}

.checkout__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.checkout__row dt {
  flex-shrink: 0;
  color: var(--n-color-neutral-500, #737373);
}

.checkout__row dd {
  margin: 0;
  text-align: right;
  color: var(--n-color-neutral-900, #171717);
}

.checkout__row--total dd {
  font-size: 17px;
  font-weight: 800;
}

.checkout__text,
.checkout__method {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--n-color-neutral-800, #262626);
}

.checkout__method {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkout__radio {
  width: 16px;
  height: 16px;
  border: 5px solid var(--n-color-primary-500, #6239ff);
  border-radius: 50%;
}

.checkout__link {
  font-weight: 600;
  color: var(--n-color-primary-600, #5025e8);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.checkout__agree {
  font-size: 14px;
}

.checkout__policy-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 8px 0 0 28px;
  font-size: 13px;
}

.checkout__cta {
  margin-top: auto;
  padding-top: 8px;
}

.checkout__note {
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
  color: var(--n-color-neutral-500, #737373);
}

.checkout__result {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--n-color-neutral-50, #fafafa);
  font-size: 13px;
  line-height: 1.6;
  color: var(--n-color-neutral-800, #262626);
}

.checkout__result--ok {
  background: var(--n-color-success-50, #f0fdf4);
}

.checkout__result-id {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--n-color-neutral-500, #737373);
  word-break: break-all;
}
</style>
