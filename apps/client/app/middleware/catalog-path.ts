import { lowercaseRedirect } from '~/utils/catalog-path'

// 카탈로그 URL 소문자 정규화(catalog spec D-13) — `/countries/[iso3]` · `/products/[zone]` 가 definePageMeta 로 건다.
// SSR 에서는 301 응답, 클라이언트 이동에서는 치환 이동.
export default defineNuxtRouteMiddleware((to) => {
  const target = lowercaseRedirect(to.path)
  if (target)
    return navigateTo(
      { path: target, query: to.query, hash: to.hash },
      { redirectCode: 301, replace: true },
    )
})
