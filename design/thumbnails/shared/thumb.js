/* ====================================================================
   썸네일 캔버스 빌더 — template/rep.html 과 studio.html 이 공유.

   지명 길이가 「이탈리아」부터 「북유럽 5개국」까지 제각각이라
   clamp() 로는 안 맞는다. 실제로 폭을 재서 줄이는 루프를 돈다.
   (에셋 가이드 §9 「렌더링 함정 ②」)
   ==================================================================== */

export const DEFAULTS = {
  scheme: 'mono', // 'mono' | 'duo' — 플랜 유형 색 프리셋
  model: 'female', // 'male' | 'female' | 'none' — 여성 고정 (john 결정 2026-08-20)
  modelLayer: 'back', // 'back' = 텍스트가 위 (기본) | 'front' = 모델이 위
  logo: 'kor', // 'kor' | 'eng' | 'square'
  showSub: false, // 국가명 보조줄. 켜면 텍스트 덩어리 3개(하한)
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
  if (o.guides) el.dataset.guides = 'on'

  const sub = o.showSub && item.sub ? `<div class="thumb__sub">${item.sub}</div>` : ''
  const model =
    o.model === 'none'
      ? ''
      : `<div class="thumb__model"><img src="${assetBase}/models/model_${o.model}.png" alt="" /></div>`

  el.innerHTML = `
    <div class="thumb__text">
      <span class="thumb__logo"><img src="${assetBase}/logo/${LOGO_SRC[o.logo]}" alt="eSIM마니" /></span>
      <div class="thumb__stack">
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
export function fitTitle(canvasEl, { min = 100, max = null, maxLines = null } = {}) {
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
