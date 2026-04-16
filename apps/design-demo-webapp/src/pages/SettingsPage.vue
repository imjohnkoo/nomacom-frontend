<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

const pushNotif = ref(true)
const emailNotif = ref(false)
const biometric = ref(true)
const darkMode = ref(false)

function handleLogout() {
  logout()
  router.replace('/login')
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header -->
    <header class="flex items-center gap-3 px-4 py-3 border-b border-(--ui-border)">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="sm" @click="router.back()" />
      <h1 class="text-lg font-bold text-(--ui-text-highlighted)">설정</h1>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Account card -->
      <UCard variant="outline" class="mb-6">
        <div class="flex items-center gap-3">
          <UAvatar text="김" size="lg" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-(--ui-text-highlighted)">김민수</p>
            <p class="text-xs text-(--ui-text-muted)">minsu@nomacom.co</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="text-zinc-400" />
        </div>
      </UCard>

      <!-- Notifications -->
      <p class="text-xs font-semibold text-(--ui-text-muted) mb-2 uppercase tracking-wide">알림</p>
      <UCard variant="outline" class="mb-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">푸시 알림</p>
              <p class="text-xs text-(--ui-text-muted)">새로운 메시지 및 업데이트 알림</p>
            </div>
            <USwitch v-model="pushNotif" />
          </div>
          <USeparator />
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">이메일 알림</p>
              <p class="text-xs text-(--ui-text-muted)">주간 요약 및 뉴스레터</p>
            </div>
            <USwitch v-model="emailNotif" />
          </div>
        </div>
      </UCard>

      <!-- General -->
      <p class="text-xs font-semibold text-(--ui-text-muted) mb-2 uppercase tracking-wide">일반</p>
      <UCard variant="outline" class="mb-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">생체 인증</p>
              <p class="text-xs text-(--ui-text-muted)">Face ID / 지문으로 로그인</p>
            </div>
            <USwitch v-model="biometric" />
          </div>
          <USeparator />
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">다크 모드</p>
              <p class="text-xs text-(--ui-text-muted)">어두운 테마를 사용합니다</p>
            </div>
            <USwitch v-model="darkMode" />
          </div>
        </div>
      </UCard>

      <!-- Danger zone -->
      <p class="text-xs font-semibold text-(--ui-text-muted) mb-2 uppercase tracking-wide">계정</p>
      <UAlert
        color="warning"
        title="계정 삭제"
        description="계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다."
        icon="i-lucide-alert-triangle"
      />
      <UButton
        label="로그아웃"
        icon="i-lucide-log-out"
        variant="soft"
        color="error"
        block
        class="mt-3"
        @click="handleLogout"
      />

      <div class="h-8" />
    </div>
  </div>
</template>
