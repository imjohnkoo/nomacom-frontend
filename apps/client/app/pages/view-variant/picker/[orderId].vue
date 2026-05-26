<script setup lang="ts">
import QRCodeVue3 from 'qrcode-vue3'
import {
  NStepProgress,
  NPageHeading,
  NInfoChip,
  NStatusPill,
  NCodeRow,
  NLinkCard,
  NFieldCard,
  NBottomSheet,
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
const isSheetOpen = ref(false)

const pickerLabel = computed(() => {
  if (!order.value) return ''
  return `eSIM ${activeIdx.value + 1} / ${order.value.esims.length}`
})

const onPick = (idx: number) => {
  activeIdx.value = idx
  isSheetOpen.value = false
}

const downloadQR = () => {
  const canvas = document.querySelector(`#qr-pick canvas`) as HTMLCanvasElement
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
        eyebrow="Picker 패턴"
        :title="`발급된 eSIM 을\n골라서 보기`"
        description="picker 한 줄로 선택. 6+ 도 안정적으로 깔끔하게."
      />
    </div>

    <div class="vv__chip-row">
      <NInfoChip label="주문번호" :value="String(orderId)" />
      <NInfoChip v-if="order" :value="`${order.planNameKr} · ${order.esims.length}개`" />
    </div>

    <div v-if="order" class="vv__picker">
      <NFieldCard label="발급된 eSIM" :value="pickerLabel" active @click="isSheetOpen = true" />
    </div>

    <div v-if="activeEsim" class="vv__esim">
      <div class="vv__esim-head">
        <NStatusPill color="success" dot>발급완료</NStatusPill>
      </div>

      <div id="qr-pick" class="vv__qr">
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

    <NBottomSheet v-if="order" v-model="isSheetOpen" title="eSIM 선택">
      <div class="vv__sheet-list">
        <button
          v-for="(esim, idx) in order.esims"
          :key="idx"
          type="button"
          class="vv__sheet-row"
          :class="{ 'vv__sheet-row--active': activeIdx === idx }"
          @click="onPick(idx)"
        >
          <span class="vv__sheet-num">eSIM {{ idx + 1 }}</span>
          <span class="vv__sheet-code">{{ esim.manualCode.slice(-8) }}</span>
          <NStatusPill color="success" dot>발급완료</NStatusPill>
        </button>
      </div>
    </NBottomSheet>
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

.vv__picker {
  margin-top: 22px;
}

.vv__esim {
  margin-top: 14px;
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

.vv__sheet-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vv__sheet-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 12px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease;
}
.vv__sheet-row:hover {
  background: #f8fafc;
}
.vv__sheet-row--active {
  background: var(--color-primary-50, #f3efff);
}
.vv__sheet-num {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.vv__sheet-code {
  flex: 1;
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
