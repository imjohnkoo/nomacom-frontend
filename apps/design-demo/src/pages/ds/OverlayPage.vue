<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton,
  NTooltip,
  NPopover,
  NModal,
  NDrawer,
  NSlideover,
  NDropdownMenu,
  NContextMenu,
  NToastProvider,
  useToast,
  NSeparator,
} from '@imjohnkoo/design-vue'

const modalOpen = ref(false)
const drawerOpen = ref(false)
const slideoverOpen = ref(false)

const toast = useToast()

function showToast(color: 'neutral' | 'success' | 'error' | 'warning' | 'info') {
  const titles: Record<string, string> = {
    neutral: '알림',
    success: '성공',
    error: '오류',
    warning: '경고',
    info: '정보',
  }
  toast.add({
    title: titles[color],
    description: `이것은 ${titles[color]} 토스트 메시지입니다.`,
    color,
  })
}

const dropdownItems = [
  [
    { label: '수정' },
    { label: '복사' },
    { label: '공유' },
  ],
  [
    { label: '삭제', color: 'error' },
  ],
]

const contextItems = [
  [
    { label: '뒤로 가기' },
    { label: '앞으로 가기' },
    { label: '새로고침' },
  ],
  [
    { label: '소스 보기' },
    { label: '검사' },
  ],
]
</script>

<template>
  <NToastProvider>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Overlay</h1>
        <p class="text-sm text-(--ui-text-muted) mt-1">
          오버레이 컴포넌트 — Tooltip, Popover, Modal, Drawer, Toast 등 8개 컴포넌트
        </p>
      </div>

      <!-- NTooltip -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NTooltip</h2>
        </template>
        <div class="flex gap-4">
          <NTooltip content="상단 툴팁" side="top">
            <NButton variant="outline" size="sm">Top</NButton>
          </NTooltip>
          <NTooltip content="하단 툴팁" side="bottom">
            <NButton variant="outline" size="sm">Bottom</NButton>
          </NTooltip>
          <NTooltip content="좌측 툴팁" side="left">
            <NButton variant="outline" size="sm">Left</NButton>
          </NTooltip>
          <NTooltip content="우측 툴팁" side="right">
            <NButton variant="outline" size="sm">Right</NButton>
          </NTooltip>
        </div>
      </UCard>

      <!-- NPopover -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NPopover</h2>
        </template>
        <div class="flex gap-4">
          <NPopover side="bottom" align="start">
            <NButton variant="outline" size="sm">팝오버 열기</NButton>
            <template #content>
              <div class="p-4 w-64">
                <p class="text-sm font-medium mb-2">팝오버 제목</p>
                <p class="text-xs text-(--ui-text-muted)">
                  팝오버는 클릭으로 열리는 오버레이 콘텐츠입니다.
                  폼이나 추가 정보를 표시할 수 있습니다.
                </p>
              </div>
            </template>
          </NPopover>
        </div>
      </UCard>

      <!-- NModal -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NModal</h2>
        </template>
        <NButton @click="modalOpen = true">모달 열기</NButton>
        <NModal v-model="modalOpen" title="모달 제목" description="모달 설명 텍스트입니다.">
          <template #body>
            <p class="text-sm text-(--ui-text-muted)">
              모달 본문 내용입니다. 폼이나 확인 다이얼로그 등에 활용됩니다.
            </p>
          </template>
          <template #footer>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <NButton variant="outline" @click="modalOpen = false">취소</NButton>
              <NButton @click="modalOpen = false">확인</NButton>
            </div>
          </template>
        </NModal>
      </UCard>

      <!-- NDrawer -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NDrawer</h2>
        </template>
        <div class="flex gap-3">
          <NButton variant="outline" @click="drawerOpen = true">드로어 (Right)</NButton>
        </div>
        <NDrawer v-model="drawerOpen" title="드로어 제목" description="오른쪽에서 슬라이드" side="right">
          <template #body>
            <div style="padding: 16px;">
              <p class="text-sm text-(--ui-text-muted)">
                드로어 본문 내용입니다. 사이드 패널로 상세 정보를 표시합니다.
              </p>
            </div>
          </template>
        </NDrawer>
      </UCard>

      <!-- NSlideover -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NSlideover</h2>
        </template>
        <NButton variant="outline" @click="slideoverOpen = true">슬라이드오버 열기</NButton>
        <NSlideover v-model="slideoverOpen" title="슬라이드오버" width="480px">
          <template #body>
            <div style="padding: 16px;">
              <p class="text-sm text-(--ui-text-muted)">
                전체 높이를 사용하는 우측 패널입니다. 상세 정보나 편집 폼에 적합합니다.
              </p>
            </div>
          </template>
        </NSlideover>
      </UCard>

      <!-- NDropdownMenu -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NDropdownMenu</h2>
        </template>
        <NDropdownMenu :items="dropdownItems">
          <NButton variant="outline" size="sm">옵션 ▾</NButton>
        </NDropdownMenu>
      </UCard>

      <!-- NContextMenu -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NContextMenu</h2>
        </template>
        <NContextMenu :items="contextItems">
          <div
            class="flex items-center justify-center h-32 border-2 border-dashed border-(--ui-border) rounded-lg text-sm text-(--ui-text-muted)"
          >
            이 영역을 우클릭하세요
          </div>
        </NContextMenu>
      </UCard>

      <!-- NToast -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-(--ui-text-highlighted)">NToast</h2>
        </template>
        <div class="flex flex-wrap gap-3">
          <NButton variant="outline" size="sm" @click="showToast('neutral')">기본</NButton>
          <NButton variant="outline" size="sm" @click="showToast('success')">성공</NButton>
          <NButton variant="outline" size="sm" @click="showToast('error')">오류</NButton>
          <NButton variant="outline" size="sm" @click="showToast('warning')">경고</NButton>
          <NButton variant="outline" size="sm" @click="showToast('info')">정보</NButton>
        </div>
      </UCard>
    </div>
  </NToastProvider>
</template>
