/**
 * Auth middleware — placeholder.
 *
 * 본 PR (E-2) 단계에선 토큰을 *추출만* 하고 검증은 하지 않음.
 * `event.context.auth` 에 `{ user: null, platform }` 을 채워두고, 실 검증은 다음 phase
 * (휴대폰 OTP / OAuth) 에서 token verifier 를 plug-in.
 *
 * 듀얼 채널:
 *  - Web   : HttpOnly cookie `nomacom_session`
 *  - Mobile: `Authorization: Bearer <token>` (X-Client-Platform: mobile)
 *
 * 미들웨어는 모든 경로에 자동 적용되지만, /api/** 외 경로는 platform 만 추정하고 종료.
 */

import type { ClientPlatform } from '../utils/types'

const BEARER_PREFIX = 'Bearer '

function detectPlatform(event: import('h3').H3Event): ClientPlatform {
  const explicit = getRequestHeader(event, 'x-client-platform')?.toLowerCase()
  if (explicit === 'web' || explicit === 'mobile') return explicit
  const ua = getRequestHeader(event, 'user-agent') ?? ''
  if (/Expo|okhttp|CFNetwork/i.test(ua)) return 'mobile'
  if (/Mozilla|Chrome|Safari|Firefox|Edge/i.test(ua)) return 'web'
  return 'unknown'
}

function extractToken(event: import('h3').H3Event): string | null {
  const authHeader = getRequestHeader(event, 'authorization')
  if (authHeader?.startsWith(BEARER_PREFIX)) {
    return authHeader.slice(BEARER_PREFIX.length).trim() || null
  }
  const cookie = getCookie(event, 'nomacom_session')
  return cookie || null
}

export default defineEventHandler((event) => {
  const platform = detectPlatform(event)

  // 본 PR 은 토큰 추출만 — 실 검증 (JWT verify / session lookup) 은 다음 phase
  const token = extractToken(event)

  event.context.auth = {
    user: token ? null : null, // placeholder — 추후 verifier(token) 결과로 채움
    platform,
  }
})
