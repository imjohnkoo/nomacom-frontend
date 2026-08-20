#!/usr/bin/env node
// 대표 썸네일 배치 렌더러
//
//   node render.mjs                       # 전 SKU
//   node render.mjs EU022U ITA00U         # 지정 SKU 만
//   node render.mjs --scheme duo --model female --model-layer front
//   node render.mjs --sheet               # 120px 검수 시트도 함께 생성
//
// 사전 준비 (둘 다 필요):
//   1) npx playwright install chromium
//   2) 리포 루트에서 정적 서버:  python3 -m http.server 8788
//      (template/rep.html 이 fetch 를 쓰므로 file:// 로는 안 된다)
//
// 출력: out/{SKU}/{SKU}_00_rep.png   — 네이밍은 manager 세션 합의안
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 ? argv[i + 1] : dflt
}
const has = (name) => argv.includes(`--${name}`)

const BASE = flag('base', 'http://localhost:8788/design/thumbnails')
const scheme = flag('scheme', 'mono')
const model = flag('model', 'female')
const modelLayer = flag('model-layer', 'back')
const logo = flag('logo', 'kor')
const sub = has('sub') ? '1' : '0'
const outRoot = join(HERE, flag('out', 'out'))

const index = JSON.parse(readFileSync(join(HERE, 'data', 'thumbnails.json'), 'utf8'))
const picked = argv.filter((a) => /^[A-Z]{3}\d{2}[UL]$|^EU\d{3}[UL]$/.test(a))
const targets = picked.length ? index.items.filter((i) => picked.includes(i.sku)) : index.items
if (!targets.length) {
  console.error('대상 SKU 가 없습니다.')
  process.exit(1)
}

const browser = await chromium.launch()
// deviceScaleFactor=1 — 네이버가 어차피 파생본을 다시 만들므로 2x 는 용량만 늘린다.
const page = await browser.newPage({
  viewport: { width: 1000, height: 1000 },
  deviceScaleFactor: 1,
})

const report = []
for (const item of targets) {
  const url = `${BASE}/template/rep.html?sku=${item.sku}&scheme=${scheme}&model=${model}&modelLayer=${modelLayer}&logo=${logo}&sub=${sub}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 })

  // 폰트가 폴백으로 렌더된 채 캡처되는 사고를 막는다 (에셋 가이드 §9 렌더링 함정 ①)
  await page.evaluate(() => document.fonts.ready)

  const fit = JSON.parse(await page.getAttribute('body', 'data-fit'))
  const dir = join(outRoot, item.sku)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${item.sku}_00_rep.png`)

  // 전체 페이지가 아니라 캔버스 요소만 — 스크롤바가 섞이면 1000px 정사각이 깨진다.
  await page.locator('#mount > .canvas').screenshot({ path: file })

  const at120 = Math.round(fit.size * 1.2) / 10
  report.push({
    sku: item.sku,
    label: item.label,
    size: fit.size,
    at120,
    lines: fit.lines,
    fits: fit.fits,
    file,
  })
  const mark = !fit.fits ? '✗' : at120 < 10 ? '△' : '·'
  console.log(
    `${mark} ${item.sku.padEnd(8)} ${String(item.label).padEnd(14)} ${fit.size}px → ${at120}px@120  ${fit.lines}줄`,
  )
}

// 120px 전수 검수 시트 — 렌더 결과를 한 장으로 훑기 위한 것
if (has('sheet')) {
  const cells = report
    .map(
      (r) =>
        `<figure><img src="${r.sku}/${r.sku}_00_rep.png" width="120" height="120">` +
        `<figcaption>${r.sku}${r.fits ? '' : ' ⚠'}</figcaption></figure>`,
    )
    .join('')
  writeFileSync(
    join(outRoot, 'sheet.html'),
    `<!doctype html><meta charset="utf-8"><title>120px 검수 시트</title>` +
      `<style>body{font-family:Pretendard,-apple-system,sans-serif;background:#eef0f4;padding:24px}` +
      `main{display:flex;flex-wrap:wrap;gap:16px 14px;background:#fff;padding:18px;border-radius:12px}` +
      `figure{margin:0;width:120px}img{display:block;border-radius:4px}` +
      `figcaption{font-size:9px;font-weight:800;color:#525252;margin-top:5px}</style>` +
      `<h1 style="font-size:15px">120px 전수 검수 — ${report.length}장</h1><main>${cells}</main>`,
    'utf8',
  )
  console.log(`\n검수 시트: ${join(outRoot, 'sheet.html')}`)
}

writeFileSync(
  join(outRoot, 'render-report.json'),
  JSON.stringify({ scheme, model, modelLayer, logo, sub: sub === '1', items: report }, null, 2) +
    '\n',
)
await browser.close()

const failed = report.filter((r) => !r.fits)
console.log(
  `\n${report.length}장 · 옵션 scheme=${scheme} model=${model}/${modelLayer} logo=${logo} sub=${sub}`,
)
if (failed.length) {
  console.log(
    `⚠ 지명이 하한에서도 안 들어간 SKU ${failed.length}건 — 라벨 축약 필요: ${failed.map((f) => f.sku).join(', ')}`,
  )
  process.exitCode = 1
}
