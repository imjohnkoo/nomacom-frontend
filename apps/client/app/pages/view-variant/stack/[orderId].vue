<script setup lang="ts">
import QRCodeVue3 from 'qrcode-vue3'
import {
  NStepProgress,
  NPageHeading,
  NInfoChip,
  NStatusPill,
  NCodeRow,
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

const downloadQR = (index: number) => {
  const canvas = document.querySelector(`#qr-stack-${index} canvas`) as HTMLCanvasElement
  if (!canvas) return
  const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
  const a = document.createElement('a')
  a.href = pngUrl
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
        eyebrow="Stack 패턴"
        :title="`QR 6개를\n모두 펼쳐 보여주기`"
        description="각 esim 마다 QR + 다운로드 + 코드 + 가이드를 풀카드로 반복."
      />
    </div>

    <div class="vv__chip-row">
      <NInfoChip label="주문번호" :value="String(orderId)" />
      <NInfoChip v-if="order" :value="`${order.planNameKr} · ${order.esims.length}개`" />
    </div>

    <template v-if="order && order.esims.length">
      <div v-for="(esim, index) in order.esims" :key="index" class="vv__esim">
        <div class="vv__esim-head">
          <NStatusPill color="success" dot>발급완료</NStatusPill>
          <span class="vv__index">{{ index + 1 }} / {{ order.esims.length }}</span>
        </div>

        <div :id="`qr-stack-${index}`" class="vv__qr">
          <ClientOnly>
            <QRCodeVue3 :value="esim.activationCode" :width="200" :height="200" :margin="2" />
            <template #fallback>
              <div class="vv__qr-skel" />
            </template>
          </ClientOnly>
        </div>

        <div class="vv__download">
          <NButton variant="secondary" size="md" @click="downloadQR(index)"> QR 다운로드 </NButton>
        </div>

        <div class="vv__codes">
          <NCodeRow label="SM-DP+ 주소" :value="esim.smdpAddress" />
          <NCodeRow label="활성화 코드" :value="esim.manualCode" />
          <NCodeRow label="LPA 전체" :value="esim.activationCode" />
        </div>
      </div>
    </template>

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
.vv__notes {
  margin-top: 20px;
}
.vv__back {
  margin-top: 24px;
}
</style>
