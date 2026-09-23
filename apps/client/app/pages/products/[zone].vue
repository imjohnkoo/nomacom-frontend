<script setup lang="ts">
// 상품 상세(catalog spec S-4 · F-6 · F-8) — 유심사 배치: 히어로 → 종류 밑줄 탭 → 사용 기간 드롭다운 → 데이터 용량 가격 카드
// → 하단 고정 «구매하기» → 구매 시트(K2 · 3초 뒤 같은 탭에서 스마트스토어). 선택 상태는 URL 에 싣지 않는다(프리렌더 1벌).
// 가격은 K1 최종가만(D-2). 안내 섹션(D-4)은 선택기 아래.
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { thumbUrl, type AssetManifest } from '#shared/catalog/assets'
import { optionLabel } from '#shared/catalog/derive'
import { formatWon } from '#shared/catalog/format'
import { zoneMeta } from '#shared/catalog/seo'
import {
  initialSelection,
  periodOptions,
  planCards,
  selectedOption,
  selectionLabel,
  withCap,
  withDays,
  withKind,
  type Selection,
} from '#shared/catalog/picker'
import type { Kind, ZoneView } from '#shared/catalog/types'
import PeriodSelect from '~/components/catalog/PeriodSelect.vue'
import PlanCards from '~/components/catalog/PlanCards.vue'
import ProductSections from '~/components/catalog/ProductSections.vue'
import PurchaseSheet from '~/components/catalog/PurchaseSheet.vue'
import UnderlineTabs from '~/components/catalog/UnderlineTabs.vue'
import manifest from '~/content/catalog-assets.json'
import { HERO_BADGES, PERIOD_HINT, heroChecks, heroLead } from '~/content/product-detail'
import { isCatalogParam } from '~/utils/catalog-path'

definePageMeta({ middleware: 'catalog-path' })

const route = useRoute()
const param = String(route.params.zone ?? '')
if (!isCatalogParam('products', param))
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })

const { data, error } = await useFetch<ZoneView>(`/api/catalog/zones/${param}`, {
  key: `catalog-zone-${param}`,
})
if (error.value || !data.value)
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })

const zone = data.value
const multi = zone.countries.length > 1

const sel = ref<Selection>(initialSelection(zone))
const kindTabs = zone.products.map((p) => ({
  key: p.kind,
  label: p.kind === 'U' ? '무제한' : '종량제',
}))
const kind = computed<Kind>({
  get: () => sel.value.kind,
  set: (k) => (sel.value = withKind(zone, sel.value, k)),
})
const days = computed<number>({
  get: () => sel.value.days,
  set: (d) => (sel.value = withDays(zone, sel.value, d)),
})
const cap = computed<number>({
  get: () => sel.value.cap,
  set: (c) => (sel.value = withCap(zone, sel.value, c)),
})
const periods = computed(() => periodOptions(zone, sel.value.kind))
const cards = computed(() => planCards(zone, sel.value))
const option = computed(() => selectedOption(zone, sel.value))
const product = computed(() => zone.products.find((p) => p.kind === sel.value.kind)!)
const heroSrc = thumbUrl(manifest as AssetManifest, zone.products[0]!.thumb)
const heroAlt = [`${zone.label} eSIM`, zone.subtitle].filter(Boolean).join(' — ')
useCatalogSeo(zoneMeta(zone), heroSrc)

// «← 나라» — 국가 페이지에서 들어왔으면 그 나라, 아니면 홈(SSR 은 홈 — 하이드레이션 뒤에 바꾼다)
const back = ref<{ to: string; label: string }>({ to: '/', label: '홈' })
onMounted(() => {
  const prev = String(window.history.state?.back ?? '')
  const m = prev.match(/^\/countries\/([a-z]{3})$/)
  const c = m && zone.countries.find((x) => x.iso3 === m[1]!.toUpperCase())
  if (c) back.value = { to: prev, label: c.nameKr }
})

const sheetOpen = ref(false)
</script>

<template>
  <div class="product">
    <div class="product__top">
      <NuxtLink :to="back.to" class="product__back">
        <ChevronLeftIcon aria-hidden="true" />
        {{ back.label }}
      </NuxtLink>
      <img
        class="product__hero"
        :src="heroSrc"
        :alt="heroAlt"
        width="400"
        height="400"
        fetchpriority="high"
      />
      <div class="product__badges">
        <span v-if="multi" class="product__badge">{{ zone.countries.length }}개국</span>
        <span v-for="b in HERO_BADGES" :key="b" class="product__badge">{{ b }}</span>
      </div>
      <h1 class="product__title">{{ zone.label }} eSIM</h1>
      <p class="product__lead">{{ heroLead(zone) }}</p>
      <ul class="product__checks">
        <li v-for="line in heroChecks(zone)" :key="line">{{ line }}</li>
      </ul>

      <section class="product__picker" aria-label="상품 고르기">
        <UnderlineTabs
          v-if="kindTabs.length > 1"
          v-model="kind"
          :tabs="kindTabs"
          label="요금 종류"
          id-prefix="kind"
        />
        <div id="kind-panel" :role="kindTabs.length > 1 ? 'tabpanel' : undefined">
          <label for="period" class="product__label">사용 기간</label>
          <PeriodSelect id="period" v-model="days" :days="periods" :disabled="kind === 'L'" />
          <p class="product__hint">{{ PERIOD_HINT[kind] }}</p>
          <h2 id="cap-label" class="product__label">데이터 용량</h2>
          <PlanCards v-model="cap" name="cap" :kind="kind" :cards="cards" labelledby="cap-label" />
        </div>
      </section>
    </div>

    <ProductSections :zone="zone" :kind="kind" />

    <div class="product__buybar">
      <button type="button" class="product__buy" :disabled="!option" @click="sheetOpen = true">
        구매하기
      </button>
    </div>

    <PurchaseSheet
      v-if="option"
      v-model="sheetOpen"
      :summary="selectionLabel(zone, sel)"
      :price="formatWon(option.finalWon)"
      :option-name="optionLabel(option)"
      :naver-url="product.naverUrl"
    />
  </div>
</template>

<style scoped>
.product {
  display: flex;
  flex-direction: column;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.product__top {
  display: flex;
  flex-direction: column;
  padding: 16px 20px 24px;
}

.product__back {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 2px;
  margin-left: -4px;
  color: var(--n-color-neutral-600, #525252);
  font-size: 14.5px;
  text-decoration: none;
}

.product__back svg {
  width: 20px;
  height: 20px;
}

.product__hero {
  width: 100%;
  height: auto;
  margin-top: 10px;
  border-radius: 18px;
  aspect-ratio: 1;
  object-fit: cover;
  background: var(--n-color-neutral-100, #f5f5f5);
}

.product__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}

.product__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--n-color-primary-50, #f1edff);
  color: var(--n-color-primary-600, #5025e8);
  font-size: 12px;
  font-weight: 700;
}

.product__title {
  margin: 10px 0 2px;
  font-size: 23px;
  font-weight: 800;
  color: var(--n-color-neutral-900, #171717);
}

.product__lead {
  margin: 0 0 10px;
  font-size: 14.5px;
  color: var(--n-color-neutral-600, #525252);
}

.product__checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.product__checks li {
  position: relative;
  padding-left: 24px;
  font-size: 14.5px;
  color: var(--n-color-neutral-800, #262626);
}

.product__checks li::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 3px;
  width: 11px;
  height: 6px;
  border-bottom: 2.4px solid var(--n-color-primary-500, #6239ff);
  border-left: 2.4px solid var(--n-color-primary-500, #6239ff);
  transform: rotate(-45deg);
}

.product__picker {
  margin-top: 24px;
}

.product__label {
  display: block;
  margin: 20px 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--n-color-neutral-600, #525252);
}

.product__hint {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--n-color-neutral-500, #737373);
  text-wrap: pretty;
}

/* 탭바(fixed · 1030) 바로 위에 붙는다 — 헤더(1020)보다 위, DS 오버레이(1040/1050)보다 아래 */
.product__buybar {
  position: sticky;
  bottom: calc(var(--shell-tabbar-height, 56px) + env(safe-area-inset-bottom));
  z-index: 1025;
  padding: 10px 20px;
  border-top: 1px solid var(--n-color-neutral-200, #e5e5e5);
  background: var(--n-color-neutral-0, #fff);
}

.product__buy {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: var(--n-color-primary-500, #6239ff);
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.product__buy:disabled {
  background: var(--n-color-neutral-300, #d4d4d4);
  cursor: default;
}

.product__buy:focus-visible {
  outline: 2px solid var(--n-color-primary-700, #3f1cc0);
  outline-offset: 2px;
}
</style>
