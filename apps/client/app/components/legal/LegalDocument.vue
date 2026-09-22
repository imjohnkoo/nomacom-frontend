<script setup lang="ts">
// 법정 문서 렌더 — 이용약관 · 개인정보처리방침 · 환불정책 공용.
// 문단이 P9-4 대기면 «문안을 확정하고 있어요.» 한 줄. 조판: 어절 보존 · 제목 balance · 문단 pretty.
import type { LegalDocument, LegalSection } from '~/content/legal'
import { displayValue, isPending } from '~/content/pending'

defineProps<{ doc: LegalDocument }>()

defineSlots<{
  /** 절 본문 뒤에 덧붙일 내용 (예: 환불정책의 고객센터 목록) */
  'section-extra'?: (props: { section: LegalSection }) => unknown
}>()

const PENDING_BODY = '문안을 확정하고 있어요.'
</script>

<template>
  <article class="legal-doc">
    <h1 class="legal-doc__title">{{ doc.title }}</h1>
    <p class="legal-doc__meta">시행일 {{ displayValue(doc.effectiveDate) }}</p>

    <section
      v-for="section in doc.sections"
      :id="section.key"
      :key="section.key"
      class="legal-doc__section"
    >
      <h2 class="legal-doc__heading">{{ section.heading }}</h2>
      <template v-for="(paragraph, i) in section.paragraphs" :key="i">
        <p v-if="isPending(paragraph)" class="legal-doc__pending">{{ PENDING_BODY }}</p>
        <p v-else class="legal-doc__paragraph">{{ paragraph }}</p>
      </template>
      <slot name="section-extra" :section="section" />
    </section>
  </article>
</template>

<style scoped>
.legal-doc {
  padding: 28px 20px 40px;
  color: var(--n-color-neutral-800, #262626);
  word-break: keep-all;
  overflow-wrap: break-word;
}

.legal-doc__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.4;
  color: var(--n-color-neutral-900, #171717);
  text-wrap: balance;
}

.legal-doc__meta {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--n-color-neutral-500, #737373);
}

.legal-doc__section {
  margin-top: 28px;
}

.legal-doc__heading {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--n-color-neutral-900, #171717);
  text-wrap: balance;
}

.legal-doc__paragraph,
.legal-doc__pending {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.7;
  text-wrap: pretty;
}

.legal-doc__pending {
  color: var(--n-color-neutral-400, #a3a3a3);
}
</style>
