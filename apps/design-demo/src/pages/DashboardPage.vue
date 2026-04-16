<script setup lang="ts">
import { ref } from 'vue'

const stats = [
  { label: '총 사용자', value: '12,489', change: '+12.5%', icon: 'i-lucide-users', trend: 'up' },
  { label: '매출', value: '₩48.2M', change: '+8.2%', icon: 'i-lucide-wallet', trend: 'up' },
  {
    label: '활성 세션',
    value: '1,024',
    change: '-3.1%',
    icon: 'i-lucide-activity',
    trend: 'down',
  },
  {
    label: '전환율',
    value: '3.24%',
    change: '+0.8%',
    icon: 'i-lucide-trending-up',
    trend: 'up',
  },
]

const recentOrders = ref([
  {
    id: 'ORD-001',
    customer: '김민수',
    product: 'Pro 요금제',
    amount: '₩59,000',
    status: 'completed',
    date: '2026-02-27',
  },
  {
    id: 'ORD-002',
    customer: '이지은',
    product: 'Enterprise',
    amount: '₩299,000',
    status: 'pending',
    date: '2026-02-26',
  },
  {
    id: 'ORD-003',
    customer: '박준영',
    product: 'Starter',
    amount: '₩19,000',
    status: 'completed',
    date: '2026-02-26',
  },
  {
    id: 'ORD-004',
    customer: '최서연',
    product: 'Pro 요금제',
    amount: '₩59,000',
    status: 'cancelled',
    date: '2026-02-25',
  },
  {
    id: 'ORD-005',
    customer: '정하늘',
    product: 'Enterprise',
    amount: '₩299,000',
    status: 'completed',
    date: '2026-02-25',
  },
])

const statusColor: Record<string, string> = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'error',
}

const statusLabel: Record<string, string> = {
  completed: '완료',
  pending: '대기',
  cancelled: '취소',
}

const columns = [
  { accessorKey: 'id', header: '주문번호' },
  { accessorKey: 'customer', header: '고객' },
  { accessorKey: 'product', header: '상품' },
  { accessorKey: 'amount', header: '금액' },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'date', header: '날짜' },
]

const activities = [
  { user: '김민수', action: 'Pro 요금제를 구매했습니다', time: '5분 전', icon: 'i-lucide-credit-card' },
  { user: '이지은', action: '새 프로젝트를 생성했습니다', time: '12분 전', icon: 'i-lucide-folder-plus' },
  { user: '박준영', action: '팀에 멤버를 초대했습니다', time: '1시간 전', icon: 'i-lucide-user-plus' },
  { user: '최서연', action: '보고서를 다운로드했습니다', time: '2시간 전', icon: 'i-lucide-download' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">대시보드</h1>
        <p class="text-sm text-(--ui-text-muted) mt-1">서비스 현황을 한눈에 확인하세요</p>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-lucide-download" variant="outline" label="내보내기" />
        <UButton icon="i-lucide-plus" label="새 항목" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--ui-text-muted)">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-(--ui-text-highlighted) mt-1">{{ stat.value }}</p>
            <div class="flex items-center gap-1 mt-2">
              <UIcon
                :name="stat.trend === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                :class="stat.trend === 'up' ? 'text-green-500' : 'text-red-500'"
                size="16"
              />
              <span
                class="text-xs font-medium"
                :class="stat.trend === 'up' ? 'text-green-500' : 'text-red-500'"
              >
                {{ stat.change }}
              </span>
              <span class="text-xs text-(--ui-text-muted)">vs 지난달</span>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-(--ui-bg-accented)">
            <UIcon :name="stat.icon" class="text-(--ui-text-muted)" size="24" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Table -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-(--ui-text-highlighted)">최근 주문</h3>
            <UButton variant="ghost" label="전체보기" trailing-icon="i-lucide-arrow-right" size="sm" />
          </div>
        </template>

        <UTable :data="recentOrders" :columns="columns">
          <template #status-cell="{ row }">
            <UBadge :color="(statusColor[row.original.status] as any)" variant="subtle" size="sm">
              {{ statusLabel[row.original.status] }}
            </UBadge>
          </template>
        </UTable>
      </UCard>

      <!-- Activity Feed -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-(--ui-text-highlighted)">최근 활동</h3>
        </template>

        <div class="space-y-4">
          <div v-for="(activity, i) in activities" :key="i" class="flex gap-3">
            <div class="p-2 rounded-lg bg-(--ui-bg-accented) h-fit">
              <UIcon :name="activity.icon" class="text-(--ui-text-muted)" size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm">
                <span class="font-medium text-(--ui-text-highlighted)">{{ activity.user }}</span>
                <span class="text-(--ui-text-muted)">이(가) {{ activity.action }}</span>
              </p>
              <p class="text-xs text-(--ui-text-muted) mt-0.5">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
