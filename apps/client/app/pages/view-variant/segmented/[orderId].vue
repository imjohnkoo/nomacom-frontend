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
const activeIdx = ref(0)
const activeEsim = computed(() => order.value?.esims?.[activeIdx.value])

const downloadQR = () => {
  const canvas = document.querySelector(`#qr-seg canvas`) as HTMLCanvasElement
  if (!canvas) return
  const url = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
  const a = document.createElement('a')
  a.href = url
  a.download = `qr-code-${activeIdx.value + 1}.png`
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
        eyebrow="Segmented tab 패턴"
        :title="`상단 탭으로\n하나씩 보기`"
        description="발급된 esim 을 탭으로 전환. 가이드/안내는 공통으로 1회만."
      />
    </div>

    <div class="vv__chip-row">
      <NInfoChip label="주문번호" :value="String(orderId)" />
      <NInfoChip v-if="order" :value="`${order.planNameKr} · ${order.esims.length}개`" />
    </div>

    <div v-if="order" class="vv__tabs">
      <button
        v-for="(_, idx) in order.esims"
        :key="idx"
        type="button"
        class="vv__tab"
        :class="{ 'vv__tab--active': activeIdx === idx }"
        @click="activeIdx = idx"
      >
        eSIM {{ idx + 1 }}
      </button>
    </div>

    <div v-if="activeEsim" class="vv__esim">
      <div class="vv__esim-head">
        <NStatusPill color="success" dot>발급완료</NStatusPill>
        <span class="vv__index">{{ activeIdx + 1 }} / {{ order!.esims.length }}</span>
      </div>

      <div id="qr-seg" class="vv__qr">
        <ClientOnly>
          <QRCodeVue3
            :key="activeIdx"
            :value="activeEsim.activationCode"
            :width="220"
            :height="220"
            :margin="2"
          />
          <template #fallback>
            <div class="vv__qr-skel" />
          </template>
        </ClientOnly>
      </div>

      <div class="vv__download">
        <NButton variant="secondary" size="md" @click="downloadQR">QR 다운로드</NButton>
      </div>

      <div class="vv__codes">
        <NCodeRow label="SM-DP+ 주소" :value="activeEsim.smdpAddress" />
        <NCodeRow label="활성화 코드" :value="activeEsim.manualCode" />
        <NCodeRow label="LPA 전체" :value="activeEsim.activationCode" />
      </div>
    </div>

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

.vv__tabs {
  margin-top: 22px;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.vv__tabs::-webkit-scrollbar {
  display: none;
}

.vv__tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}
.vv__tab:hover {
  background: #f1f5f9;
}
.vv__tab--active {
  background: var(--color-primary-500, #6239ff);
  color: #ffffff;
  border-color: var(--color-primary-500, #6239ff);
}

.vv__esim {
  margin-top: 16px;
  padding: 18px;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px -16px rgba(15, 23, 42, 0.12);
}
.vv__esim-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vv__index {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}
.vv__qr {
  margin: 14px auto 0;
  padding: 12px;
  width: fit-content;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}
.vv__qr-skel {
  width: 220px;
  height: 220px;
  background: #f1f5f9;
  border-radius: 8px;
}
.vv__download {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
.vv__codes {
  margin-top: 16px;
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
