<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border)">
      <h1 class="text-lg font-bold text-(--ui-text-highlighted)">프로필</h1>
      <UButton icon="i-lucide-settings" variant="ghost" color="neutral" size="sm" @click="router.push('/settings')" />
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Profile header -->
      <div class="flex flex-col items-center py-4">
        <UAvatar
          src="https://i.pravatar.cc/150?u=john"
          size="xl"
        />
        <h2 class="text-xl font-bold text-(--ui-text-highlighted) mt-3">김민수</h2>
        <p class="text-sm text-(--ui-text-muted)">@minsu.kim</p>
        <div class="flex gap-2 mt-2">
          <UBadge label="개발자" variant="subtle" />
          <UBadge label="PRO" color="success" size="xs" />
        </div>
      </div>

      <!-- Stats -->
      <UCard variant="soft" class="my-4">
        <div class="flex justify-around text-center">
          <div>
            <p class="text-xl font-bold text-(--ui-text-highlighted)">128</p>
            <p class="text-xs text-(--ui-text-muted)">게시물</p>
          </div>
          <div>
            <p class="text-xl font-bold text-(--ui-text-highlighted)">1.2K</p>
            <p class="text-xs text-(--ui-text-muted)">팔로워</p>
          </div>
          <div>
            <p class="text-xl font-bold text-(--ui-text-highlighted)">340</p>
            <p class="text-xs text-(--ui-text-muted)">팔로잉</p>
          </div>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex gap-2.5 mb-4">
        <UButton label="메시지" block class="flex-1" @click="router.push('/chat')" />
        <UButton label="팔로우" variant="outline" block class="flex-1" />
      </div>

      <USeparator class="my-4" />

      <!-- Info -->
      <UCard variant="outline">
        <div class="space-y-3.5">
          <div class="flex justify-between">
            <span class="text-sm text-(--ui-text-muted)">이메일</span>
            <span class="text-sm text-(--ui-text-highlighted)">minsu@nomacom.co</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-(--ui-text-muted)">위치</span>
            <span class="text-sm text-(--ui-text-highlighted)">서울, 대한민국</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-(--ui-text-muted)">가입일</span>
            <span class="text-sm text-(--ui-text-highlighted)">2024년 3월</span>
          </div>
        </div>
      </UCard>

      <div class="h-4" />
    </div>
  </div>
</template>
