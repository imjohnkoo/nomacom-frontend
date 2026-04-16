<template>
  <div>
    <h2 class="page-title">eSIMs</h2>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>eSIM ID</th>
            <th>ICCID</th>
            <th>State</th>
            <th>Network Status</th>
            <th>Service Status</th>
            <th>APN</th>
            <th>Order ID</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="status === 'pending'">
            <td colspan="8" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="8" class="empty">No eSIMs found</td>
          </tr>
          <tr v-for="esim in data" :key="esim.esimId">
            <td class="monospace">{{ esim.esimId }}</td>
            <td class="monospace">{{ esim.iccid || '-' }}</td>
            <td>
              <span class="badge" :class="stateClass(esim.state)">{{ esim.state || '-' }}</span>
            </td>
            <td>{{ esim.networkStatus || '-' }}</td>
            <td>{{ esim.serviceStatus || '-' }}</td>
            <td>{{ esim.apn || '-' }}</td>
            <td>{{ esim.orderProductOrderId || '-' }}</td>
            <td>{{ formatDate(esim.dateAssigned) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, status } = useFetch('/api/esim/esims')

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

function stateClass(state: string | null) {
  if (!state) return 'status-default'
  const s = state.toLowerCase()
  if (s.includes('active') || s === 'enabled') return 'status-active'
  if (s.includes('released') || s === 'disabled') return 'status-inactive'
  return 'status-default'
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
.status-default { background: #f3f4f6; color: #6b7280; }
</style>
