/**
 * zone 지도 SVG 축소 — 2609 생성기 지도(Natural Earth · public domain)는 합계 31.5MB(78 zone)라 그대로 못 싣는다.
 *  1. viewBox 밖(여유 20)에만 있는 고리(ring)는 버린다
 *  2. 앞 점과 가로 + 세로 거리가 `tolerance` 미만인 점을 솎는다(기본 2 — 390px 화면에서 0.6px 이하)
 *  3. 좌표를 정수로 반올림하고 상대 좌표(`l`)로 적는다 · 주석 · 태그 사이 공백 제거
 * 2026-09-23 실측: 78 zone 31.5MB → 7.27MB, 장당 최대 184KB(plan §2.3 상한 8MB · 250KB).
 * 원본 경로는 절대 좌표 M · L · Z 만 쓴다 — 다른 명령이 보이면 망가뜨리지 않도록 throw 한다.
 */

type Pt = [number, number]

const MARGIN = 20

function parseRings(d: string): Pt[][] {
  const rings: Pt[][] = []
  let cur: Pt[] = []
  const re = /([A-Za-z])\s*(?:(-?[\d.]+)[ ,](-?[\d.]+))?/g
  for (const m of d.matchAll(re)) {
    const cmd = m[1]!
    if (cmd === 'M') {
      if (cur.length) rings.push(cur)
      cur = [[Number(m[2]), Number(m[3])]]
    } else if (cmd === 'L') {
      cur.push([Number(m[2]), Number(m[3])])
    } else if (cmd === 'Z' || cmd === 'z') {
      if (cur.length) rings.push(cur)
      cur = []
    } else {
      throw new Error(`지도 경로에 지원하지 않는 명령 «${cmd}» — M · L · Z 만`)
    }
  }
  if (cur.length) rings.push(cur)
  return rings
}

function simplify(pts: Pt[], tol: number): Pt[] {
  if (pts.length <= 3) return pts
  const keep: Pt[] = [pts[0]!]
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!
    const q = keep[keep.length - 1]!
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) >= tol) keep.push(p)
  }
  keep.push(pts[pts.length - 1]!)
  return keep
}

function encodeRing(ring: Pt[]): string {
  const pts: Pt[] = []
  for (const [x, y] of ring) {
    const p: Pt = [Math.round(x), Math.round(y)]
    const last = pts[pts.length - 1]
    if (!last || last[0] !== p[0] || last[1] !== p[1]) pts.push(p)
  }
  if (pts.length < 3) return ''
  let [px, py] = pts[0]!
  const rel = pts.slice(1).map(([x, y]) => {
    const s = `${x - px} ${y - py}`
    px = x
    py = y
    return s
  })
  return `M${pts[0]![0]} ${pts[0]![1]}l${rel.join(' ')}z`
}

export function optimizeMapSvg(svg: string, tolerance = 2): string {
  const vb = svg
    .match(/viewBox="([^"]+)"/)?.[1]
    ?.split(/\s+/)
    .map(Number)
  if (!vb || vb.length !== 4 || vb.some((n) => !Number.isFinite(n)))
    throw new Error('지도에 viewBox 가 없다')
  const [x0, y0, w, h] = vb as [number, number, number, number]
  const visible = (ring: Pt[]) => {
    const xs = ring.map((p) => p[0])
    const ys = ring.map((p) => p[1])
    return !(
      Math.max(...xs) < x0 - MARGIN ||
      Math.min(...xs) > x0 + w + MARGIN ||
      Math.max(...ys) < y0 - MARGIN ||
      Math.min(...ys) > y0 + h + MARGIN
    )
  }
  return svg
    .replace(
      /<path([^>]*?)d="([^"]+)"([^>]*)\/>/g,
      (_all, before: string, d: string, after: string) => {
        const enc = parseRings(d)
          .filter(visible)
          .map((r) => encodeRing(simplify(r, tolerance)))
          .join('')
        return enc ? `<path${before}d="${enc}"${after}/>` : ''
      },
    )
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim()
}
