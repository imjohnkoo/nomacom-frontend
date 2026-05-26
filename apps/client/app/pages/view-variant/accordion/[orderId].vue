<script setup lang="ts">
import QRCodeVue3 from 'qrcode-vue3'
import {
  NStepProgress,
  NPageHeading,
  NInfoChip,
  NStatusPill,
  NCodeRow,
  NLinkCard,
  NButton,
  NTrustNote,
} from '@imjohnkoo/design-vue'
import { useOrderStore } from '~/stores/order'
import { buildMultiQrSeed } from '~/utils/multi-qr-seed'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => Number(route.params.orderId))
const order = computed(() => orderStore.singleOrder)
const openIdx = ref<number>(0) // 첫 esim 만 펼쳐서 시작

const toggle = (idx: number) => {
  openIdx.value = openIdx.value === idx ? -1 : idx
}

const downloadQR = (index: number) => {
  const canvas = document.querySelector(`#qr-acc-${index} canvas`) as HTMLCanvasElement
  if (!canvas) return
  const url = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
  const a = document.createElement('a')
  a.href = url
  a.download = `qr-code-${index + 1}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onMounted(() => {
  orderStore.setSingleOrder(buildMultiQrSeed(6))
})
</script>

<template>
  <div class="vv">
    <NStepProgress :step="4" :total="4" label="발급 완료" />

    <div class="vv__heading">
      <NPageHeading
        eyebrow="Accordion 패턴"
        :title="`리스트에서\n눌러서 펼치기`"
        description="모든 esim 의 상태를 한눈에. 필요한 카드만 펼쳐서 QR 확인."
      />
    </div>

    <div class="vv__chip-row">
      <NInfoChip label="주문번호" :value="String(orderId)" />
      <NInfoChip v-if="order" :value="`${order.planNameKr} · ${order.esims.length}개`" />
    </div>

    <ul v-if="order" class="vv__list">
      <li
        v-for="(esim, idx) in order.esims"
        :key="idx"
        class="vv__row"
        :class="{ 'vv__row--open': openIdx === idx }"
      >
        <button class="vv__row-head" type="button" @click="toggle(idx)">
          <span class="vv__row-head-left">
            <span class="vv__row-num">eSIM {{ idx + 1 }}</span>
            <NStatusPill color="success" dot>발급완료</NStatusPill>
          </span>
          <svg
            class="vv__chev"
            :class="{ 'vv__chev--open': openIdx === idx }"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div v-show="openIdx === idx" class="vv__row-body">
          <div :id="`qr-acc-${idx}`" class="vv__qr">
            <ClientOnly>
              <QRCodeVue3 :value="esim.activationCode" :width="180" :height="180" :margin="2" />
              <template #fallback>
                <div class="vv__qr-skel" />
              </template>
            </ClientOnly>
          </div>

          <div class="vv__download">
            <NButton variant="secondary" size="sm" @click="downloadQR(idx)"> QR 다운로드 </NButton>
          </div>

          <div class="vv__codes">
            <NCodeRow label="SM-DP+" :value="esim.smdpAddress" />
            <NCodeRow label="활성화 코드" :value="esim.manualCode" />
            <NCodeRow label="LPA 전체" :value="esim.activationCode" />
          </div>
        </div>
      </li>
    </ul>

    <div class="vv__divider"><span>설치 가이드</span></div>

    <div class="vv__guides">
      <NLinkCard
        label="아이폰 설치 가이드"
        sub="iOS · Universal Link"
        href="https://esimmany.super.site"
        external
      />
      <NLinkCard
        label="안드로이드 설치 가이드"
        sub="Galaxy · Pixel · QR 등록"
        href="https://esimmany.super.site"
        external
      />
    </div>

    <div class="vv__notes">
      <NTrustNote>사용 일수는 첫 연결 시점부터 24시간 단위로 차감돼요.</NTrustNote>
      <div style="height: 8px" />
      <NTrustNote>다국가 이심은 자동 로밍으로 그대로 사용할 수 있어요.</NTrustNote>
    </div>

    <div class="vv__back">
      <NButton variant="ghost" size="md" full-width @click="router.push('/view-variant')">
        다른 시안 보기
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.vv {
  padding: 20px 24px 32px;
  background: #ffffff;
}
.vv__heading {
  margin-top: 28px;
}
.vv__chip-row {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vv__list {
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vv__row {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
  transition:
    box-shadow 160ms ease,
    border-color 160ms ease;
}
.vv__row--open {
  border-color: var(--color-primary-300, #a78bff);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px -16px rgba(15, 23, 42, 0.12);
}

.vv__row-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.vv__row-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.vv__row-num {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.005em;
}
.vv__chev {
  color: #94a3b8;
  transition: transform 200ms ease;
}
.vv__chev--open {
  transform: rotate(180deg);
  color: var(--color-primary-500, #6239ff);
}

.vv__row-body {
  padding: 4px 16px 18px;
  border-top: 1px solid #f1f5f9;
}
.vv__qr {
  margin: 14px auto 0;
  padding: 10px;
  width: fit-content;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}
.vv__qr-skel {
  width: 180px;
  height: 180px;
  background: #f1f5f9;
  border-radius: 8px;
}
.vv__download {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.vv__codes {
  margin-top: 12px;
}

.vv__divider {
  margin: 22px 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.vv__divider::before,
.vv__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
.vv__divider span {
  font-size: 11.5px;
  font-weight: 600;
  color: #94a3b8;
}

.vv__guides {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.vv__notes {
  margin-top: 20px;
}
.vv__back {
  margin-top: 24px;
}
</style>
