<template>
  <div>
    <h2 class="page-title">Plan Types</h2>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Plan Type ID</th>
            <th>플랜명 (KR)</th>
            <th>데이터 타입</th>
            <th>데이터 한도</th>
            <th>기간 (일)</th>
            <th>데이터 (MB)</th>
            <th>유효 기간</th>
            <th>국가 (ISO)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="status === 'pending'">
            <td colspan="8" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="8" class="empty">No plan types found</td>
          </tr>
          <tr v-for="pt in data" :key="pt.planTypeId">
            <td class="monospace">{{ pt.planTypeId }}</td>
            <td>{{ pt.planNameKr || '-' }}</td>
            <td>{{ pt.planDataTypeKr || '-' }}</td>
            <td>{{ pt.planDataLimitKr || '-' }}</td>
            <td>{{ pt.planDataDuration ?? '-' }}</td>
            <td>{{ pt.dataQuotaMb ?? '-' }}</td>
            <td>{{ pt.validityDays ? `${pt.validityDays}일` : '-' }}</td>
            <td class="countries">{{ pt.planCountriesIso?.join(', ') || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, status } = useFetch('/api/esim/plan-types')
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

.countries {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}
</style>
