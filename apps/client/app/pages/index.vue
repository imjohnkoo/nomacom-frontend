<script setup lang="ts">
// Default landing page - can redirect to verify with order ID
const sampleOrderId = ref('');

const router = useRouter();

const navigateToVerify = () => {
  if (sampleOrderId.value) {
    router.push(`/verify/${sampleOrderId.value}`);
  }
};
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8">
    <div class="flex flex-col items-center gap-y-6 text-center">
      <img src="~/assets/icons/esimmany-logo.png" alt="eSIMMany" class="h-20 object-contain" />
      <h1 class="text-2xl font-bold text-gray-800">eSIMMany</h1>
      <p class="text-gray-600">eSIM QR코드 발급 서비스</p>

      <div class="mt-8 flex w-full flex-col gap-y-4">
        <div class="flex flex-col gap-y-2">
          <label for="orderId" class="text-sm font-medium text-gray-700">주문번호 입력</label>
          <input
            id="orderId"
            v-model="sampleOrderId"
            type="text"
            placeholder="주문번호를 입력하세요"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-center focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            @keyup.enter="navigateToVerify"
          />
        </div>

        <button
          type="button"
          :disabled="!sampleOrderId"
          :class="[
            'w-full rounded-lg px-4 py-3 text-lg font-semibold text-white transition-colors',
            sampleOrderId
              ? 'bg-cyan-600 hover:bg-cyan-700'
              : 'cursor-not-allowed bg-gray-400',
          ]"
          @click="navigateToVerify"
        >
          주문 확인하기
        </button>
      </div>
    </div>
  </div>
</template>
