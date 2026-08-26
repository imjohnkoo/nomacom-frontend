#!/usr/bin/env node
// 생성된 zone 들의 허브 인덱스 (design/products/index.html) 빌드
// 사용: node build-index.mjs
// zone 목록은 design/products/ 에 실제로 생성된 디렉토리에서 자동 수집한다.
// 표시값은 catalog.json + overrides/<ZONE>.json 에서 파생 — 손으로 고치지 말고 본 스크립트를 재실행할 것.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PRODUCTS = join(HERE, '..');
const catalog = JSON.parse(readFileSync(join(HERE, 'data', 'catalog.json'), 'utf8'));

// slug → zone 코드. 골든(southern-eu)만 slug 가 zone 코드와 다르다.
const SLUG_ZONE = { 'southern-eu': 'EU022' };
const zoneOf = (slug) => SLUG_ZONE[slug] ?? slug.toUpperCase();

const slugs = readdirSync(PRODUCTS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
  .map((d) => d.name)
  .filter((s) => catalog.zones[zoneOf(s)] && existsSync(join(PRODUCTS, s, 'sections')))
  .sort((a, b) => (a === 'southern-eu' ? -1 : b === 'southern-eu' ? 1 : a.localeCompare(b)));

const comma = (n) => n.toLocaleString('en-US');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rows = slugs.map((slug) => {
  const code = zoneOf(slug);
  const z = catalog.zones[code];
  const ovPath = join(HERE, 'overrides', `${code}.json`);
  const ov = existsSync(ovPath) ? JSON.parse(readFileSync(ovPath, 'utf8')) : {};
  const u01 = z.unlimited.plans.U01;
  const days = u01.map((p) => p.days);
  const rv = ov.reviews ?? {};
  return {
    slug,
    code,
    name: ov.zoneName ?? code,
    flags: ov.zoneFlags ?? '',
    countries: z.countriesKr.join(' · '),
    hasQuota: Boolean(z.quota),
    daysRange: `${Math.min(...days)}~${Math.max(...days)}일`,
    minPrice: comma(Math.min(...u01.map((p) => p.finalWon))),
    avg: rv.avg ?? '—',
    total: rv.total ?? 0,
    quotes: (rv.quotes ?? []).length,
    photos: (rv.photos ?? []).length,
    best: `${ov.bestCap ?? '2GB'} / ${ov.bestDays ?? 7}일`,
    golden: slug === 'southern-eu',
  };
});

const card = (r) => `    <a class="card" href="/${r.slug}/index.html" target="_blank">
      <div class="card__top">
        <span class="card__flags">${esc(r.flags)}</span>
        <span class="card__code">${esc(r.code)}</span>
        <span class="tag ${r.hasQuota ? 'tag--ul">U+L' : 'tag--u">U-only'}</span>${
          r.golden ? '<span class="tag tag--gold">GOLDEN</span>' : ''
        }
      </div>
      <div class="card__name">${esc(r.name)}</div>
      <div class="card__countries">${esc(r.countries)}</div>
      <div class="card__grid">
        <div><b>${r.minPrice}</b><small>원부터</small></div>
        <div><b>${esc(r.avg)}</b><small>★ ${r.total}건</small></div>
        <div><b>${esc(r.best)}</b><small>BEST</small></div>
        <div><b>${r.quotes}·${r.photos}</b><small>리뷰·사진</small></div>
      </div>
      <div class="card__foot">${r.daysRange} 자유 선택 · 13 섹션</div>
    </a>`;

const nU = rows.filter((r) => !r.hasQuota).length;
const totalZones = Object.keys(catalog.zones).length;
const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ESIMmany 상세페이지 — 생성 zone 갤러리</title>
<style>
  :root { --fg:#151721; --sub:#6b7080; --line:#e7e9f0; --bg:#f6f7fb;
    --card:#fff; --accent:#5b4ee6; --soft:#efedff; --gold:#b45309; --goldbg:#fffbeb; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);
    font:15px/1.6 Pretendard,"Apple SD Gothic Neo",system-ui,sans-serif}
  .wrap{max-width:1180px;margin:0 auto;padding:40px 24px 80px}
  .eyebrow{color:var(--accent);font-weight:800;font-size:12px;letter-spacing:.09em}
  h1{font-size:25px;margin:6px 0 6px}
  .lede{color:var(--sub);font-size:14px;margin:0 0 8px}
  .stats{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 26px}
  .stat{background:var(--card);border:1px solid var(--line);border-radius:10px;
    padding:8px 14px;font-size:13px}
  .stat b{color:var(--accent);font-size:15px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;
    padding:16px 18px;text-decoration:none;color:inherit;display:block;
    transition:transform .12s ease, box-shadow .12s ease, border-color .12s}
  .card:hover{transform:translateY(-2px);border-color:#c9c3ff;
    box-shadow:0 8px 22px rgba(91,78,230,.13)}
  .card__top{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:7px}
  .card__flags{font-size:16px;letter-spacing:-1px}
  .card__code{font:700 11.5px ui-monospace,Menlo,monospace;color:var(--sub);
    background:#f0f1f7;border-radius:5px;padding:2px 6px}
  .tag{font-size:10.5px;font-weight:800;border-radius:999px;padding:2px 8px}
  .tag--u{background:#eef6ff;color:#0369a1} .tag--ul{background:var(--soft);color:var(--accent)}
  .tag--gold{background:var(--goldbg);color:var(--gold)}
  .card__name{font-weight:800;font-size:15.5px;margin-bottom:3px}
  .card__countries{color:var(--sub);font-size:12.5px;margin-bottom:12px;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .card__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;
    border-top:1px solid var(--line);padding-top:11px}
  .card__grid div{display:flex;flex-direction:column;gap:1px}
  .card__grid b{font-size:13.5px}
  .card__grid small{color:var(--sub);font-size:10.5px}
  .card__foot{margin-top:10px;color:var(--sub);font-size:11.5px}
  .note{margin-top:30px;background:var(--card);border:1px solid var(--line);
    border-radius:12px;padding:16px 20px;font-size:13px;color:#3a3f4d}
  .note b{color:var(--fg)}
  .note ul{margin:8px 0 0;padding-left:18px} .note li{margin:3px 0}
</style></head><body><div class="wrap">
  <div class="eyebrow">ESIMMANY · DETAIL PAGE</div>
  <h1>상세페이지 생성 zone 갤러리</h1>
  <p class="lede">각 카드를 누르면 해당 zone 의 13 섹션 갤러리가 새 탭으로 열립니다.</p>
  <div class="stats">
    <div class="stat"><b>${rows.length}</b> zone 생성</div>
    <div class="stat"><b>${nU}</b> U-only · <b>${rows.length - nU}</b> U+L</div>
    <div class="stat"><b>${totalZones}</b> zone 중 진행 (나머지 ${totalZones - rows.length} 는 P3)</div>
    <div class="stat">가격 기준 <b>${esc(catalog.meta?.sourceGeneratedAt ?? '—')}</b> export</div>
  </div>
  <div class="grid">
${rows.map(card).join('\n')}
  </div>
  <div class="note">
    <b>보실 때 참고</b>
    <ul>
      <li><b>GOLDEN</b> = southern-eu (EU022). 생성기가 이 페이지를 그대로 재현하는지로 검증하는 기준본입니다.</li>
      <li><b>BEST</b> 는 실제 주문 데이터(최근 1년) 1위 옵션입니다 — 03 Plan picker 표에서 노란 셀로 표시됩니다.</li>
      <li>리뷰·사진은 스마트스토어 실구매 후기이며, <b>전면 긍정 리뷰만</b> 발췌했습니다.</li>
      <li>08 Coverage 의 지도는 아직 없습니다(국가 카드만). 지도 자산 수급은 P3 항목입니다.</li>
      <li>가격은 현행 판매가입니다. 신규 가격표는 공급사 계약 게이트가 열린 뒤 반영합니다.</li>
    </ul>
    <p style="margin:10px 0 0;color:#6b7080;font-size:12px">
      이 페이지는 <code>_generator/build-index.mjs</code> 산출물입니다. 직접 고치지 말고 스크립트를 재실행하세요.</p>
  </div>
</div></body></html>
`;

const out = join(PRODUCTS, 'index.html');
writeFileSync(out, html);
console.log(`허브 인덱스 → ${out} (${rows.length} zone: ${slugs.join(', ')})`);
