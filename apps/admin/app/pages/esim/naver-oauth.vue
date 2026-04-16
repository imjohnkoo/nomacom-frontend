<template>
  <div>
    <h2 class="page-title">Naver OAuth</h2>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Access Token</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="status === 'pending'">
            <td colspan="3" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="3" class="empty">No OAuth tokens found</td>
          </tr>
          <tr v-for="token in data" :key="token.id">
            <td>{{ token.id }}</td>
            <td class="monospace token-cell">
              <span v-if="!showToken">{{ maskToken(token.accessToken) }}</span>
              <span v-else>{{ token.accessToken }}</span>
              <button class="toggle-btn" @click="showToken = !showToken">
                {{ showToken ? 'Hide' : 'Show' }}
              </button>
            </td>
            <td>{{ formatDate(token.accessTokenUpdatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, status } = useFetch('/api/esim/naver-oauth')
const showToken = ref(false)

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleString('ko-KR')
}

function maskToken(token: string | null) {
  if (!token) return '-'
  return token.slice(0, 8) + '...' + token.slice(-4)
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

.token-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-btn {
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #666;
  cursor: pointer;
}

.toggle-btn:hover {
  background: #f5f5f5;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}
</style>
