<script setup lang="ts">
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

      <form class="mt-8 flex w-full flex-col gap-y-4" @submit.prevent="navigateToVerify">
        <NFormField label="주문번호 입력">
          <NInput v-model="sampleOrderId" placeholder="주문번호를 입력하세요" />
        </NFormField>

        <NButton type="submit" variant="primary" size="lg" full-width :disabled="!sampleOrderId">
          주문 확인하기
        </NButton>
      </form>
    </div>
  </div>
</template>
