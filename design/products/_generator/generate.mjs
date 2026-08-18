#!/usr/bin/env node
// zone 상세페이지 생성기 (P1)
// 사용:
//   node generate.mjs EU022 --out <dir>            # 생성
//   node generate.mjs EU022 --golden <refDir>      # 생성 + 정규화 diff (golden 검증)
// 입력: data/catalog.json + overrides/<ZONE>.json + templates/
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const zoneId = process.argv[2];
const argOf = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : null;
};
const outDir = argOf('--out');
const goldenRef = argOf('--golden');
if (!zoneId || (!outDir && !goldenRef)) {
  console.error('사용법: node generate.mjs <ZONE> --out <dir> | --golden <refDir>');
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(join(HERE, 'data', 'catalog.json'), 'utf8'));
const zone = catalog.zones[zoneId];
if (!zone) {
  console.error(`catalog 에 없는 zone: ${zoneId}`);
  process.exit(1);
}
const ovPath = join(HERE, 'overrides', `${zoneId}.json`);
const ov = existsSync(ovPath) ? JSON.parse(readFileSync(ovPath, 'utf8')) : {};

// ── 파생값 ──────────────────────────────────────────
const comma = (n) => n.toLocaleString('en-US');
const u = zone.unlimited;
const q = zone.quota;
const u01 = u.plans.U01;
const u02 = u.plans.U02;
const daysArr = u01.map((p) => p.days);
const maxDays = Math.max(...daysArr);
const bestDays = ov.bestDays ?? 7;
const perDayMin = Math.floor(u01.at(-1).finalWon / maxDays);
const secondMaxDays = daysArr.length > 1 ? daysArr.at(-2) : null;

const uRows = u01.map((p, i) => {
  const p2 = u02[i];
  const isMax = p.days === maxDays;
  const isSecond = p.days === secondMaxDays;
  return {
    days: p.days,
    u01: comma(p.finalWon),
    u02: comma(p2.finalWon),
    u01Attr: isMax ? ' class="cell-long"' : '',
    u01Tag: isMax ? `<span class="tag-inline tag-long">₩${comma(perDayMin)}/일</span>` : '',
    u02Attr: p.days === bestDays ? ' class="cell-best"' : isMax || isSecond ? ' class="cell-long"' : '',
    u02Tag: p.days === bestDays ? '<span class="tag-inline tag-best">BEST</span>' : '',
  };
});

let qCtx = {};
if (q) {
  const bestGb = ov.bestGb ?? 10;
  const maxGb = Math.max(...q.tiers.map((t) => t.gb));
  const minGb = Math.min(...q.tiers.map((t) => t.gb));
  const qTiers = q.tiers.map((t) => {
    const per = Math.round(t.finalWon / t.gb);
    const isBest = t.gb === bestGb;
    const isMax = t.gb === maxGb;
    return {
      gb: t.gb,
      final: comma(t.finalWon),
      perGb: comma(per),
      finalAttr: isBest ? ' class="cell-best"' : isMax ? ' class="cell-long"' : '',
      finalTag: isBest
        ? '<span class="tag-inline tag-best">BEST</span>'
        : isMax
          ? `<span class="tag-inline tag-long">${ov.qMaxTag ?? '노매드'}</span>`
          : '',
      perGbAttr: isBest ? ' class="cell-best"' : isMax ? ' class="cell-long"' : '',
    };
  });
  qCtx = {
    qTiers,
    quotaDays: q.tiers[0].days,
    quotaRangeGb: `${minGb}~${maxGb}GB`,
    quotaGuideGb: `${bestGb}~${maxGb}GB`,
    quotaGuideRec: `${bestGb}GB`,
    quotaMinPerGb: comma(Math.min(...qTiers.map((t) => Number(t.perGb.replace(/,/g, ''))))),
  };
}

const countryCount = zone.countriesKr.length;
const hasQuota = Boolean(q);
const daysRangeIl = `${Math.min(...daysArr)}~${maxDays}일`;
const reviews = ov.reviews ?? {};

const ctx = {
  // catalog 파생
  countriesKr2: zone.countriesKr.join('·'),
  countryCount,
  isMulti: countryCount > 1,
  hasQuota,
  daysRange: `${Math.min(...daysArr)}~${maxDays}`,
  daysRangeIl,
  daysList: daysArr.join('·') + '일',
  daysCount: daysArr.length,
  maxDays,
  minPrice: comma(u01[0].finalWon),
  perDayMin: comma(perDayMin),
  u02d07: comma((u02.find((p) => p.days === 7) ?? u02[0]).finalWon),
  uRows,
  ...qCtx,
  productCodes: [u.productCode, q?.productCode].filter(Boolean).join('·'),
  sectionCount: 13,
  planPickerHint: hasQuota ? `무제한/종량제 토글 + ${daysRangeIl} 가격표` : `무제한 ${daysRangeIl} 가격표`,
  quotesCount: (reviews.quotes ?? []).length,
  photosCount: (reviews.photos ?? []).length,
  // 기본값 (override 로 교체 가능)
  roamingPrice: '~35,000',
  usimPrice: '~28,000',
  galleryVersion: 'v1',
  galleryNote: '생성기 v1',
  rating: reviews.avg ?? '',
  reviewsAvg: reviews.avg ?? '',
  reviewsTotal: reviews.total ?? '',
  reviewsAsOf: reviews.asOf ?? '',
  reviewRows: reviews.rows ?? [],
  quotes: (reviews.quotes ?? []).map((qt, i) => ({ spanCls: i === 0 ? ' quote--span' : '', ...qt })),
  photos: reviews.photos ?? [],
  ...Object.fromEntries(Object.entries(ov).filter(([k]) => !['reviews', 'coverage', 'bestDays', 'bestGb', 'qMaxTag'].includes(k))),
  ...(ov.coverage ?? {}),
};

// ── 미니 템플릿 엔진 ─────────────────────────────────
function render(tpl, scope) {
  // 블록: {{#if k}} {{#unless k}} {{#each k}} — 균형 파싱 (동일 태그 중첩 지원)
  const blockRe = /\{\{#(if|unless|each)\s+([\w.]+)\}\}/;
  let out = '';
  let rest = tpl;
  for (;;) {
    const m = rest.match(blockRe);
    if (!m) return out + interpolate(rest, scope);
    out += interpolate(rest.slice(0, m.index), scope);
    const kind = m[1];
    const key = m[2];
    let depth = 1;
    let i = m.index + m[0].length;
    const tagRe = new RegExp(`\\{\\{#${kind}\\s+[\\w.]+\\}\\}|\\{\\{\\/${kind}\\}\\}`, 'g');
    tagRe.lastIndex = i;
    let end = -1;
    let t;
    while ((t = tagRe.exec(rest))) {
      depth += t[0].startsWith(`{{#`) ? 1 : -1;
      if (depth === 0) {
        end = t.index;
        break;
      }
    }
    if (end < 0) throw new Error(`unclosed {{#${kind} ${key}}}`);
    const body = rest.slice(i, end);
    const val = lookup(scope, key);
    if (kind === 'each') {
      for (const item of val ?? []) out += render(body, { ...scope, '.': item });
    } else {
      const truthy = Array.isArray(val) ? val.length > 0 : Boolean(val);
      if (kind === 'if' ? truthy : !truthy) out += render(body, scope);
    }
    rest = rest.slice(end + `{{/${kind}}}`.length);
  }
}
const lookup = (scope, key) =>
  key.startsWith('.') ? scope['.']?.[key.slice(1)] : scope[key];
const interpolate = (s, scope) =>
  s.replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
    const v = lookup(scope, k);
    return v === undefined || v === null ? '' : String(v);
  });

// ── 생성 ────────────────────────────────────────────
const tplDir = join(HERE, 'templates');
const dest = outDir ?? join(HERE, '.golden-out', zoneId.toLowerCase());
mkdirSync(join(dest, 'sections'), { recursive: true });
const rendered = [];
for (const f of readdirSync(join(tplDir, 'sections')).filter((f) => f.endsWith('.html'))) {
  writeFileSync(join(dest, 'sections', f), render(readFileSync(join(tplDir, 'sections', f), 'utf8'), ctx));
  rendered.push(`sections/${f}`);
}
writeFileSync(join(dest, 'index.html'), render(readFileSync(join(tplDir, 'index.html'), 'utf8'), ctx));
rendered.push('index.html');
cpSync(join(tplDir, 'shared'), join(dest, 'shared'), { recursive: true });
console.log(`${zoneId} → ${dest} (${rendered.length} html + shared)`);

// ── golden diff ─────────────────────────────────────
if (goldenRef) {
  const normalize = (s) =>
    s
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim();
  let fail = 0;
  for (const f of rendered) {
    const a = normalize(readFileSync(join(dest, f), 'utf8'));
    const b = normalize(readFileSync(join(goldenRef, f), 'utf8'));
    if (a !== b) {
      fail++;
      // 첫 불일치 지점 주변 출력
      let i = 0;
      while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
      console.log(`✗ ${f}\n  gen: …${a.slice(Math.max(0, i - 60), i + 90)}…\n  ref: …${b.slice(Math.max(0, i - 60), i + 90)}…`);
    } else {
      console.log(`✓ ${f}`);
    }
  }
  console.log(fail === 0 ? '\nGOLDEN PASS — 정규화 diff 0' : `\nGOLDEN FAIL — ${fail} 파일 불일치`);
  process.exit(fail === 0 ? 0 : 1);
}
