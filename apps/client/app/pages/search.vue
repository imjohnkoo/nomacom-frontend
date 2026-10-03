<script setup lang="ts">
// 국가 검색 자리 (spec S-6 · D-16) — 헤더 · 홈이 가리키는 라우트만 먼저 둔다. 검색 기능은 W1-3.
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { SMARTSTORE_URL } from '~/content/support'

useHead({ title: '국가 검색' })
</script>

<template>
  <div class="search-page">
    <h1 class="search-page__title">국가 검색</h1>
    <div class="search-page__field">
      <MagnifyingGlassIcon class="search-page__icon" aria-hidden="true" />
      <input
        type="search"
        class="search-page__input"
        placeholder="국가 이름을 입력해 주세요"
        aria-label="국가 이름"
        disabled
      />
    </div>
    <p class="search-page__note">
      나라별 eSIM 상품을 준비하고 있어요. 지금은 스마트스토어에서 구매할 수 있어요.
    </p>
    <a :href="SMARTSTORE_URL" class="search-page__link" target="_blank" rel="noopener noreferrer">
      스마트스토어에서 보기
    </a>
  </div>
</template>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  padding: 24px 20px 32px;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.search-page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--n-color-neutral-900, #171717);
}

.search-page__field {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 0 16px;
  border: 1px solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: 14px;
  background: var(--n-color-neutral-50, #fafafa);
}

.search-page__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--n-color-neutral-400, #a3a3a3);
}

.search-page__input {
  flex: 1;
  min-width: 0;
  height: 50px;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: var(--n-color-neutral-900, #171717);
}

.search-page__note {
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--n-color-neutral-600, #525252);
  text-wrap: pretty;
}

.search-page__link {
  align-self: flex-start;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--n-color-primary-600, #5025e8);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
