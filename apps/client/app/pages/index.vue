<script setup lang="ts">
const healthEndpoint = '/api/health'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8 text-center">
    <div class="flex flex-col items-center gap-y-4">
      <NLogo variant="kor" size="lg" />
      <span class="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-red-600">
        staging
      </span>
      <h1 class="text-lg font-semibold text-gray-800">Nomacom Client</h1>
      <p class="text-sm text-gray-600">이 화면은 배포 파이프라인 검증용 깡통 빌드입니다.</p>
      <p class="mt-4 text-xs text-gray-500">
        Health endpoint: <a :href="healthEndpoint" class="text-cyan-600 hover:underline">{{ healthEndpoint }}</a>
      </p>
    </div>
  </div>
</template>
