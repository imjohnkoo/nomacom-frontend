<template>
  <div>
    <h2 class="page-title">Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Users</span>
        <span class="stat-value">-</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Active Today</span>
        <span class="stat-value">-</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">New This Week</span>
        <span class="stat-value">-</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: #1a1a2e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
}
</style>
