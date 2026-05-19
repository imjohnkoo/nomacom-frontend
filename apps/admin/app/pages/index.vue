<template>
  <div class="staging">
    <div class="card">
      <span class="tag">staging</span>
      <h1>Nomacom Admin</h1>
      <p>이 화면은 배포 파이프라인 검증용 깡통 빌드입니다. 운영 기능은 아직 부착되지 않았습니다.</p>
      <p class="muted">
        Health endpoint:
        <a href="/api/health">/api/health</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.staging {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  padding: 1.5rem;
}

.card {
  max-width: 480px;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #dc2626;
  background: #fee2e2;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

h1 {
  font-size: 1.5rem;
  margin: 0.75rem 0 0.5rem;
  color: #1a1a2e;
}

p {
  margin: 0.5rem 0;
  color: #444;
  line-height: 1.5;
}

p.muted {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}

a {
  color: #2563eb;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
