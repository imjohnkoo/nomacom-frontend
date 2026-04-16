<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Nomacom</h1>
        <span>Admin</span>
      </div>
      <nav>
        <NuxtLink to="/" class="nav-item">Dashboard</NuxtLink>
        <NuxtLink to="/users" class="nav-item">Users</NuxtLink>

        <div class="nav-section">eSIM Manager</div>
        <NuxtLink to="/esim/orders" class="nav-item">Orders</NuxtLink>
        <NuxtLink to="/esim/esims" class="nav-item">eSIMs</NuxtLink>
        <NuxtLink to="/esim/plans" class="nav-item">Plans</NuxtLink>
        <NuxtLink to="/esim/plan-types" class="nav-item">Plan Types</NuxtLink>
        <NuxtLink to="/esim/naver-oauth" class="nav-item">Naver OAuth</NuxtLink>
      </nav>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  padding: 1.5rem 1rem;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.sidebar-header span {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-item {
  display: block;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 500;
}

.nav-section {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.4);
  padding: 1.25rem 0.75rem 0.375rem;
  margin-top: 0.25rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #f5f5f7;
}
</style>
