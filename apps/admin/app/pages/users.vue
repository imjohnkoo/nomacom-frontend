<template>
  <div>
    <h2 class="page-title">Users</h2>
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="status === 'pending'">
            <td colspan="5" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="5" class="empty">No users found</td>
          </tr>
          <tr v-for="user in data" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span class="badge" :class="user.role">{{ user.role }}</span></td>
            <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, status } = useFetch('/api/users')
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
  overflow: hidden;
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

.badge.admin { background: #fee2e2; color: #dc2626; }
.badge.editor { background: #dbeafe; color: #2563eb; }
.badge.viewer { background: #f0fdf4; color: #16a34a; }
</style>
