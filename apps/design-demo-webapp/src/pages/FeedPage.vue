<script setup lang="ts">
const feedData = [
  {
    id: '1',
    user: { name: '이서연', initials: 'SY', time: '3분 전' },
    content: '새로운 디자인 시스템 가이드라인을 업데이트했습니다. 피드백 부탁드려요!',
    likes: 24,
    comments: 8,
    badge: '공지',
  },
  {
    id: '2',
    user: { name: '박준혁', initials: 'JH', time: '15분 전' },
    content: 'v2.0 릴리즈 준비 완료! QA 팀에서 최종 검토 중입니다.',
    likes: 42,
    comments: 15,
  },
  {
    id: '3',
    user: { name: '최예진', initials: 'YJ', time: '1시간 전' },
    content: '이번 스프린트 회고 미팅 일정이 변경되었습니다. 내일 오후 3시로 확인해주세요.',
    likes: 11,
    comments: 3,
  },
  {
    id: '4',
    user: { name: '정도현', initials: 'DH', time: '2시간 전' },
    content: '모바일 앱 성능 최적화 작업 완료. 로딩 시간 40% 단축!',
    likes: 67,
    comments: 22,
    badge: '성과',
  },
]
</script>

<template>
  <div class="flex flex-col h-full bg-zinc-50">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 bg-white border-b border-(--ui-border)">
      <h1 class="text-lg font-bold text-(--ui-text-highlighted)">피드</h1>
      <UButton icon="i-lucide-bell" variant="ghost" color="neutral" size="sm" />
    </header>

    <!-- Feed list -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <UCard v-for="item in feedData" :key="item.id" variant="outline">
        <!-- User info -->
        <div class="flex items-center gap-2.5 mb-3">
          <UAvatar :text="item.user.initials" size="sm" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ item.user.name }}</span>
              <UBadge v-if="item.badge" :label="item.badge" variant="subtle" size="xs" />
            </div>
            <span class="text-xs text-(--ui-text-muted)">{{ item.user.time }}</span>
          </div>
        </div>

        <!-- Content -->
        <p class="text-sm text-(--ui-text) leading-relaxed">{{ item.content }}</p>

        <!-- Actions -->
        <USeparator class="my-3" />
        <div class="flex gap-5">
          <span class="text-xs text-(--ui-text-muted)">&#10084;&#65039; {{ item.likes }}</span>
          <span class="text-xs text-(--ui-text-muted)">&#128172; {{ item.comments }}</span>
          <span class="text-xs text-(--ui-text-muted)">&#8599;&#65039; 공유</span>
        </div>
      </UCard>

      <!-- Bottom spacing for scroll -->
      <div class="h-4" />
    </div>
  </div>
</template>
