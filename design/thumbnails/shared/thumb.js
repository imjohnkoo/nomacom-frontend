/* ====================================================================
   썸네일 캔버스 빌더 — template/rep.html 과 studio.html 이 공유.

   지명 길이가 「이탈리아」부터 「북유럽 5개국」까지 제각각이라
   clamp() 로는 안 맞는다. 실제로 폭을 재서 줄이는 루프를 돈다.
   (에셋 가이드 §9 「렌더링 함정 ②」)
   ==================================================================== */

export const DEFAULTS = {
  scheme: 'lime', // 'mono' | 'duo' | 'lime' — 플랜 유형 색 프리셋 (john 확정: lime)
  model: 'female', // 'male' | 'female' | 'none' — 여성 고정 (john 결정 2026-08-20)
  modelLayer: 'back', // 'back' = 텍스트가 위 (기본) | 'front' = 모델이 위
  logo: 'kor', // 'kor' | 'eng' | 'square'
  showSub: true, // 국가명 보조줄 (john 확정: 표시). 2~3국 SKU 에만 값이 있다
  showFlags: true, // 지명 위 국기 줄. 구성 국가 전부 (john 결정 2026-08-20)
  guides: false,
  maxTitleLines: 2,
}

const LOGO_SRC = {
  kor: 'logo_light_kor.png',
  eng: 'logo_light_eng.png',
  square: 'logo_light_square.png',
}

/** 캔버스 DOM 을 만든다. assetBase 는 assets/ 까지의 상대 경로. */
export function createCanvas(item, opts = {}, assetBase = 'assets') {
  const o = { ...DEFAULTS, ...opts }
  const el = document.createElement('div')
  el.className = 'canvas thumb'
  el.dataset.plan = item.planType
  el.dataset.scheme = o.scheme
  el.dataset.model = o.model
  el.dataset.modelLayer = o.modelLayer
  el.dataset.sku = item.sku
  // 2~4글자 한 낱말 지명은 자간을 넓힌다 (가이드 §3). 「독일」·「체코」처럼 짧으면
  // 기본 자간에서 글자가 한 덩어리로 붙어 보인다.
  if (/^[가-힣]{2,4}$/.test(item.label.trim())) el.dataset.titleLen = 'short'
  if (o.guides) el.dataset.guides = 'on'

  const sub = o.showSub && item.sub ? `<div class="thumb__sub">${item.sub}</div>` : ''
  const flags =
    o.showFlags && item.flags?.length
      ? `<div class="thumb__flags">${item.flags.join('')}</div>`
      : ''
  const model =
    o.model === 'none'
      ? ''
      : `<div class="thumb__model"><img src="${assetBase}/models/model_${o.model}.png" alt="" /></div>`

  el.innerHTML = `
    <div class="thumb__text">
      <span class="thumb__logo"><img src="${assetBase}/logo/${LOGO_SRC[o.logo]}" alt="eSIM마니" /></span>
      <div class="thumb__stack">
        ${flags}
        <div class="thumb__title">${item.label}</div>
        ${sub}
        <div class="thumb__badge">${item.badge}</div>
      </div>
    </div>
    ${model}`
  return el
}

/**
 * 지명을 주어진 줄 수 안에 넣는다.
 * 하한 100px 은 에셋 가이드의 「주역 텍스트 글자 높이 100px 이상」 기준.
 * 하한에서도 안 들어가면 줄이지 않고 fits:false 를 돌려준다 — 조용히
 * 판독 불가 크기로 내려가는 것보다 QA 에서 걸리는 편이 낫다.
 */
export function fitTitle(canvasEl, { min = 100, max = null, maxLines = null, item = null } = {}) {
  const el = canvasEl.querySelector('.thumb__title')
  if (!el) return { fits: true, size: null }
  // 「이탈리아」 같은 한 낱말은 한 줄이어야 한다 — 음절 중간에서 끊기면 읽기가 무너진다.
  // 「남유럽 2개국」처럼 어절이 둘이면 두 줄이 오히려 크게 쓸 수 있어 유리하다.
  const lines_ = maxLines ?? (/\s/.test(el.textContent.trim()) ? 2 : 1)
  // 상한은 --title-size (스튜디오 슬라이더 값). 들어가면 그대로, 넘치면 줄인다.
  const ceiling =
    max ?? (parseFloat(getComputedStyle(canvasEl).getPropertyValue('--title-size')) || 132)

  el.style.fontSize = ''
  for (let size = ceiling; size >= min; size -= 2) {
    el.style.fontSize = `${size}px`
    const lineHeight =
      size * (parseFloat(getComputedStyle(canvasEl).getPropertyValue('--title-lh')) || 0.92)
    const lines = Math.round(el.scrollHeight / lineHeight)
    const overflowX = el.scrollWidth > el.clientWidth + 1
    if (!overflowX && lines <= lines_) return { fits: true, size, lines }
  }
  // 대표국 2개짜리 지명이 하한에서도 2줄에 안 들어가면, 대표국을 하나로 줄이고
  // 나머지 국가를 보조줄로 넘긴다. 어느 SKU 가 해당하는지는 실제 폭을 재봐야
  // 알 수 있어서 데이터 단계가 아니라 측정한 자리에서 갈아탄다.
  if (item?.labelSingle && el.textContent !== item.labelSingle) {
    el.textContent = item.labelSingle
    const subEl = canvasEl.querySelector('.thumb__sub')
    if (subEl) subEl.textContent = item.subSingle
    const r = fitTitle(canvasEl, { min, max, maxLines })
    return { ...r, fellBack: true, from: item.label, to: item.labelSingle }
  }

  el.style.fontSize = `${min}px`
  const lineHeight =
    min * (parseFloat(getComputedStyle(canvasEl).getPropertyValue('--title-lh')) || 0.92)
  return {
    fits: false,
    size: min,
    lines: Math.round(el.scrollHeight / lineHeight),
    overflowX: el.scrollWidth > el.clientWidth + 1,
    maxLines: lines_,
  }
}

/**
 * 국기 줄을 텍스트 컬럼 폭 안에 넣는다.
 * 6개국이면 이모지 6개가 한 줄에 들어가야 하므로 개수만큼 작아진다.
 * 하한 60px — 120px 노출에서 7.2px 이라 이보다 작으면 색 덩어리로도 안 읽힌다.
 */
export function fitFlags(canvasEl, { min = 60, max = null } = {}) {
  const el = canvasEl.querySelector('.thumb__flags')
  if (!el) return { fits: true, size: null }
  const ceiling =
    max ?? (parseFloat(getComputedStyle(canvasEl).getPropertyValue('--flag-size')) || 120)

  el.style.fontSize = ''
  for (let size = ceiling; size >= min; size -= 2) {
    el.style.fontSize = `${size}px`
    if (el.scrollWidth <= el.clientWidth + 1) return { fits: true, size }
  }
  el.style.fontSize = `${min}px`
  return { fits: false, size: min, overflowX: el.scrollWidth > el.clientWidth + 1 }
}

/**
 * 카피 스택이 로고를 침범하지 않게 --stack-y 를 깎는다.
 * --stack-y 는 무조건 위로 미는 값이라, 보조 국가명 줄이 붙어 스택이 길어지는
 * 3국 SKU 에서는 그대로 두면 지명이 로고 위로 올라탄다.
 * 요청한 값을 그대로 못 쓴 경우 clamped 로 알린다 — 조용히 다르게 그리지 않는다.
 */
export function fitStack(canvasEl, { minGap = 24, safe = 50, gapFloor = 16 } = {}) {
  const stack = canvasEl.querySelector('.thumb__stack')
  const logo = canvasEl.querySelector('.thumb__logo')
  if (!stack || !logo) return { clamped: false, fits: true }
  const cs = getComputedStyle(canvasEl)
  const want = parseFloat(cs.getPropertyValue('--stack-y')) || 0
  const wantGap = parseFloat(cs.getPropertyValue('--stack-gap')) || 0

  const cb = canvasEl.getBoundingClientRect()
  const scale = cb.width / 1000 || 1
  const at = (px) => (px - cb.top) / scale
  const measure = () => stack.getBoundingClientRect().height / scale

  stack.style.gap = ''
  stack.style.transform = `translateY(${want}px)`
  const top = at(logo.getBoundingClientRect().bottom) + minGap
  const room = 1000 - safe - top

  // 요청한 덩어리 간격으로 안 들어가면 간격만 조인다. 글자 크기는 건드리지 않는다 —
  // 가독성 수치가 통과한 값을 레이아웃 사정으로 깎지 않기 위해서다.
  let gap = wantGap
  let h = measure()
  while (h > room && gap > gapFloor) {
    gap = Math.max(gapFloor, gap - 2)
    stack.style.gap = `${gap}px`
    h = measure()
  }

  const y0 = at(stack.getBoundingClientRect().top) - want
  const gapSqueezed = gap < wantGap ? Math.round(wantGap - gap) : 0
  if (h > room) {
    stack.style.transform = `translateY(${top - y0}px)`
    return {
      clamped: true,
      fits: false,
      overBy: Math.round(h - room),
      height: Math.round(h),
      gapSqueezed,
    }
  }
  const y = Math.min(Math.max(want, top - y0), 1000 - safe - h - y0)
  stack.style.transform = `translateY(${y}px)`
  return {
    clamped: Math.abs(y - want) > 1,
    fits: true,
    y: Math.round(y),
    requested: want,
    movedBy: Math.round(y - want),
    gap: Math.round(gap),
    gapSqueezed,
  }
}

/** 데이터 인덱스 로드 */
export async function loadIndex(url = 'data/thumbnails.json') {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`${url} 로드 실패 (${res.status}) — 로컬 서버로 열었는지 확인`)
  return res.json()
}

/** 폰트가 실제로 적용된 뒤에만 렌더 결과를 신뢰할 수 있다. */
export async function fontsReady() {
  if (document.fonts?.ready) await document.fonts.ready
}
