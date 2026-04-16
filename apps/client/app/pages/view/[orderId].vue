<script setup lang="ts">
import QRCodeVue3 from 'qrcode-vue3';
import { useOrderStore } from '~/stores/order';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const orderId = computed(() => Number(route.params.orderId));
const order = computed(() => orderStore.singleOrder);

// Download QR as PNG
const downloadQR = (index: number) => {
  const canvas = document.querySelector(`#qr-code-${index} canvas`) as HTMLCanvasElement;
  if (!canvas) return;

  const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
  const downloadLink = document.createElement('a');
  downloadLink.href = pngUrl;
  downloadLink.download = `qr-code-${index + 1}.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

// Open external URL
const openGuide = (url: string) => {
  window.open(url, '_blank');
};

// Check order on mount
onMounted(() => {
  if (!order.value) {
    router.push(`/verify/${orderId.value}`);
  }
});
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div
      class="flex h-72 flex-col justify-end rounded-b-2xl bg-cover bg-center p-4 pb-5"
      :style="{ backgroundImage: `url('/images/background-2.png')` }"
    >
      <p class="pb-2 text-sm text-white">4/4</p>
      <h1 class="pb-2 text-2xl font-semibold text-white">QR코드가 발행되었습니다.</h1>
      <p class="pb-1 text-xs text-white">주문번호</p>
      <p class="text-xs font-medium text-white">{{ orderId }}</p>
    </div>

    <!-- eSIM cards -->
    <template v-if="order && order.esims && order.esims.length > 0">
      <div
        v-for="(esim, index) in order.esims"
        :key="index"
        class="flex w-full flex-col px-2 py-4"
      >
        <div
          class="flex w-full flex-col items-center justify-center gap-y-6 rounded-2xl px-4 py-8 ring-1 ring-inset ring-gray-200"
        >
          <!-- QR Code -->
          <div class="flex w-full flex-col items-center justify-center gap-y-3">
            <p class="pb-1 text-sm font-medium text-gray-500">
              {{ index + 1 }}/{{ order.esims.length }}
            </p>
            <div
              :id="`qr-code-${index}`"
              class="flex w-fit flex-col items-center justify-center rounded-lg p-1.5 ring-1 ring-inset ring-black"
            >
              <QRCodeVue3
                :value="esim.activationCode"
                :width="250"
                :height="250"
                :margin="2"
              />
            </div>
          </div>

          <!-- Download button -->
          <NButton variant="primary" size="sm" @click="downloadQR(index)">
            QR코드 다운로드
          </NButton>

          <!-- Instructions -->
          <div class="flex w-full flex-col items-center justify-center gap-y-3 px-5">
            <p class="text-sm text-red-500">
              만약 QR코드 다운로드가 안되시면 스크린샷을 찍어 사진앱에 저장하세요.
            </p>
            <p class="text-sm text-gray-500">
              아래의 설치가이드를 참고해 이심 설치를 진행해 주세요.
            </p>
          </div>

          <!-- Guide buttons -->
          <div class="flex flex-col items-center justify-center gap-y-3">
            <NButton variant="primary" size="sm" @click="openGuide('https://esimmany.super.site')">
              <template #icon-left>
                <img src="~/assets/icons/apple.svg" alt="Apple" class="mb-0.5 h-4 w-4" />
              </template>
              아이폰 설치가이드 바로가기
            </NButton>
            <NButton variant="primary" size="sm" @click="openGuide('https://esimmany.super.site')">
              <template #icon-left>
                <img src="~/assets/icons/android.svg" alt="Android" class="mt-0.5 h-4 w-4" />
              </template>
              안드로이드 설치가이드 바로가기
            </NButton>
          </div>

          <!-- iPhone installation codes -->
          <div class="flex w-full flex-col items-center justify-center gap-y-3 px-5">
            <NSeparator>
              <div class="flex items-center gap-x-1">
                <img
                  src="~/assets/icons/apple.svg"
                  alt="Apple"
                  class="mb-0.5 h-4 w-4"
                />
                <span class="text-md font-medium text-gray-800">아이폰 설치 코드</span>
              </div>
            </NSeparator>

            <div class="flex w-full flex-col items-center justify-center">
              <!-- SM-DP+ Address -->
              <div class="flex w-full flex-row items-center justify-center">
                <div class="flex w-4/6 flex-col items-start justify-center gap-y-1 py-2">
                  <p class="text-xs font-bold text-gray-500">SM-DP+ 주소</p>
                  <p class="text-sm font-light text-gray-500">{{ esim.smdpAddress }}</p>
                </div>
                <div class="flex w-2/6 flex-col items-end justify-center py-2">
                  <NCopyButton
                    :value="esim.smdpAddress"
                    label="복사하기"
                    copied-text="복사됨"
                    variant="primary"
                    size="sm"
                  />
                </div>
              </div>

              <!-- Activation Code (iPhone) -->
              <div class="flex w-full flex-row items-center justify-center">
                <div class="flex w-4/6 flex-col items-start justify-center gap-y-1 py-2">
                  <p class="text-xs font-bold text-gray-500">활성화 코드</p>
                  <p class="text-xs font-light text-gray-500">{{ esim.manualCode }}</p>
                </div>
                <div class="flex w-2/6 flex-col items-end justify-center py-2">
                  <NCopyButton
                    :value="esim.manualCode"
                    label="복사하기"
                    copied-text="복사됨"
                    variant="primary"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Android installation codes -->
          <div class="flex w-full flex-col items-center justify-center gap-y-3 px-5">
            <NSeparator>
              <div class="flex items-center gap-x-1">
                <img
                  src="~/assets/icons/android.svg"
                  alt="Android"
                  class="h-4 w-4"
                />
                <span class="text-md font-medium text-gray-800">안드로이드 설치 코드</span>
              </div>
            </NSeparator>

            <!-- Activation Code (Android) -->
            <div class="flex w-full flex-row items-center justify-center">
              <div class="flex w-4/6 flex-col items-start justify-center gap-y-1 py-2">
                <p class="text-xs font-bold text-gray-500">활성화 코드</p>
                <p class="flex break-all text-xs font-light text-gray-500">
                  {{ esim.activationCode }}
                </p>
              </div>
              <div class="flex w-2/6 flex-col items-end justify-center py-2">
                <NCopyButton
                  :value="esim.activationCode"
                  label="복사하기"
                  copied-text="복사됨"
                  variant="primary"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
