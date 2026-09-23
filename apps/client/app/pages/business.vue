<script setup lang="ts">
// 사업자정보 — 푸터 9항목을 표로 (K5). 통신판매업 신고번호가 확정되면 공정위 사업자정보 확인 링크를 연다.
import { STATIC_DESCRIPTIONS } from '#shared/catalog/seo'
import { businessRows, ftcBusinessCheckUrl } from '~/content/business'

// canonical · 설명 — sitemap 에 든 정적 페이지(catalog F-9 · QA ⑥ R11)
useCatalogSeo({ title: '사업자정보', description: STATIC_DESCRIPTIONS['/business'] })

const rows = businessRows()
const ftcUrl = ftcBusinessCheckUrl()
</script>

<template>
  <article class="business-page">
    <h1 class="business-page__title">사업자정보</h1>
    <table class="business-page__table">
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <th scope="row">{{ row.label }}</th>
          <td>{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
    <a
      v-if="ftcUrl"
      :href="ftcUrl"
      class="business-page__ftc"
      target="_blank"
      rel="noopener noreferrer"
    >
      공정거래위원회 사업자정보 확인
    </a>
  </article>
</template>

<style scoped>
.business-page {
  padding: 28px 20px 40px;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.business-page__title {
  margin: 0 0 20px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.4;
  color: var(--n-color-neutral-900, #171717);
}

.business-page__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.6;
}

.business-page__table th,
.business-page__table td {
  padding: 12px 0;
  border-bottom: 1px solid var(--n-color-neutral-100, #f5f5f5);
  text-align: left;
  vertical-align: top;
}

.business-page__table th {
  width: 40%;
  padding-right: 12px;
  font-weight: 600;
  color: var(--n-color-neutral-500, #737373);
}

.business-page__table td {
  color: var(--n-color-neutral-900, #171717);
  /* 긴 이메일 · 주소가 좁은 화면에서 표를 넘치지 않게 — break-word 는 자동 표 폭 계산에 안 들어간다 */
  overflow-wrap: anywhere;
}

.business-page__ftc {
  display: inline-block;
  margin-top: 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--n-color-primary-600, #5025e8);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
