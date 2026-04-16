<template>
  <NDashboardLayout :sidebar-collapsed="sidebarCollapsed">
    <template #sidebar>
      <NSidebar v-model:collapsed="sidebarCollapsed" theme="dark">
        <template #logo="{ collapsed: c }">
          <NLogo v-if="!c" variant="full" size="sm" theme="light" />
          <NLogo v-else variant="square" size="sm" theme="light" />
        </template>

        <template #default="{ collapsed: c }">
          <NSidebarItem label="Dashboard" :active="activeMenu === 'dashboard'" :collapsed="c" @click="activeMenu = 'dashboard'">
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>
            </template>
          </NSidebarItem>
          <NSidebarItem label="Users" :active="activeMenu === 'users'" :collapsed="c" @click="activeMenu = 'users'">
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </template>
          </NSidebarItem>

          <NSidebarSeparator label="Settings" />

          <NSidebarItem label="General" :collapsed="c" :expanded="settingsExpanded" @update:expanded="settingsExpanded = $event">
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </template>
            <NSidebarItem label="Profile" :depth="1" :collapsed="c" />
            <NSidebarItem label="Security" :depth="1" :collapsed="c" />
          </NSidebarItem>
        </template>

        <template #footer="{ collapsed: c }">
          <NSidebarItem label="Logout" :collapsed="c">
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 15H3.5A1.5 1.5 0 012 13.5v-9A1.5 1.5 0 013.5 3H6M12 12l3-3-3-3M7 9h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </template>
          </NSidebarItem>
        </template>
      </NSidebar>
    </template>

    <div class="admin-content">
      <!-- Page Title -->
      <div class="admin-content__header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your overview.</p>
      </div>

      <!-- Stats Grid -->
      <div class="admin-stats">
        <NStat label="Total Users" :value="1234" :change="12.5" change-period="전월 대비">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M2 18c0-3.866 3.582-7 8-7s8 3.134 8 7" stroke="currentColor" stroke-width="1.5"/></svg>
          </template>
        </NStat>
        <NStat label="Active Today" :value="89" :change="-3.2" change-period="전일 대비">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </template>
        </NStat>
        <NStat label="Revenue" value="₩12.5M" :change="8.1" change-period="전월 대비" variant="icon-accent">
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </template>
        </NStat>
        <NStat label="Bounce Rate" value="32%" :change="5.0" change-period="전주 대비" variant="icon-accent" trend="up-bad">
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 12l-4-4v3H3v2h15v3l4-4z" fill="currentColor"/></svg>
          </template>
        </NStat>
      </div>

      <!-- Search + Data Table -->
      <div class="admin-table-section">
        <div class="admin-table-section__header">
          <h2>Users</h2>
          <div class="admin-table-section__actions">
            <button class="admin-btn admin-btn--outline" @click="toggleLoading">
              {{ tableLoading ? 'Stop Loading' : 'Show Loading' }}
            </button>
            <button class="admin-btn admin-btn--outline" @click="toggleEmpty">
              {{ showEmpty ? 'Show Data' : 'Show Empty' }}
            </button>
            <button class="admin-btn admin-btn--primary" @click="handleGlobalLoader">
              Global Loader (2s)
            </button>
            <button class="admin-btn admin-btn--danger" @click="handleConfirmDemo">
              Delete Selected
            </button>
          </div>
        </div>

        <NSearchFilter
          v-model:search-value="searchValue"
          :filters="filterConfigs"
          :filter-values="filterValues"
          search-placeholder="Search users..."
          @update:filter-values="filterValues = $event"
          @reset="resetFilters"
        />

        <NDataTable
          :columns="columns"
          :data="showEmpty ? [] : filteredData"
          row-key="id"
          :loading="tableLoading"
          :pagination="true"
          :page="page"
          :page-size="pageSize"
          :total-items="showEmpty ? 0 : totalItems"
          :page-size-options="[5, 10, 20]"
          :sort-key="sortKey"
          :sort-order="sortOrder"
          :selectable="true"
          :selected-rows="selectedRows"
          :row-clickable="true"
          empty-text="No users found"
          @update:page="page = $event"
          @update:page-size="pageSize = $event"
          @sort="handleSort"
          @update:selected-rows="selectedRows = $event"
          @row-click="handleRowClick"
        >
          <template #cell-name="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-100, #ede8ff); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--color-primary-600, #5530e6);">
                {{ row.name.charAt(0) }}
              </div>
              <span style="font-weight: 500;">{{ row.name }}</span>
            </div>
          </template>
          <template #cell-role="{ value }">
            <span :class="['admin-badge', `admin-badge--${value}`]">{{ value }}</span>
          </template>
          <template #cell-status="{ value }">
            <span :class="['admin-status', `admin-status--${value}`]">
              <span class="admin-status__dot" />
              {{ value }}
            </span>
          </template>
        </NDataTable>
      </div>
    </div>

    <!-- Global Loader -->
    <NGlobalLoader :model-value="globalLoaderVisible" message="Processing..." />

    <!-- Confirm Dialog -->
    <NConfirmDialog
      v-model="confirmDialogOpen"
      :title="confirmCurrent?.options.title ?? ''"
      :message="confirmCurrent?.options.message ?? ''"
      :confirm-text="confirmCurrent?.options.confirmText ?? '확인'"
      :cancel-text="confirmCurrent?.options.cancelText ?? '취소'"
      :variant="confirmCurrent?.options.variant ?? 'default'"
      @confirm="confirmOnConfirm"
      @cancel="confirmOnCancel"
    />
  </NDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NDashboardLayout,
  NSidebar,
  NSidebarItem,
  NSidebarSeparator,
  NStat,
  NDataTable,
  NSearchFilter,
  NGlobalLoader,
  NConfirmDialog,
  NLogo,
  useGlobalLoader,
  useConfirm,
} from '@imjohnkoo/design-vue'

// Sidebar
const sidebarCollapsed = ref(false)
const activeMenu = ref('dashboard')
const settingsExpanded = ref(false)

// Global Loader
const { start: loaderStart, stop: loaderStop, isLoading: globalLoaderVisible } = useGlobalLoader()

function handleGlobalLoader() {
  loaderStart()
  setTimeout(() => loaderStop(), 2000)
}

// Confirm Dialog
const { current: confirmCurrent, confirm, onConfirm: confirmOnConfirm, onCancel: confirmOnCancel } = useConfirm()

const confirmDialogOpen = computed({
  get: () => !!confirmCurrent.value,
  set: (v: boolean) => { if (!v) confirmOnCancel() },
})

async function handleConfirmDemo() {
  if (selectedRows.value.length === 0) {
    await confirm({
      title: 'No Selection',
      message: 'Please select at least one user to delete.',
      confirmText: 'OK',
      cancelText: 'Close',
    })
    return
  }
  const ok = await confirm({
    title: 'Delete Users',
    message: `Are you sure you want to delete ${selectedRows.value.length} selected user(s)? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
  })
  if (ok) {
    selectedRows.value = []
  }
}

// Table
const tableLoading = ref(false)
const showEmpty = ref(false)
const searchValue = ref('')
const page = ref(1)
const pageSize = ref(10)
const sortKey = ref<string | undefined>(undefined)
const sortOrder = ref<'asc' | 'desc'>('asc')
const selectedRows = ref<number[]>([])

const filterValues = ref<Record<string, string>>({})
const filterConfigs = [
  {
    key: 'role',
    label: 'Role',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Editor', value: 'editor' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
]

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true, width: '120px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'joined', label: 'Joined', sortable: true, width: '120px' },
]

const allUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'editor', status: 'active', joined: '2024-02-20' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'inactive', joined: '2024-03-10' },
  { id: 4, name: 'Alice Kim', email: 'alice@example.com', role: 'admin', status: 'active', joined: '2024-04-05' },
  { id: 5, name: 'Charlie Lee', email: 'charlie@example.com', role: 'user', status: 'active', joined: '2024-05-12' },
  { id: 6, name: 'Diana Park', email: 'diana@example.com', role: 'editor', status: 'inactive', joined: '2024-06-18' },
  { id: 7, name: 'Eric Choi', email: 'eric@example.com', role: 'user', status: 'active', joined: '2024-07-22' },
  { id: 8, name: 'Fiona Yoo', email: 'fiona@example.com', role: 'user', status: 'active', joined: '2024-08-30' },
  { id: 9, name: 'George Han', email: 'george@example.com', role: 'admin', status: 'active', joined: '2024-09-14' },
  { id: 10, name: 'Hannah Jung', email: 'hannah@example.com', role: 'editor', status: 'inactive', joined: '2024-10-01' },
  { id: 11, name: 'Ivan Seo', email: 'ivan@example.com', role: 'user', status: 'active', joined: '2024-10-15' },
  { id: 12, name: 'Julia Kang', email: 'julia@example.com', role: 'user', status: 'active', joined: '2024-11-02' },
]

const processedData = computed(() => {
  let result = [...allUsers]

  if (searchValue.value) {
    const q = searchValue.value.toLowerCase()
    result = result.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }

  if (filterValues.value.role) {
    result = result.filter((u) => u.role === filterValues.value.role)
  }
  if (filterValues.value.status) {
    result = result.filter((u) => u.status === filterValues.value.status)
  }

  if (sortKey.value) {
    const key = sortKey.value as keyof (typeof allUsers)[0]
    result.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      const cmp = String(av).localeCompare(String(bv))
      return sortOrder.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

const totalItems = computed(() => processedData.value.length)

const filteredData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return processedData.value.slice(start, start + pageSize.value)
})

function handleSort(payload: { key: string; order: 'asc' | 'desc' }) {
  sortKey.value = payload.key
  sortOrder.value = payload.order
  page.value = 1
}

function resetFilters() {
  searchValue.value = ''
  filterValues.value = {}
  page.value = 1
}

function toggleLoading() {
  tableLoading.value = !tableLoading.value
}

function toggleEmpty() {
  showEmpty.value = !showEmpty.value
}

function handleRowClick(row: Record<string, any>) {
  console.log('Row clicked:', row)
}
</script>

<style scoped>
.admin-content {
  padding: var(--spacing-6, 1.5rem);
}

.admin-content__header {
  margin-bottom: var(--spacing-6, 1.5rem);
}

.admin-content__header h1 {
  margin: 0;
  font-size: var(--font-fontSize-2xl, 1.5rem);
  font-weight: var(--font-fontWeight-bold, 700);
  color: var(--color-neutral-900, #171717);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.admin-content__header p {
  margin: var(--spacing-1, 0.25rem) 0 0;
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4, 1rem);
  margin-bottom: var(--spacing-6, 1.5rem);
}

@media (max-width: 1200px) {
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.admin-table-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4, 1rem);
}

.admin-table-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-3, 0.75rem);
}

.admin-table-section__header h2 {
  margin: 0;
  font-size: var(--font-fontSize-lg, 1.125rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-900, #171717);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.admin-table-section__actions {
  display: flex;
  gap: var(--spacing-2, 0.5rem);
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border-radius: var(--radius-md, 0.375rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  cursor: pointer;
  transition: all 150ms ease;
  border: var(--borderWidth-1, 1px) solid transparent;
}

.admin-btn--primary {
  background-color: var(--color-primary-600, #5530e6);
  color: var(--color-neutral-0, #ffffff);
}
.admin-btn--primary:hover {
  background-color: var(--color-primary-700, #4826cc);
}

.admin-btn--outline {
  background-color: var(--color-neutral-0, #ffffff);
  border-color: var(--color-neutral-300, #d4d4d4);
  color: var(--color-neutral-700, #404040);
}
.admin-btn--outline:hover {
  background-color: var(--color-neutral-50, #fafafa);
}

.admin-btn--danger {
  background-color: var(--color-error-500, #ef4444);
  color: var(--color-neutral-0, #ffffff);
}
.admin-btn--danger:hover {
  background-color: var(--color-error-700, #b91c1c);
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full, 9999px);
  font-size: var(--font-fontSize-xs, 0.75rem);
  font-weight: var(--font-fontWeight-medium, 500);
  text-transform: capitalize;
}

.admin-badge--admin {
  background-color: var(--color-primary-50, #f5f3ff);
  color: var(--color-primary-700, #4826cc);
}

.admin-badge--editor {
  background-color: var(--color-info-50, #f0f9ff);
  color: var(--color-info-700, #0369a1);
}

.admin-badge--user {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-600, #525252);
}

.admin-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-fontSize-sm, 0.875rem);
  text-transform: capitalize;
}

.admin-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.admin-status--active {
  color: var(--color-success-700, #15803d);
}
.admin-status--active .admin-status__dot {
  background-color: var(--color-success-500, #22c55e);
}

.admin-status--inactive {
  color: var(--color-neutral-500, #737373);
}
.admin-status--inactive .admin-status__dot {
  background-color: var(--color-neutral-400, #a3a3a3);
}
</style>
