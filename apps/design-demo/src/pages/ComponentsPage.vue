<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')
const textareaValue = ref('')
const selectValue = ref('')
const switchValue = ref(false)
const checkboxValue = ref(false)
const sliderValue = ref([50])
const radioValue = ref('option1')

const selectOptions = [
  { label: '옵션 1', value: 'option1' },
  { label: '옵션 2', value: 'option2' },
  { label: '옵션 3', value: 'option3' },
]

const toastOpen = ref(false)
const modalOpen = ref(false)
const drawerOpen = ref(false)

const tabs = [
  { label: '개요', value: 'overview', icon: 'i-lucide-eye' },
  { label: '분석', value: 'analytics', icon: 'i-lucide-bar-chart-3' },
  { label: '설정', value: 'settings', icon: 'i-lucide-settings' },
]

const dropdownItems = [
  [
    { label: '수정', icon: 'i-lucide-pencil' },
    { label: '복사', icon: 'i-lucide-copy' },
  ],
  [
    { label: '삭제', icon: 'i-lucide-trash-2', color: 'error' as const },
  ],
]
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">컴포넌트 쇼케이스</h1>
      <p class="text-sm text-(--ui-text-muted) mt-1">
        Nuxt UI 기반 Nomacom Design System 컴포넌트 목록
      </p>
    </div>

    <!-- Buttons -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Button</h2>
      </template>

      <div class="space-y-4">
        <div class="flex flex-wrap gap-3">
          <UButton label="Primary" />
          <UButton label="Secondary" color="neutral" variant="outline" />
          <UButton label="Soft" variant="soft" />
          <UButton label="Ghost" variant="ghost" />
          <UButton label="Link" variant="link" />
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton label="Small" size="sm" />
          <UButton label="Medium" size="md" />
          <UButton label="Large" size="lg" />
          <UButton label="XLarge" size="xl" />
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-plus" label="아이콘" />
          <UButton icon="i-lucide-loader" label="로딩" loading />
          <UButton icon="i-lucide-ban" label="비활성" disabled />
        </div>
      </div>
    </UCard>

    <!-- Badge -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Badge</h2>
      </template>

      <div class="flex flex-wrap gap-3">
        <UBadge label="Default" />
        <UBadge label="Subtle" variant="subtle" />
        <UBadge label="Success" color="success" />
        <UBadge label="Warning" color="warning" />
        <UBadge label="Error" color="error" />
        <UBadge label="Info" color="info" />
      </div>
    </UCard>

    <!-- Avatar -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Avatar</h2>
      </template>

      <div class="flex items-center gap-4">
        <UAvatar text="JK" size="sm" />
        <UAvatar text="AB" size="md" />
        <UAvatar text="CD" size="lg" />
        <UAvatar
          src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix"
          size="lg"
        />
        <UAvatarGroup>
          <UAvatar text="A" />
          <UAvatar text="B" />
          <UAvatar text="C" />
          <UAvatar text="+5" />
        </UAvatarGroup>
      </div>
    </UCard>

    <!-- Form Elements -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Form</h2>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="텍스트 입력" hint="필수">
          <UInput v-model="inputValue" placeholder="이름을 입력하세요" icon="i-lucide-user" />
        </UFormField>

        <UFormField label="선택">
          <USelect
            v-model="selectValue"
            :items="selectOptions"
            placeholder="옵션을 선택하세요"
          />
        </UFormField>

        <UFormField label="텍스트 영역" class="md:col-span-2">
          <UTextarea v-model="textareaValue" placeholder="내용을 입력하세요" :rows="3" />
        </UFormField>

        <div class="flex items-center gap-8">
          <USwitch v-model="switchValue" label="알림 설정" />
          <UCheckbox v-model="checkboxValue" label="약관 동의" />
        </div>

        <UFormField label="라디오 그룹">
          <URadioGroup
            v-model="radioValue"
            :items="[
              { label: '옵션 1', value: 'option1' },
              { label: '옵션 2', value: 'option2' },
              { label: '옵션 3', value: 'option3' },
            ]"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Navigation -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Navigation</h2>
      </template>

      <div class="space-y-6">
        <div>
          <p class="text-sm text-(--ui-text-muted) mb-2">Tabs</p>
          <UTabs :items="tabs" />
        </div>

        <div>
          <p class="text-sm text-(--ui-text-muted) mb-2">Breadcrumb</p>
          <UBreadcrumb
            :items="[
              { label: 'Home', icon: 'i-lucide-house' },
              { label: '프로젝트' },
              { label: 'Design System' },
            ]"
          />
        </div>

        <div>
          <p class="text-sm text-(--ui-text-muted) mb-2">Dropdown</p>
          <UDropdownMenu :items="dropdownItems">
            <UButton label="옵션" variant="outline" trailing-icon="i-lucide-chevron-down" />
          </UDropdownMenu>
        </div>
      </div>
    </UCard>

    <!-- Overlays -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Overlay</h2>
      </template>

      <div class="flex flex-wrap gap-3">
        <UButton label="모달 열기" @click="modalOpen = true" />
        <UButton label="드로어 열기" variant="outline" @click="drawerOpen = true" />
      </div>

      <UModal v-model:open="modalOpen" title="모달 제목" description="모달 설명 텍스트입니다.">
        <template #body>
          <p class="text-sm text-(--ui-text-muted)">
            모달 본문 내용입니다. 여기에 폼이나 상세 정보를 표시할 수 있습니다.
          </p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="취소" variant="outline" @click="modalOpen = false" />
            <UButton label="확인" @click="modalOpen = false" />
          </div>
        </template>
      </UModal>

      <UDrawer v-model:open="drawerOpen" title="드로어 제목" description="드로어 설명입니다.">
        <template #body>
          <p class="text-sm text-(--ui-text-muted) p-4">
            드로어 본문 내용입니다. 사이드 패널로 상세 정보를 표시합니다.
          </p>
        </template>
      </UDrawer>
    </UCard>

    <!-- Feedback -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Feedback</h2>
      </template>

      <div class="space-y-4">
        <UAlert
          title="정보"
          description="이것은 정보 알림입니다."
          icon="i-lucide-info"
          color="info"
        />
        <UAlert
          title="성공"
          description="작업이 성공적으로 완료되었습니다."
          icon="i-lucide-circle-check"
          color="success"
        />
        <UAlert
          title="경고"
          description="주의가 필요한 사항입니다."
          icon="i-lucide-triangle-alert"
          color="warning"
        />
        <UAlert
          title="오류"
          description="문제가 발생했습니다."
          icon="i-lucide-circle-x"
          color="error"
        />
      </div>
    </UCard>

    <!-- Skeleton -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-(--ui-text-highlighted)">Skeleton / Loading</h2>
      </template>

      <div class="space-y-3">
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
        <USkeleton class="h-32 w-full" />
      </div>
    </UCard>
  </div>
</template>
