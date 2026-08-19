#!/usr/bin/env node
// backend export JSON → curated catalog.json 추출
// 사용: node extract-catalog.mjs <path/to/export.json>
// 원칙: 벤더 ID (mayaUid·sparkTemplateId) 제거, irregular 상품 제외,
//        가격 3요소 (salePrice/immediateDiscount/optionPrice) 보존 + finalWon 편의 계산.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) {
  console.error('사용법: node extract-catalog.mjs <export.json>');
  process.exit(1);
}
const raw = JSON.parse(readFileSync(src, 'utf8'));
const irregular = new Set((raw.gaps?.irregularProducts ?? []).map((p) => p.originProductNo));

// backend export 의 구 국호를 현행 표기로 교정 (nomacom-manager 2026-08-20 handoff 확인분)
const COUNTRY_KR_FIX = { 터키: '튀르키예' };

const zones = {};
for (const p of raw.products) {
  if (!p.productCode || irregular.has(p.originProductNo)) continue;
  const kind = p.productCode.endsWith('L') ? 'quota' : 'unlimited';
  const zone = p.zone;
  zones[zone] ??= { countriesKr: [], countriesIso: [] };

  const baseWon = p.salePriceWon - p.immediateDiscountWon;
  const entry = {
    productCode: p.productCode,
    channelProductNo: p.channelProductNo,
    naverName: p.naverName,
    salePriceWon: p.salePriceWon,
    immediateDiscountWon: p.immediateDiscountWon,
    baseWon,
  };

  if (kind === 'unlimited') {
    entry.plans = { U01: [], U02: [] };
    for (const o of p.options) {
      const m = o.sku?.match(/^.{5}(U0[12])D(\d{2})V\d+$/);
      if (!m) continue;
      entry.plans[m[1]].push({ days: Number(m[2]), optionWon: o.optionPriceWon, finalWon: baseWon + o.optionPriceWon });
    }
    for (const k of Object.keys(entry.plans)) entry.plans[k].sort((a, b) => a.days - b.days);
  } else {
    entry.tiers = [];
    for (const o of p.options) {
      const m = o.sku?.match(/^.{5}L(\d{2})D(\d{2})V\d+$/);
      if (!m) continue;
      entry.tiers.push({ gb: Number(m[1]), days: Number(m[2]), optionWon: o.optionPriceWon, finalWon: baseWon + o.optionPriceWon });
    }
    entry.tiers.sort((a, b) => a.gb - b.gb);
  }
  zones[zone][kind] = entry;

  const c = p.options.find((o) => o.db?.countriesKr?.length)?.db;
  if (c && !zones[zone].countriesKr.length) {
    zones[zone].countriesKr = c.countriesKr.map((n) => COUNTRY_KR_FIX[n] ?? n);
    zones[zone].countriesIso = c.countriesIso;
  }
}

const catalog = {
  meta: {
    source: 'docs/data/2026-08-18-product-catalog-export.json (로컬 전용, gitignore)',
    sourceGeneratedAt: raw.generatedAt,
    note: '벤더 ID 제거본 (curated). 가격 개정 시 backend export 재발급 → 본 스크립트 재실행.',
  },
  policies: raw.policies,
  pricingModel: raw.pricingModel,
  zones,
};

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'data');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'catalog.json');
writeFileSync(out, JSON.stringify(catalog, null, 2) + '\n');
const zn = Object.keys(zones);
console.log(`zones: ${zn.length} (U+L: ${zn.filter((z) => zones[z].quota).length}) → ${out}`);
