<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const viewMode = ref('grid')

const products = ref([
  { id: 'PRD-001', name: 'Starter', description: '개인 사용자를 위한 기본 요금제', price: 19000, category: '요금제', status: 'active', sales: 1284 },
  { id: 'PRD-002', name: 'Pro', description: '팀을 위한 전문 요금제', price: 59000, category: '요금제', status: 'active', sales: 856 },
  { id: 'PRD-003', name: 'Enterprise', description: '대규모 조직을 위한 엔터프라이즈', price: 299000, category: '요금제', status: 'active', sales: 142 },
  { id: 'PRD-004', name: 'API 기본', description: '월 10,000 호출 API 패키지', price: 49000, category: 'API', status: 'active', sales: 423 },
  { id: 'PRD-005', name: 'API 프로', description: '월 100,000 호출 API 패키지', price: 199000, category: 'API', status: 'active', sales: 187 },
  { id: 'PRD-006', name: '온보딩 컨설팅', description: '전문가 1:1 온보딩 서비스', price: 500000, category: '서비스', status: 'draft', sales: 34 },
])

const filteredProducts = computed(() => {
  if (!search.value) return products.value
  const q = search.value.toLowerCase()
  return products.value.filter(
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
  )
})

const columns = [
  { accessorKey: 'name', header: '상품명' },
  { accessorKey: 'category', header: '카테고리' },
  { accessorKey: 'price', header: '가격' },
  { accessorKey: 'sales', header: '판매량' },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'actions', header: '' },
]

const statusLabel: Record<string, string> = {
  active: '활성',
  draft: '초안',
  archived: '보관',
}

const statusColor: Record<string, string> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
}

const categoryIcon: Record<string, string> = {
  '요금제': 'i-lucide-credit-card',
  API: 'i-lucide-code',
  '서비스': 'i-lucide-headphones',
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString()}`
}

const dropdownItems = [
  [{ label: '수정', icon: 'i-lucide-pencil' }, { label: '복제', icon: 'i-lucide-copy' }],
  [{ label: '보관 처리', icon: 'i-lucide-archive', color: 'error' as const }],
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">상품 관리</h1>
        <p class="text-sm text-(--ui-text-muted) mt-1">상품과 요금제를 관리하세요</p>
      </div>
      <UButton icon="i-lucide-plus" label="상품 추가" />
    </div>

    <!-- Toolbar -->
    <UCard>
      <div class="flex items-center justify-between">
        <UInput
          v-model="search"
          placeholder="상품명, 카테고리로 검색..."
          icon="i-lucide-search"
          class="w-64"
        />
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-layout-grid"
            :variant="viewMode === 'grid' ? 'soft' : 'ghost'"
            color="neutral"
            @click="viewMode = 'grid'"
          />
          <UButton
            icon="i-lucide-list"
            :variant="viewMode === 'list' ? 'soft' : 'ghost'"
            color="neutral"
            @click="viewMode = 'list'"
          />
        </div>
      </div>
    </UCard>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="product in filteredProducts" :key="product.id">
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-(--ui-bg-accented)">
                <UIcon
                  :name="categoryIcon[product.category] || 'i-lucide-package'"
                  class="text-(--ui-text-muted)"
                  size="20"
                />
              </div>
              <div>
                <p class="font-semibold text-(--ui-text-highlighted)">{{ product.name }}</p>
                <p class="text-xs text-(--ui-text-muted)">{{ product.id }}</p>
              </div>
            </div>
            <UBadge :color="(statusColor[product.status] as any)" variant="subtle" size="sm">
              {{ statusLabel[product.status] }}
            </UBadge>
          </div>

          <p class="text-sm text-(--ui-text-muted)">{{ product.description }}</p>

          <div class="flex items-center justify-between pt-2 border-t border-(--ui-border)">
            <div>
              <p class="text-lg font-bold text-(--ui-text-highlighted)">
                {{ formatPrice(product.price) }}
              </p>
              <p class="text-xs text-(--ui-text-muted)">월간</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-(--ui-text-highlighted)">
                {{ product.sales.toLocaleString() }}
              </p>
              <p class="text-xs text-(--ui-text-muted)">총 판매</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- List View -->
    <UCard v-if="viewMode === 'list'">
      <UTable :data="filteredProducts" :columns="columns">
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="p-1.5 rounded-md bg-(--ui-bg-accented)">
              <UIcon
                :name="categoryIcon[row.original.category] || 'i-lucide-package'"
                class="text-(--ui-text-muted)"
                size="16"
              />
            </div>
            <div>
              <p class="font-medium text-(--ui-text-highlighted)">{{ row.original.name }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ row.original.description }}</p>
            </div>
          </div>
        </template>
        <template #price-cell="{ row }">
          <span class="font-medium">{{ formatPrice(row.original.price) }}</span>
        </template>
        <template #sales-cell="{ row }">
          {{ row.original.sales.toLocaleString() }}
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="(statusColor[row.original.status] as any)" variant="subtle" size="sm">
            {{ statusLabel[row.original.status] }}
          </UBadge>
        </template>
        <template #actions-cell>
          <UDropdownMenu :items="dropdownItems">
            <UButton icon="i-lucide-ellipsis" variant="ghost" color="neutral" size="sm" />
          </UDropdownMenu>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
