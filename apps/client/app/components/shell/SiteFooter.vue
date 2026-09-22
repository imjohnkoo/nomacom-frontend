<script setup lang="ts">
// 사업자정보 푸터 (K5 · spec D-11) — 모든 라우트에 펼친 채 상시. PG 심사 «상시 노출» 요건이라 접지 않는다.
// compact = flow 레이아웃(4-step · 체크아웃)용 — 같은 항목, 여백만 줄인다.
import { BUSINESS_INFO, businessRows } from '~/content/business'
import { LEGAL_LINKS } from '~/utils/shell-nav'

defineProps<{ compact?: boolean }>()

const rows = businessRows()
</script>

<template>
  <footer class="site-footer" :class="{ 'site-footer--compact': compact }">
    <nav class="site-footer__links" aria-label="약관 및 정책">
      <NuxtLink
        v-for="link in LEGAL_LINKS"
        :key="link.to"
        :to="link.to"
        class="site-footer__link"
        :class="{ 'site-footer__link--strong': link.to === '/privacy' }"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <dl class="site-footer__info">
      <div v-for="row in rows" :key="row.key" class="site-footer__row">
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>

    <p class="site-footer__copy">© {{ BUSINESS_INFO.brandName }}</p>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 28px 20px 24px;
  background: var(--n-color-neutral-50, #fafafa);
  border-top: 1px solid var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-500, #737373);
  font-size: 12px;
  line-height: 1.7;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.site-footer--compact {
  padding: 20px 20px 18px;
}

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-bottom: 12px;
}

.site-footer__link {
  color: var(--n-color-neutral-700, #404040);
  font-weight: 600;
  text-decoration: none;
}

.site-footer__link--strong {
  color: var(--n-color-neutral-900, #171717);
  font-weight: 800;
}

.site-footer__link:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.site-footer__info {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  margin: 0;
}

.site-footer__row {
  display: inline-flex;
  gap: 4px;
}

.site-footer__row dt {
  margin: 0;
  font-weight: 600;
}

.site-footer__row dd {
  margin: 0;
}

.site-footer__copy {
  margin: 12px 0 0;
  color: var(--n-color-neutral-400, #a3a3a3);
}
</style>
