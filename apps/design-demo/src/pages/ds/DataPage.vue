<script setup lang="ts">
import { ref } from 'vue'
import {
  NAccordion,
  NScrollArea,
  NTree,
  NTable,
  NTimeline,
  NEmpty,
  NUser,
  NMarquee,
  NCarousel,
} from '@imjohnkoo/design-vue'

const accordionVal = ref('')
const treeVal = ref('')

const accordionItems = [
  { value: 'item1', title: '기능 소개', content: 'Nomacom Design System은 Vue 3 기반의 컴포넌트 라이브러리입니다. Reka UI 헤드리스 프리미티브와 커스텀 디자인 토큰 CSS를 결합합니다.' },
  { value: 'item2', title: '설치 방법', content: 'pnpm add @imjohnkoo/design-vue 명령으로 설치할 수 있습니다. Vue 3.5 이상이 필요합니다.' },
  { value: 'item3', title: '사용 가이드', content: '각 컴포넌트는 import { NButton } from "@imjohnkoo/design-vue" 형태로 tree-shaking 가능하게 불러올 수 있습니다.' },
]

const treeItems = [
  {
    label: 'src',
    value: 'src',
    children: [
      {
        label: 'components',
        value: 'components',
        children: [
          { label: 'NButton.vue', value: 'nbutton' },
          { label: 'NCard.vue', value: 'ncard' },
          { label: 'NInput.vue', value: 'ninput' },
        ],
      },
      {
        label: 'composables',
        value: 'composables',
        children: [
          { label: 'useTheme.ts', value: 'usetheme' },
          { label: 'useForm.ts', value: 'useform' },
        ],
      },
      { label: 'index.ts', value: 'index' },
    ],
  },
]

const tableColumns = [
  { key: 'name', label: '이름' },
  { key: 'role', label: '역할' },
  { key: 'email', label: '이메일' },
  { key: 'status', label: '상태' },
]

const tableData = [
  { name: '김민수', role: '개발자', email: 'minsu@nomacom.co', status: '활성' },
  { name: '이서연', role: '디자이너', email: 'seoyeon@nomacom.co', status: '활성' },
  { name: '박지호', role: '기획자', email: 'jiho@nomacom.co', status: '휴직' },
  { name: '최유진', role: '마케터', email: 'yujin@nomacom.co', status: '활성' },
  { name: '정태현', role: '개발자', email: 'taehyun@nomacom.co', status: '퇴사' },
]

const timelineItems = [
  { title: '프로젝트 시작', description: '디자인 시스템 프로젝트가 시작되었습니다.', time: '2024-01', color: 'primary' as const },
  { title: '디자인 토큰 완성', description: 'Color, Typography, Spacing 토큰 정의 완료', time: '2024-03', color: 'success' as const },
  { title: 'Vue 컴포넌트 개발', description: '68개 컴포넌트 구현 시작', time: '2024-06', color: 'info' as const },
  { title: 'v1.0 릴리즈', description: '첫 번째 정식 버전 출시 예정', time: '2024-09', color: 'warning' as const },
]
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Data</h1>
      <p class="text-sm text-(--ui-text-muted) mt-1">
        데이터 표시 컴포넌트 — Accordion, Table, Timeline, Tree 등 9개 컴포넌트
      </p>
    </div>

    <!-- NAccordion -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NAccordion</h2>
      </template>
      <NAccordion v-model="accordionVal" :items="accordionItems" />
    </UCard>

    <!-- NTable -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NTable</h2>
      </template>
      <div class="space-y-4">
        <p class="text-xs text-(--ui-text-muted)">기본 (striped + hoverable)</p>
        <NTable :columns="tableColumns" :data="tableData" striped hoverable />
      </div>
    </UCard>

    <!-- NTimeline -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NTimeline</h2>
      </template>
      <NTimeline :items="timelineItems" />
    </UCard>

    <!-- NTree -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NTree</h2>
      </template>
      <NTree v-model="treeVal" :items="treeItems" />
      <p class="text-xs text-(--ui-text-muted) mt-2">선택: {{ treeVal || '없음' }}</p>
    </UCard>

    <!-- NScrollArea -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NScrollArea</h2>
      </template>
      <NScrollArea type="always" style="height: 200px;">
        <div class="p-4 space-y-2">
          <div v-for="i in 20" :key="i" class="p-3 rounded bg-(--color-neutral-50, #fafafa) text-sm">
            스크롤 아이템 {{ i }}
          </div>
        </div>
      </NScrollArea>
    </UCard>

    <!-- NUser -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NUser</h2>
      </template>
      <div class="space-y-4">
        <NUser name="김민수" description="Frontend Developer" size="sm" />
        <NUser name="이서연" description="UI/UX Designer" avatar="https://api.dicebear.com/9.x/notionists/svg?seed=Luna" size="md" />
        <NUser name="박지호" description="Product Manager" size="lg" />
      </div>
    </UCard>

    <!-- NEmpty -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NEmpty</h2>
      </template>
      <div class="grid grid-cols-2 gap-4">
        <div class="border border-(--ui-border) rounded-lg p-4">
          <NEmpty />
        </div>
        <div class="border border-(--ui-border) rounded-lg p-4">
          <NEmpty title="검색 결과 없음" description="다른 검색어를 시도해보세요." />
        </div>
      </div>
    </UCard>

    <!-- NMarquee -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NMarquee</h2>
      </template>
      <NMarquee :speed="60" pause-on-hover>
        <span class="inline-flex items-center gap-8 text-sm text-(--ui-text-muted) px-4">
          <span>🚀 Nomacom Design System v1.0</span>
          <span>⚡ 68개 컴포넌트</span>
          <span>🎨 디자인 토큰 기반</span>
          <span>♿ 접근성 지원</span>
          <span>📦 Tree-shakeable</span>
        </span>
      </NMarquee>
    </UCard>

    <!-- NCarousel -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NCarousel</h2>
      </template>
      <NCarousel :autoplay="true" :interval="3000">
        <div
          v-for="(color, i) in ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444']"
          :key="i"
          class="flex items-center justify-center text-white font-bold text-2xl rounded-lg"
          :style="{ backgroundColor: color, height: '200px' }"
        >
          슬라이드 {{ i + 1 }}
        </div>
      </NCarousel>
    </UCard>
  </div>
</template>
