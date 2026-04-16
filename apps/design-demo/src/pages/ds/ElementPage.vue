<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton,
  NBadge,
  NIcon,
  NKbd,
  NCard,
  NChip,
  NSkeleton,
  NAlert,
  NBanner,
  NAvatar,
  NAvatarGroup,
  NCollapsible,
  NProgress,
  NSeparator,
  NCalendar,
} from '@imjohnkoo/design-vue'

const collapsibleOpen = ref(false)
const calendarDate = ref('')
const bannerVisible = ref(true)
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Element</h1>
      <p class="text-sm text-(--ui-text-muted) mt-1">
        기본 UI 요소 — Button, Badge, Avatar, Card, Alert 등 15개 컴포넌트
      </p>
    </div>

    <!-- NButton -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NButton</h2>
      </template>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <NButton>Primary</NButton>
          <NButton variant="secondary">Secondary</NButton>
          <NButton variant="outline">Outline</NButton>
          <NButton variant="ghost">Ghost</NButton>
          <NButton variant="danger">Danger</NButton>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <NButton size="sm">Small</NButton>
          <NButton size="md">Medium</NButton>
          <NButton size="lg">Large</NButton>
        </div>
        <div class="flex flex-wrap gap-3">
          <NButton loading>로딩중</NButton>
          <NButton disabled>비활성</NButton>
          <NButton full-width>Full Width</NButton>
        </div>
      </div>
    </UCard>

    <!-- NBadge -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NBadge</h2>
      </template>
      <div class="space-y-4">
        <p class="text-xs text-(--ui-text-muted)">Solid</p>
        <div class="flex flex-wrap gap-3">
          <NBadge label="Primary" color="primary" />
          <NBadge label="Success" color="success" />
          <NBadge label="Warning" color="warning" />
          <NBadge label="Error" color="error" />
          <NBadge label="Info" color="info" />
          <NBadge label="Neutral" color="neutral" />
        </div>
        <p class="text-xs text-(--ui-text-muted)">Subtle / Outline</p>
        <div class="flex flex-wrap gap-3">
          <NBadge label="Subtle" variant="subtle" color="primary" />
          <NBadge label="Subtle" variant="subtle" color="success" />
          <NBadge label="Outline" variant="outline" color="error" />
          <NBadge label="Outline" variant="outline" color="info" />
        </div>
        <p class="text-xs text-(--ui-text-muted)">Sizes</p>
        <div class="flex flex-wrap gap-3 items-center">
          <NBadge label="XS" size="xs" />
          <NBadge label="SM" size="sm" />
          <NBadge label="MD" size="md" />
        </div>
      </div>
    </UCard>

    <!-- NAvatar / NAvatarGroup -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NAvatar / NAvatarGroup</h2>
      </template>
      <div class="space-y-4">
        <p class="text-xs text-(--ui-text-muted)">Sizes</p>
        <div class="flex items-center gap-4">
          <NAvatar text="JK" size="xs" />
          <NAvatar text="AB" size="sm" />
          <NAvatar text="CD" size="md" />
          <NAvatar text="EF" size="lg" />
          <NAvatar text="GH" size="xl" />
        </div>
        <p class="text-xs text-(--ui-text-muted)">이미지</p>
        <div class="flex items-center gap-4">
          <NAvatar src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix" size="lg" />
          <NAvatar src="https://api.dicebear.com/9.x/notionists/svg?seed=Luna" size="lg" />
        </div>
        <p class="text-xs text-(--ui-text-muted)">AvatarGroup</p>
        <NAvatarGroup :max="4">
          <NAvatar text="A" />
          <NAvatar text="B" />
          <NAvatar text="C" />
          <NAvatar text="D" />
          <NAvatar text="E" />
          <NAvatar text="F" />
        </NAvatarGroup>
      </div>
    </UCard>

    <!-- NCard -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NCard</h2>
      </template>
      <div class="grid grid-cols-3 gap-4">
        <NCard variant="outline">
          <template #header>
            <span class="text-sm font-medium">Outline</span>
          </template>
          카드 본문 내용입니다.
          <template #footer>
            <span class="text-xs text-(--ui-text-muted)">Footer</span>
          </template>
        </NCard>
        <NCard variant="soft">
          <template #header>
            <span class="text-sm font-medium">Soft</span>
          </template>
          카드 본문 내용입니다.
        </NCard>
        <NCard variant="elevated">
          <template #header>
            <span class="text-sm font-medium">Elevated</span>
          </template>
          카드 본문 내용입니다.
        </NCard>
      </div>
    </UCard>

    <!-- NIcon / NKbd -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NIcon / NKbd</h2>
      </template>
      <div class="space-y-4">
        <p class="text-xs text-(--ui-text-muted)">NIcon (CSS 클래스 기반)</p>
        <div class="flex items-center gap-4">
          <NIcon name="i-lucide-home" size="sm" />
          <NIcon name="i-lucide-settings" size="md" />
          <NIcon name="i-lucide-bell" size="lg" />
          <NIcon name="i-lucide-heart" size="xl" />
        </div>
        <p class="text-xs text-(--ui-text-muted)">NKbd</p>
        <div class="flex items-center gap-3">
          <NKbd value="⌘" size="xs" />
          <NKbd value="K" size="sm" />
          <NKbd value="Enter" size="md" />
          <span class="text-sm text-(--ui-text-muted)">← ⌘ + K 로 검색</span>
        </div>
      </div>
    </UCard>

    <!-- NChip -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NChip</h2>
      </template>
      <div class="flex flex-wrap gap-2">
        <NChip label="Vue" color="primary" />
        <NChip label="React" color="info" />
        <NChip label="TypeScript" color="success" closable @close="() => {}" />
        <NChip label="JavaScript" color="warning" closable @close="() => {}" />
        <NChip label="Deprecated" color="error" closable @close="() => {}" />
      </div>
    </UCard>

    <!-- NAlert -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NAlert</h2>
      </template>
      <div class="space-y-3">
        <NAlert title="정보" description="시스템 업데이트가 예정되어 있습니다." color="info" />
        <NAlert title="성공" description="파일이 성공적으로 업로드되었습니다." color="success" />
        <NAlert title="경고" description="저장 공간이 부족합니다." color="warning" />
        <NAlert title="오류" description="네트워크 연결에 실패했습니다." color="error" closable @close="() => {}" />
      </div>
    </UCard>

    <!-- NBanner -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NBanner</h2>
      </template>
      <div class="space-y-3">
        <NBanner
          v-if="bannerVisible"
          title="새로운 기능"
          description="v2.0이 출시되었습니다. 업데이트를 확인하세요."
          color="primary"
          closable
          @close="bannerVisible = false"
        />
        <NBanner title="점검 예정" description="내일 02:00 ~ 04:00 서버 점검" color="warning" />
        <UButton v-if="!bannerVisible" size="sm" variant="outline" @click="bannerVisible = true">배너 다시 보기</UButton>
      </div>
    </UCard>

    <!-- NSkeleton -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NSkeleton</h2>
      </template>
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <NSkeleton width="48px" height="48px" rounded />
          <div class="flex-1 space-y-2">
            <NSkeleton height="16px" width="60%" />
            <NSkeleton height="12px" width="40%" />
          </div>
        </div>
        <NSkeleton height="120px" width="100%" />
        <div class="flex gap-3">
          <NSkeleton height="32px" width="80px" />
          <NSkeleton height="32px" width="80px" />
        </div>
      </div>
    </UCard>

    <!-- NSeparator -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NSeparator</h2>
      </template>
      <div class="space-y-4">
        <p class="text-sm">위 내용</p>
        <NSeparator />
        <p class="text-sm">아래 내용</p>
        <div class="flex items-center gap-4 h-8">
          <span class="text-sm">항목 A</span>
          <NSeparator orientation="vertical" />
          <span class="text-sm">항목 B</span>
          <NSeparator orientation="vertical" />
          <span class="text-sm">항목 C</span>
        </div>
      </div>
    </UCard>

    <!-- NProgress -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NProgress</h2>
      </template>
      <div class="space-y-4">
        <div v-for="c in (['primary', 'success', 'warning', 'error', 'info'] as const)" :key="c" class="space-y-1">
          <p class="text-xs text-(--ui-text-muted) capitalize">{{ c }}</p>
          <NProgress :model-value="30 + Math.random() * 50" :color="c" />
        </div>
        <p class="text-xs text-(--ui-text-muted)">Sizes</p>
        <NProgress :model-value="70" size="sm" />
        <NProgress :model-value="70" size="md" />
        <NProgress :model-value="70" size="lg" />
      </div>
    </UCard>

    <!-- NCollapsible -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NCollapsible</h2>
      </template>
      <NCollapsible v-model="collapsibleOpen">
        <template #trigger>
          <NButton variant="outline" size="sm">{{ collapsibleOpen ? '접기' : '펼치기' }}</NButton>
        </template>
        <div class="mt-3 p-4 rounded-lg bg-(--color-neutral-50, #fafafa)">
          <p class="text-sm">접을 수 있는 콘텐츠 영역입니다. NCollapsible은 Reka UI Collapsible 프리미티브를 사용합니다.</p>
        </div>
      </NCollapsible>
    </UCard>

    <!-- NCalendar -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">NCalendar</h2>
      </template>
      <div class="flex items-start gap-6">
        <NCalendar v-model="calendarDate" />
        <div class="text-sm text-(--ui-text-muted)">
          선택된 날짜: <strong>{{ calendarDate || '없음' }}</strong>
        </div>
      </div>
    </UCard>
  </div>
</template>
