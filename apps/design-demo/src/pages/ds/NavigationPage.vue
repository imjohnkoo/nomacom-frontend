<script setup lang="ts">
import { ref } from 'vue'
import {
  NLink,
  NBreadcrumb,
  NTabs,
  NPagination,
  NStepper,
  NNavigationMenu,
  NCommandPalette,
  NFooterColumns,
} from '@imjohnkoo/design-vue'

const tabVal = ref('overview')
const pageVal = ref(1)
const stepVal = ref(2)
const cmdOpen = ref(false)

const tabItems = [
  { label: '개요', value: 'overview' },
  { label: '분석', value: 'analytics' },
  { label: '설정', value: 'settings' },
  { label: '로그', value: 'logs', disabled: true },
]

const stepperItems = [
  { title: '정보 입력', description: '기본 정보를 입력합니다' },
  { title: '옵션 설정', description: '세부 옵션을 선택합니다' },
  { title: '검토', description: '입력 내용을 확인합니다' },
  { title: '완료', description: '작업이 완료되었습니다' },
]

const navMenuItems = [
  {
    label: '제품',
    children: [
      { label: '컴포넌트', href: '#', description: '68개 Vue 컴포넌트' },
      { label: '디자인 토큰', href: '#', description: 'Color, Typography, Spacing' },
      { label: '아이콘', href: '#', description: 'Lucide 아이콘 세트' },
    ],
  },
  {
    label: '문서',
    children: [
      { label: '시작하기', href: '#', description: '설치 및 설정 가이드' },
      { label: 'API 레퍼런스', href: '#', description: '컴포넌트 API 상세' },
    ],
  },
  { label: '블로그', href: '#' },
  { label: '가격', href: '#' },
]

const cmdItems = [
  {
    group: '페이지',
    items: [
      { label: '대시보드', value: 'dashboard', shortcut: '⌘D' },
      { label: '설정', value: 'settings', shortcut: '⌘,' },
      { label: '사용자', value: 'users', shortcut: '⌘U' },
    ],
  },
  {
    group: '액션',
    items: [
      { label: '새 프로젝트', value: 'new-project', shortcut: '⌘N' },
      { label: '검색', value: 'search', shortcut: '⌘K' },
      { label: '로그아웃', value: 'logout' },
    ],
  },
]

const footerColumns = [
  {
    title: '제품',
    items: [
      { label: '컴포넌트', href: '#' },
      { label: '디자인 토큰', href: '#' },
      { label: '아이콘', href: '#' },
    ],
  },
  {
    title: '개발',
    items: [
      { label: '문서', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: '릴리즈 노트', href: '#' },
    ],
  },
  {
    title: '회사',
    items: [
      { label: '소개' },
      { label: '블로그' },
      { label: '채용', href: '#' },
    ],
  },
]
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Navigation</h1>
      <p class="text-sm text-(--ui-text-muted) mt-1">
        내비게이션 컴포넌트 — Breadcrumb, Tabs, Pagination, Stepper 등 8개 컴포넌트
      </p>
    </div>

    <!-- NLink -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NLink</h2>
      </template>
      <div class="flex items-center gap-6">
        <NLink href="#">기본 링크</NLink>
        <NLink href="#" color="neutral">Neutral 링크</NLink>
        <NLink href="#" :underline="false">밑줄 없음</NLink>
        <NLink href="https://example.com" external>외부 링크</NLink>
        <NLink href="#" disabled>비활성 링크</NLink>
      </div>
    </UCard>

    <!-- NBreadcrumb -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NBreadcrumb</h2>
      </template>
      <div class="space-y-4">
        <NBreadcrumb
          :items="[
            { label: 'Home', href: '#' },
            { label: '프로젝트', href: '#' },
            { label: 'Design System' },
          ]"
        />
        <NBreadcrumb
          separator="›"
          :items="[
            { label: 'Dashboard', href: '#' },
            { label: 'Users', href: '#' },
            { label: '김민수' },
          ]"
        />
      </div>
    </UCard>

    <!-- NTabs -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NTabs</h2>
      </template>
      <NTabs v-model="tabVal" :items="tabItems">
        <template #item-overview>
          <div class="p-4 text-sm text-(--ui-text-muted)">
            개요 탭 내용입니다. 프로젝트의 전반적인 현황을 보여줍니다.
          </div>
        </template>
        <template #item-analytics>
          <div class="p-4 text-sm text-(--ui-text-muted)">
            분석 탭 내용입니다. 사용 통계와 차트를 표시합니다.
          </div>
        </template>
        <template #item-settings>
          <div class="p-4 text-sm text-(--ui-text-muted)">
            설정 탭 내용입니다. 환경 설정을 관리합니다.
          </div>
        </template>
      </NTabs>
    </UCard>

    <!-- NPagination -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NPagination</h2>
      </template>
      <div class="space-y-4">
        <NPagination v-model="pageVal" :total="100" :per-page="10" show-first show-last />
        <p class="text-xs text-(--ui-text-muted)">현재 페이지: {{ pageVal }}</p>
      </div>
    </UCard>

    <!-- NStepper -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NStepper</h2>
      </template>
      <div class="space-y-4">
        <NStepper v-model="stepVal" :items="stepperItems" />
        <div class="flex gap-2">
          <UButton size="sm" variant="outline" :disabled="stepVal <= 1" @click="stepVal--">이전</UButton>
          <UButton size="sm" :disabled="stepVal >= stepperItems.length" @click="stepVal++">다음</UButton>
        </div>
      </div>
    </UCard>

    <!-- NNavigationMenu -->
    <UCard :ui="{ root: 'overflow-visible', body: 'overflow-visible' }">
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NNavigationMenu</h2>
      </template>
      <div class="border border-(--ui-border) rounded-lg p-2 overflow-visible">
        <NNavigationMenu :items="navMenuItems" />
      </div>
    </UCard>

    <!-- NCommandPalette -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NCommandPalette</h2>
      </template>
      <div class="space-y-2">
        <p class="text-sm text-(--ui-text-muted)">
          ⌘K 또는 아래 버튼으로 커맨드 팔레트를 열 수 있습니다.
        </p>
        <UButton @click="cmdOpen = true" variant="outline" size="sm">커맨드 팔레트 열기</UButton>
        <NCommandPalette
          v-model="cmdOpen"
          :items="cmdItems"
          placeholder="명령어 검색..."
          @select="(item: any) => { cmdOpen = false; console.log('Selected:', item) }"
        />
      </div>
    </UCard>

    <!-- NFooterColumns -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NFooterColumns</h2>
      </template>
      <div class="border border-(--ui-border) rounded-lg overflow-hidden">
        <NFooterColumns :columns="footerColumns" />
      </div>
    </UCard>
  </div>
</template>
