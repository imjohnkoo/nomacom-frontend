<script setup lang="ts">
import {
  NApp,
  NThemeNew,
  NContainer,
  NMain,
  NHeader,
  NFooter,
  NError,
} from '@imjohnkoo/design-vue'
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Layout</h1>
      <p class="text-sm text-(--ui-text-muted) mt-1">
        레이아웃 구성을 위한 컴포넌트 — NApp, NThemeNew, NContainer, NMain, NHeader, NFooter, NError
      </p>
    </div>

    <!-- NContainer -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NContainer</h2>
        <p class="text-xs text-(--ui-text-muted) mt-0.5">max-width 제약이 있는 센터링 컨테이너</p>
      </template>

      <div class="space-y-4">
        <div v-for="s in (['sm', 'md', 'lg', 'xl', 'full'] as const)" :key="s" class="bg-blue-50 rounded-lg p-1">
          <NContainer :size="s" class="bg-white border border-blue-200 rounded px-4 py-2 text-center">
            <span class="text-sm font-mono text-(--ui-text-muted)">NContainer size="{{ s }}"</span>
          </NContainer>
        </div>
      </div>
    </UCard>

    <!-- NHeader + NMain + NFooter -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NHeader / NMain / NFooter</h2>
        <p class="text-xs text-(--ui-text-muted) mt-0.5">페이지 구조를 구성하는 레이아웃 블록</p>
      </template>

      <div class="border border-(--ui-border) rounded-lg overflow-hidden" style="height: 320px; display: flex; flex-direction: column;">
        <NHeader :sticky="false">
          <div class="flex items-center justify-between w-full">
            <span class="font-semibold text-sm">NHeader (sticky)</span>
            <span class="text-xs text-(--ui-text-muted)">네비게이션, 로고 등</span>
          </div>
        </NHeader>

        <NMain>
          <div class="p-4">
            <p class="text-sm text-(--ui-text-muted) mb-2">NMain — flex: 1, overflow-y: auto</p>
            <div v-for="i in 8" :key="i" class="h-8 mb-2 rounded bg-(--color-neutral-100, #f5f5f5)" />
          </div>
        </NMain>

        <NFooter>
          <div class="flex items-center justify-between w-full">
            <span class="text-sm">NFooter</span>
            <span class="text-xs text-(--ui-text-muted)">© 2024 Nomacom</span>
          </div>
        </NFooter>
      </div>
    </UCard>

    <!-- NApp + NThemeNew -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NApp / NThemeNew</h2>
        <p class="text-xs text-(--ui-text-muted) mt-0.5">테마 컨텍스트를 제공하는 루트 / 로컬 스코프 래퍼</p>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <NApp default-mode="light">
          <div class="p-4 rounded-lg border border-(--ui-border) bg-white">
            <p class="text-sm font-medium mb-1">NApp (light)</p>
            <p class="text-xs text-(--ui-text-muted)">기본 라이트 모드</p>
          </div>
        </NApp>
        <NThemeNew mode="dark">
          <div class="p-4 rounded-lg bg-neutral-900 text-white">
            <p class="text-sm font-medium mb-1">NThemeNew (dark)</p>
            <p class="text-xs text-neutral-400">로컬 다크 스코프</p>
          </div>
        </NThemeNew>
      </div>
    </UCard>

    <!-- NError -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NError</h2>
        <p class="text-xs text-(--ui-text-muted) mt-0.5">에러 상태 표시 컴포넌트</p>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <div class="border border-(--ui-border) rounded-lg p-4">
          <NError @retry="() => {}" />
        </div>
        <div class="border border-(--ui-border) rounded-lg p-4">
          <NError
            title="페이지를 찾을 수 없습니다"
            description="요청하신 페이지가 존재하지 않거나 이동되었습니다."
            retry-label="홈으로 이동"
            @retry="() => {}"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
