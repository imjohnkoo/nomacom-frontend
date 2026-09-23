<script setup lang="ts">
// 홈 shell (spec S-1) — 여행지 검색 자리(/search · 검색은 W1-3) · 주문번호 조회 카드 · 바로가기.
// 국가 그리드 · 상품은 W1-3 에서 이 페이지에 얹는다.
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import OrderLookupForm from '~/components/order/OrderLookupForm.vue'

const shortcuts = [
  { to: '/guide', label: '설치 가이드', sub: '출발 전에 미리 설치해 두세요', icon: BookOpenIcon },
  {
    to: '/supported-devices',
    label: '지원 기기 확인',
    sub: '내 휴대폰에서 eSIM 을 쓸 수 있는지 확인해요',
    icon: DevicePhoneMobileIcon,
  },
  { to: '/my#cs', label: '고객센터', sub: '궁금한 점을 물어보세요', icon: ChatBubbleLeftRightIcon },
]
</script>

<template>
  <div class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <h1 id="home-title" class="home__title">어느 나라로 떠나세요?</h1>
      <NuxtLink to="/search" class="home__search">
        <MagnifyingGlassIcon class="home__search-icon" aria-hidden="true" />
        <span>국가 이름으로 찾기</span>
      </NuxtLink>
    </section>

    <section class="home__card" aria-labelledby="home-lookup-title">
      <h2 id="home-lookup-title" class="home__card-title">이미 구매하셨나요?</h2>
      <p class="home__card-desc">
        스마트스토어 주문번호를 넣으면 QR 코드를 발급하거나 다시 볼 수 있어요.
      </p>
      <OrderLookupForm input-id="home-order-lookup" />
    </section>

    <section class="home__shortcuts" aria-label="바로가기">
      <ul class="home__shortcut-list">
        <li v-for="item in shortcuts" :key="item.to">
          <NuxtLink :to="item.to" class="home__shortcut">
            <span class="home__shortcut-icon">
              <component :is="item.icon" aria-hidden="true" />
            </span>
            <span class="home__shortcut-text">
              <span class="home__shortcut-label">{{ item.label }}</span>
              <span class="home__shortcut-sub">{{ item.sub }}</span>
            </span>
            <ChevronRightIcon class="home__shortcut-chev" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px 32px;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.home__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.4;
  color: var(--n-color-neutral-900, #171717);
  text-wrap: balance;
}

.home__search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: 14px;
  background: var(--n-color-neutral-50, #fafafa);
  color: var(--n-color-neutral-500, #737373);
  font-size: 15px;
  text-decoration: none;
}

.home__search:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239ff);
  outline-offset: 2px;
}

.home__search-icon {
  width: 20px;
  height: 20px;
  color: var(--n-color-neutral-500, #737373);
}

.home__card {
  margin-top: 8px;
  padding: 20px 18px;
  border: 1px solid var(--n-color-neutral-100, #f5f5f5);
  border-radius: 18px;
  background: var(--n-color-neutral-0, #ffffff);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px -16px rgba(15, 23, 42, 0.12);
}

.home__card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--n-color-neutral-900, #171717);
}

.home__card-desc {
  margin: 6px 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--n-color-neutral-600, #525252);
  text-wrap: pretty;
}

.home__shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home__shortcut {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
}

.home__shortcut:hover {
  background: var(--n-color-neutral-50, #fafafa);
}

.home__shortcut-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--n-color-primary-50, #f1edff);
  color: var(--n-color-primary-600, #5025e8);
}

.home__shortcut-icon svg {
  width: 22px;
  height: 22px;
}

.home__shortcut-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.home__shortcut-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--n-color-neutral-900, #171717);
}

.home__shortcut-sub {
  font-size: 13px;
  line-height: 1.5;
  color: var(--n-color-neutral-500, #737373);
}

.home__shortcut-chev {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--n-color-neutral-300, #d4d4d4);
}
</style>
