<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')

const users = ref([
  { id: 1, name: '김민수', email: 'minsu@nomacom.io', role: 'Admin', status: 'active', lastLogin: '2026-02-28' },
  { id: 2, name: '이지은', email: 'jieun@nomacom.io', role: 'Editor', status: 'active', lastLogin: '2026-02-27' },
  { id: 3, name: '박준영', email: 'junyoung@nomacom.io', role: 'Viewer', status: 'active', lastLogin: '2026-02-26' },
  { id: 4, name: '최서연', email: 'seoyeon@nomacom.io', role: 'Editor', status: 'inactive', lastLogin: '2026-02-10' },
  { id: 5, name: '정하늘', email: 'haneul@nomacom.io', role: 'Admin', status: 'active', lastLogin: '2026-02-28' },
  { id: 6, name: '한소희', email: 'sohee@nomacom.io', role: 'Viewer', status: 'active', lastLogin: '2026-02-25' },
  { id: 7, name: '윤도현', email: 'dohyun@nomacom.io', role: 'Editor', status: 'inactive', lastLogin: '2026-01-15' },
  { id: 8, name: '강예진', email: 'yejin@nomacom.io', role: 'Viewer', status: 'active', lastLogin: '2026-02-24' },
])

const columns = [
  { accessorKey: 'name', header: '이름' },
  { accessorKey: 'email', header: '이메일' },
  { accessorKey: 'role', header: '역할' },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'lastLogin', header: '마지막 로그인' },
  { accessorKey: 'actions', header: '' },
]

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q),
  )
})

const roleColor: Record<string, string> = {
  Admin: 'error',
  Editor: 'primary',
  Viewer: 'neutral',
}

const statusColor: Record<string, string> = {
  active: 'success',
  inactive: 'neutral',
}

const statusLabel: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
}

const dropdownItems = [
  [{ label: '프로필 보기', icon: 'i-lucide-user' }, { label: '수정', icon: 'i-lucide-pencil' }],
  [{ label: '비활성화', icon: 'i-lucide-user-x', color: 'error' as const }],
]

const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('')

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">사용자 관리</h1>
        <p class="text-sm text-(--ui-text-muted) mt-1">팀 멤버를 관리하고 권한을 설정하세요</p>
      </div>
      <UButton icon="i-lucide-user-plus" label="사용자 초대" @click="inviteOpen = true" />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-(--ui-bg-accented)">
            <UIcon name="i-lucide-users" class="text-(--ui-text-muted)" size="20" />
          </div>
          <div>
            <p class="text-sm text-(--ui-text-muted)">전체 사용자</p>
            <p class="text-xl font-bold text-(--ui-text-highlighted)">{{ users.length }}</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-(--ui-bg-accented)">
            <UIcon name="i-lucide-user-check" class="text-green-500" size="20" />
          </div>
          <div>
            <p class="text-sm text-(--ui-text-muted)">활성 사용자</p>
            <p class="text-xl font-bold text-(--ui-text-highlighted)">
              {{ users.filter((u) => u.status === 'active').length }}
            </p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-(--ui-bg-accented)">
            <UIcon name="i-lucide-shield" class="text-blue-500" size="20" />
          </div>
          <div>
            <p class="text-sm text-(--ui-text-muted)">관리자</p>
            <p class="text-xl font-bold text-(--ui-text-highlighted)">
              {{ users.filter((u) => u.role === 'Admin').length }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <UInput
            v-model="search"
            placeholder="이름, 이메일, 역할로 검색..."
            icon="i-lucide-search"
            class="w-64"
          />
        </div>
      </template>

      <UTable :data="filteredUsers" :columns="columns">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :text="row.original.name.slice(0, 1)" size="sm" />
            <span class="font-medium text-(--ui-text-highlighted)">{{ row.original.name }}</span>
          </div>
        </template>
        <template #role-cell="{ row }">
          <UBadge :color="(roleColor[row.original.role] as any)" variant="subtle" size="sm">
            {{ row.original.role }}
          </UBadge>
        </template>
        <template #status-cell="{ row }">
          <div class="flex items-center gap-1.5">
            <span
              class="size-2 rounded-full"
              :class="row.original.status === 'active' ? 'bg-green-500' : 'bg-neutral-300'"
            />
            <span class="text-sm">{{ statusLabel[row.original.status] }}</span>
          </div>
        </template>
        <template #actions-cell>
          <UDropdownMenu :items="dropdownItems">
            <UButton icon="i-lucide-ellipsis" variant="ghost" color="neutral" size="sm" />
          </UDropdownMenu>
        </template>
      </UTable>
    </UCard>

    <!-- Invite Modal -->
    <UModal v-model:open="inviteOpen" title="사용자 초대" description="새로운 팀 멤버를 초대합니다.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="이메일">
            <UInput
              v-model="inviteEmail"
              placeholder="email@example.com"
              icon="i-lucide-mail"
              type="email"
            />
          </UFormField>
          <UFormField label="역할">
            <USelect v-model="inviteRole" :items="roleOptions" placeholder="역할 선택" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="취소" variant="outline" @click="inviteOpen = false" />
          <UButton label="초대 보내기" icon="i-lucide-send" @click="inviteOpen = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>
