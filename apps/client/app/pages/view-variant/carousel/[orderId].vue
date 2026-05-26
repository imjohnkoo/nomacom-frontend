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

const trackRef = ref<HTMLElement | null>(null)
const activeIdx = ref(0)

const onScroll = () => {
  if (!trackRef.value) return
  const w = trackRef.value.clientWidth
  activeIdx.value = Math.round(trackRef.value.scrollLeft / w)
}

const goTo = (idx: number) => {
  if (!trackRef.value) return
  trackRef.value.scrollTo({ left: idx * trackRef.value.clientWidth, behavior: 'smooth' })
}

const downloadQR = (index: number) => {
  const canvas = document.querySelector(`#qr-car-${index} canvas`) as HTMLCanvasElement
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
        eyebrow="Carousel 패턴"
        :title="`좌우 swipe 으로\n넘겨가며 보기`"
        description="모바일 swipe / dot pagination. QR 카드가 카드 단위로 snap."
      />
    </div>

    <div class="vv__chip-row">
      <NInfoChip label="주문번호" :value="String(orderId)" />
      <NInfoChip v-if="order" :value="`${order.planNameKr} · ${order.esims.length}개`" />
    </div>

    <div v-if="order" class="vv__carousel">
      <div ref="trackRef" class="vv__track" @scroll.passive="onScroll">
        <article v-for="(esim, idx) in order.esims" :key="idx" class="vv__slide">
          <div class="vv__esim">
            <div class="vv__esim-head">
              <NStatusPill color="success" dot>발급완료</NStatusPill>
              <span class="vv__index">{{ idx + 1 }} / {{ order.esims.length }}</span>
            </div>

            <div :id="`qr-car-${idx}`" class="vv__qr">
              <ClientOnly>
                <QRCodeVue3 :value="esim.activationCode" :width="200" :height="200" :margin="2" />
                <template #fallback>
                  <div class="vv__qr-skel" />
                </template>
              </ClientOnly>
            </div>

            <div class="vv__download">
              <NButton variant="secondary" size="md" @click="downloadQR(idx)">
                QR 다운로드
              </NButton>
            </div>

            <div class="vv__codes">
              <NCodeRow label="SM-DP+" :value="esim.smdpAddress" />
              <NCodeRow label="활성화 코드" :value="esim.manualCode" />
              <NCodeRow label="LPA 전체" :value="esim.activationCode" />
            </div>
          </div>
        </article>
      </div>

      <div class="vv__dots">
        <button
          v-for="(_, idx) in order.esims"
          :key="idx"
          type="button"
          class="vv__dot"
          :class="{ 'vv__dot--active': activeIdx === idx }"
          :aria-label="`${idx + 1}번 esim 으로 이동`"
          @click="goTo(idx)"
        />
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

.vv__carousel {
  margin-top: 20px;
}

.vv__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  gap: 0;
}
.vv__track::-webkit-scrollbar {
  display: none;
}

.vv__slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  padding: 0 2px;
  box-sizing: border-box;
}

.vv__esim {
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
  width: 200px;
  height: 200px;
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

.vv__dots {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.vv__dot {
  width: 6px;
  height: 6px;
  border: 0;
  padding: 0;
  border-radius: 50%;
  background: #e5e7eb;
  cursor: pointer;
  transition:
    width 160ms ease,
    background 160ms ease;
}
.vv__dot--active {
  width: 18px;
  background: var(--color-primary-500, #6239ff);
  border-radius: 999px;
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
