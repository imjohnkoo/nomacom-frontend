<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('general')

const tabs = [
  { label: '일반', value: 'general', icon: 'i-lucide-settings' },
  { label: '알림', value: 'notifications', icon: 'i-lucide-bell' },
  { label: '보안', value: 'security', icon: 'i-lucide-shield' },
]

// General
const siteName = ref('Nomacom')
const siteDescription = ref('차세대 SaaS 플랫폼')
const language = ref('ko')
const timezone = ref('asia-seoul')

const languageOptions = [
  { label: '한국어', value: 'ko' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
]

const timezoneOptions = [
  { label: 'Asia/Seoul (KST, UTC+9)', value: 'asia-seoul' },
  { label: 'Asia/Tokyo (JST, UTC+9)', value: 'asia-tokyo' },
  { label: 'America/New_York (EST, UTC-5)', value: 'america-newyork' },
]

// Notifications
const emailNotif = ref(true)
const pushNotif = ref(true)
const weeklyReport = ref(false)
const marketingEmail = ref(false)

// Security
const twoFactor = ref(false)
const sessionTimeout = ref('30')

const sessionOptions = [
  { label: '15분', value: '15' },
  { label: '30분', value: '30' },
  { label: '1시간', value: '60' },
  { label: '4시간', value: '240' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">설정</h1>
      <p class="text-sm text-(--ui-text-muted) mt-1">애플리케이션 환경을 설정하세요</p>
    </div>

    <!-- Tabs -->
    <UTabs v-model="activeTab" :items="tabs" />

    <!-- General -->
    <div v-if="activeTab === 'general'" class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-(--ui-text-highlighted)">기본 정보</h3>
        </template>
        <div class="space-y-5 max-w-lg">
          <UFormField label="사이트 이름">
            <UInput v-model="siteName" />
          </UFormField>
          <UFormField label="설명">
            <UTextarea v-model="siteDescription" :rows="2" />
          </UFormField>
          <UFormField label="언어">
            <USelect v-model="language" :items="languageOptions" />
          </UFormField>
          <UFormField label="시간대">
            <USelect v-model="timezone" :items="timezoneOptions" />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton label="저장" />
          </div>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold text-(--ui-text-highlighted)">위험 구역</h3>
            <p class="text-sm text-(--ui-text-muted) mt-1">되돌릴 수 없는 작업입니다</p>
          </div>
        </template>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-(--ui-text-highlighted)">사이트 데이터 초기화</p>
            <p class="text-sm text-(--ui-text-muted)">모든 데이터가 영구적으로 삭제됩니다</p>
          </div>
          <UButton label="초기화" color="error" variant="soft" />
        </div>
      </UCard>
    </div>

    <!-- Notifications -->
    <div v-if="activeTab === 'notifications'" class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-(--ui-text-highlighted)">알림 설정</h3>
        </template>
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">이메일 알림</p>
              <p class="text-sm text-(--ui-text-muted)">중요 업데이트를 이메일로 받습니다</p>
            </div>
            <USwitch v-model="emailNotif" />
          </div>
          <USeparator />
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">푸시 알림</p>
              <p class="text-sm text-(--ui-text-muted)">브라우저 푸시 알림을 활성화합니다</p>
            </div>
            <USwitch v-model="pushNotif" />
          </div>
          <USeparator />
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">주간 리포트</p>
              <p class="text-sm text-(--ui-text-muted)">매주 월요일 요약 리포트를 받습니다</p>
            </div>
            <USwitch v-model="weeklyReport" />
          </div>
          <USeparator />
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">마케팅 이메일</p>
              <p class="text-sm text-(--ui-text-muted)">신규 기능 및 프로모션 소식을 받습니다</p>
            </div>
            <USwitch v-model="marketingEmail" />
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton label="저장" />
          </div>
        </template>
      </UCard>
    </div>

    <!-- Security -->
    <div v-if="activeTab === 'security'" class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-(--ui-text-highlighted)">보안 설정</h3>
        </template>
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">2단계 인증</p>
              <p class="text-sm text-(--ui-text-muted)">
                로그인 시 추가 인증을 요구합니다
              </p>
            </div>
            <USwitch v-model="twoFactor" />
          </div>
          <USeparator />
          <div class="max-w-xs">
            <UFormField label="세션 만료 시간">
              <USelect v-model="sessionTimeout" :items="sessionOptions" />
            </UFormField>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton label="저장" />
          </div>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-(--ui-text-highlighted)">비밀번호 변경</h3>
        </template>
        <div class="space-y-4 max-w-lg">
          <UFormField label="현재 비밀번호">
            <UInput type="password" placeholder="현재 비밀번호" />
          </UFormField>
          <UFormField label="새 비밀번호">
            <UInput type="password" placeholder="새 비밀번호" />
          </UFormField>
          <UFormField label="비밀번호 확인">
            <UInput type="password" placeholder="새 비밀번호 확인" />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton label="비밀번호 변경" />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
