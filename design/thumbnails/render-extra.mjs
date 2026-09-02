#!/usr/bin/env node
// 추가이미지 5장 배치 렌더러
//
//   node render-extra.mjs            # 5장 전부 + 검수 시트
//   node render-extra.mjs 1 3        # 지정 번호만
//
// 대표이미지 렌더러(render.mjs)와 같은 규칙: deviceScaleFactor=1 · 엘리먼트 캡처 ·
// fonts.ready 대기 · sRGB 태깅. 사전 준비도 동일 (playwright + 리포 루트 정적 서버).
import { chromium } from 'playwright'
import { crc32 } from 'node:zlib'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const BASE = 'http://localhost:8788/design/thumbnails'
const outRoot = join(HERE, 'out', 'extra')
mkdirSync(outRoot, { recursive: true })

const cfg = JSON.parse(readFileSync(join(HERE, 'data', 'extra-cards.json'), 'utf8'))
const picked = argv.filter((a) => /^\d+$/.test(a)).map(Number)
const targets = picked.length ? cfg.cards.filter((c) => picked.includes(c.n)) : cfg.cards

// 무손실 sRGB 태깅 — IHDR 뒤에 청크만 끼운다 (render.mjs 와 동일)
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body) >>> 0)
  return Buffer.concat([len, body, crc])
}
const u32 = (...v) => {
  const b = Buffer.alloc(v.length * 4)
  v.forEach((x, i) => b.writeUInt32BE(x, i * 4))
  return b
}
const SRGB = Buffer.concat([
  chunk('sRGB', Buffer.from([0])),
  chunk('gAMA', u32(45455)),
  chunk('cHRM', u32(31270, 32900, 64000, 33000, 30000, 60000, 15000, 6000)),
])
const tagSrgb = (f) => {
  const b = readFileSync(f)
  if (b.includes(Buffer.from('sRGB', 'ascii'), 8)) return
  writeFileSync(f, Buffer.concat([b.subarray(0, 33), SRGB, b.subarray(33)]))
}

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1000, height: 1000 },
  deviceScaleFactor: 1,
})

const report = []
for (const c of targets) {
  await page.goto(`${BASE}/extra/card.html?n=${c.n}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 })
  await page.evaluate(() => document.fonts.ready)

  const m = JSON.parse(await page.getAttribute('body', 'data-metrics'))
  const over = (await page.getAttribute('body', 'data-overflow')) === '1'
  const file = join(outRoot, `추가${c.n}_${c.slug}.png`)
  await page.locator('#canvas').screenshot({ path: file })
  tagSrgb(file)

  report.push({ n: c.n, slug: c.slug, ...m, overflow: over, file })
  console.log(
    `${over ? '✗' : '·'} ${c.n} ${c.slug.padEnd(11)} 제목 ${m.title}px · 보조 ${m.sub}px · 높이 ${m.height}${over ? '  ← 넘침' : ''}`,
  )
}

// 검수 시트 — 상세 갤러리 노출 크기(510px)와 썸네일 스트립(80px)을 함께 본다
const cells = report
  .map(
    (r) =>
      `<figure><img src="${r.file.split('/').pop()}" width="300"><figcaption>${r.n}. ${r.slug}</figcaption></figure>`,
  )
  .join('')
const strip = report.map((r) => `<img src="${r.file.split('/').pop()}" width="80">`).join('')
writeFileSync(
  join(outRoot, 'sheet.html'),
  `<!doctype html><meta charset="utf-8"><title>추가이미지 시안</title>` +
    `<style>body{font-family:Pretendard,-apple-system,sans-serif;background:#eef0f4;margin:0;padding:24px;color:#1a1d27}` +
    `h1{font-size:17px;margin:0 0 4px}.lead{font-size:12px;color:#5b6070;margin:0 0 18px;line-height:1.6;max-width:860px}` +
    `h2{font-size:13px;margin:22px 0 10px}main{display:flex;gap:14px;flex-wrap:wrap;background:#fff;padding:16px;border-radius:12px}` +
    `figure{margin:0}img{display:block;border-radius:6px}` +
    `figcaption{font-size:10px;font-weight:700;color:#444;margin-top:5px}` +
    `.strip{display:flex;gap:8px;background:#fff;padding:14px;border-radius:12px;align-items:center}` +
    `.strip img{border-radius:4px;border:1px solid #ddd}</style>` +
    `<h1>추가이미지 시안 — ${report.length}장</h1>` +
    `<p class="lead">검색 노출은 없고 상세 갤러리에서만 보입니다. 문구는 검수 완료된 상세페이지 섹션에서 가져왔습니다.</p>` +
    `<h2>상세 갤러리 크기</h2><main>${cells}</main>` +
    `<h2>썸네일 스트립 (80px) — 캐러셀에서 넘기기 전 상태</h2><div class="strip">${strip}</div>`,
  'utf8',
)

writeFileSync(join(outRoot, 'report.json'), JSON.stringify(report, null, 2) + '\n')
await browser.close()
const bad = report.filter((r) => r.overflow)
console.log(`\n${report.length}장 → ${outRoot}\n검수 시트: ${join(outRoot, 'sheet.html')}`)
if (bad.length) {
  console.log(`⚠ 안전 여백을 넘긴 카드 ${bad.length}건: ${bad.map((b) => b.n).join(', ')}`)
  process.exitCode = 1
}
