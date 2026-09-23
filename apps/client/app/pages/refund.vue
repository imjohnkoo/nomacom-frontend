<script setup lang="ts">
// 환불정책 — A5: «발급 전 전액 환불» · 신청 경로 · 처리 기한만 게시.
import { STATIC_DESCRIPTIONS } from '#shared/catalog/seo'
import LegalDocument from '~/components/legal/LegalDocument.vue'
import { REFUND } from '~/content/legal'
import { supportRows } from '~/content/support'

// canonical · 설명 — sitemap 에 든 정적 페이지(catalog F-9 · QA ⑥ R11)
useCatalogSeo({ title: REFUND.title, description: STATIC_DESCRIPTIONS['/refund'] })

// 신청 경로 = 카카오톡 · 네이버 톡톡 · 전화 (이메일 · 운영 시간은 마이 화면에서)
const channels = supportRows().filter((row) => ['kakao', 'naver', 'phone'].includes(row.key))
</script>

<template>
  <LegalDocument :doc="REFUND">
    <template #section-extra="{ section }">
      <ul v-if="section.key === 'how'" class="refund-channels">
        <li v-for="channel in channels" :key="channel.key" class="refund-channels__item">
          <span class="refund-channels__label">{{ channel.label }}</span>
          <a
            v-if="channel.href"
            :href="channel.href"
            class="refund-channels__value"
            :target="channel.href.startsWith('http') ? '_blank' : undefined"
            :rel="channel.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          >
            {{ channel.text }}
          </a>
          <span v-else class="refund-channels__value">{{ channel.text }}</span>
        </li>
      </ul>
    </template>
  </LegalDocument>
</template>

<style scoped>
.refund-channels {
  margin: 4px 0 0;
  padding: 12px 14px;
  list-style: none;
  border-radius: 12px;
  background: var(--n-color-neutral-50, #fafafa);
  font-size: 14px;
  line-height: 1.7;
}

.refund-channels__item {
  display: flex;
  gap: 10px;
}

.refund-channels__label {
  flex-shrink: 0;
  min-width: 84px;
  color: var(--n-color-neutral-500, #737373);
}

.refund-channels__value {
  color: var(--n-color-neutral-900, #171717);
  font-weight: 600;
}

a.refund-channels__value {
  color: var(--n-color-primary-600, #5025e8);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
