/**
 * CORS middleware — Nitro/h3.
 *
 * 정책:
 *  - `/api/**` 만 CORS 적용 (SSR 페이지는 same-origin 이라 불필요)
 *  - 화이트리스트 origin: localhost dev(웹 Nuxt + Expo dev) + prod CloudFront + 런타임 ENV 추가
 *  - 허용 헤더: Authorization, Content-Type, X-Client-Platform, X-Requested-With
 *  - expose 헤더: X-Client-Platform (mobile 측 디버깅용)
 *  - credentials: false — 본 PR 은 Bearer + cookie 둘 다 받지만, mobile 채널은 cookie 무관 / 웹은 same-origin 이라 cross-origin credentials 불필요
 *  - preflight (OPTIONS) 204 단답
 */

import { handleCors } from 'h3'

const STATIC_ORIGINS = [
  // 웹 Nuxt dev
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Expo dev server (web)
  'http://localhost:8081',
  'http://localhost:19006',
  // prod (CloudFront — A-4 결과)
  'https://d3un5i1lmp1eem.cloudfront.net',
]

/** Expo 네이티브 dev 의 origin 패턴 — exp:// 또는 http://192.168.x.x:8081 등 LAN IP */
const ORIGIN_PATTERNS: RegExp[] = [
  /^exp:\/\//,
  /^http:\/\/(?:\d{1,3}\.){3}\d{1,3}:(?:8081|19006|19000)$/,
]

function isOriginAllowed(origin: string, extraOrigins: string[]): boolean {
  if (STATIC_ORIGINS.includes(origin)) return true
  if (extraOrigins.includes(origin)) return true
  return ORIGIN_PATTERNS.some((re) => re.test(origin))
}

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''
  // SSR 페이지는 CORS 무관 — /api/** 만 처리
  if (!url.startsWith('/api/')) return

  const requestOrigin = getRequestHeader(event, 'origin')

  // origin 없는 호출 (curl, server-to-server, mobile 일부) 은 CORS 검사 자체 불필요 → preflight 만 처리
  if (!requestOrigin) {
    if (event.method === 'OPTIONS') {
      // preflight 그대로 204
      return handleCors(event, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Authorization', 'Content-Type', 'X-Client-Platform', 'X-Requested-With'],
        exposeHeaders: ['X-Client-Platform'],
        maxAge: '600',
      })
    }
    return
  }

  const config = useRuntimeConfig()
  const extra = (config.corsExtraOrigins as string[] | undefined) ?? []

  if (!isOriginAllowed(requestOrigin, extra)) {
    // 비허용 origin — 403. preflight 든 본 요청이든 동일하게 차단
    throw createError({
      statusCode: 403,
      statusMessage: 'Origin not allowed',
    })
  }

  return handleCors(event, {
    origin: [requestOrigin],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Client-Platform', 'X-Requested-With'],
    exposeHeaders: ['X-Client-Platform'],
    credentials: false,
    maxAge: '600',
  })
})
