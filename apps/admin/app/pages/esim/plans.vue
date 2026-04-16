<template>
  <div>
    <h2 class="page-title">Plans</h2>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Plan ID</th>
            <th>External ID</th>
            <th>Activated</th>
            <th>Network Status</th>
            <th>Start</th>
            <th>End</th>
            <th>Data Quota</th>
            <th>Data Remaining</th>
            <th>eSIM ID</th>
            <th>Plan Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="status === 'pending'">
            <td colspan="10" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="10" class="empty">No plans found</td>
          </tr>
          <tr v-for="plan in data" :key="plan.planId">
            <td>{{ plan.planId }}</td>
            <td class="monospace">{{ plan.id || '-' }}</td>
            <td>
              <span class="badge" :class="plan.isActivated ? 'status-active' : 'status-inactive'">
                {{ plan.isActivated ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>{{ plan.networkStatus || '-' }}</td>
            <td>{{ formatDate(plan.startTime) }}</td>
            <td>{{ formatDate(plan.endTime) }}</td>
            <td>{{ formatBytes(plan.dataQuotaBytes) }}</td>
            <td>{{ formatBytes(plan.dataBytesRemaining) }}</td>
            <td class="monospace">{{ plan.esimEsimId || '-' }}</td>
            <td>{{ plan.planTypePlanTypeId || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, status } = useFetch('/api/esim/plans')

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

function formatBytes(bytes: number | null) {
  if (bytes == null) return '-'
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: #1a1a2e;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #f0f0f0;
}

.monospace {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.8rem;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active { background: #f0fdf4; color: #16a34a; }
.status-inactive { background: #fee2e2; color: #dc2626; }
</style>
