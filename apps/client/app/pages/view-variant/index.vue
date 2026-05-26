<script setup lang="ts">
import { NPageHeading, NLinkCard, NTrustNote } from '@imjohnkoo/design-vue'

const orderId = 2026052435967091
const variants = [
  {
    key: 'stack',
    label: 'Stack (현재)',
    sub: '카드를 세로로 모두 펼침 · 5+ 면 페이지가 5배 길이',
  },
  {
    key: 'segmented',
    label: 'Segmented tab',
    sub: '상단 탭으로 1개씩 · 5+ 는 가로 스크롤 fallback',
  },
  {
    key: 'carousel',
    label: 'Horizontal carousel',
    sub: '좌우 swipe · dot pagination · 갯수가 클수록 유리',
  },
  {
    key: 'accordion',
    label: 'Accordion list',
    sub: '리스트로 모두 표시 · 탭하면 확장 · 어떤 회선 활성/미사용인지 한눈에',
  },
  {
    key: 'picker',
    label: 'Field picker + bottom sheet',
    sub: '"발급된 eSIM 1 / 6 ▼" 클릭 → 시트에서 선택 · 6+ 에 가장 안정적',
  },
]
</script>

<template>
  <div class="vv-index">
    <NPageHeading
      eyebrow="Multi-QR 디자인 비교"
      :title="`6 개 발급 케이스\n5가지 시안`"
      :description="`동일한 6 개 esim 주문을 5가지 디스플레이 패턴으로 미리보기.\n각 카드를 열어 비교해 보세요.`"
    />

    <div class="vv-index__notes">
      <NTrustNote>
        같은 prod plan-type (동유럽3개국 · 15일) 으로 esim 6 개를 seed 하여, QR/설치코드/가이드의
        반복 처리 차이만 비교할 수 있습니다.
      </NTrustNote>
    </div>

    <div class="vv-index__list">
      <NLinkCard
        v-for="v in variants"
        :key="v.key"
        :label="v.label"
        :sub="v.sub"
        :href="`/view-variant/${v.key}/${orderId}`"
      />
    </div>
  </div>
</template>

<style scoped>
.vv-index {
  padding: 20px 24px 32px;
  background: #ffffff;
  min-height: 100vh;
}

.vv-index__notes {
  margin-top: 24px;
}

.vv-index__list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
