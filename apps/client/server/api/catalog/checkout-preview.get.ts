import { PREVIEW_OPTION_CODE, previewItemFrom } from '../../../app/utils/checkout-preview'

// 페이지 전용 데이터 라우트 — `/checkout-preview`(PG 심사 캡처 · 링크 0 · noindex)가 SSR 때 부른다(catalog F-12).
// 카탈로그에 심사용 옵션이 없으면 500 — 가짜 금액으로 대신하지 않는다.
export default defineEventHandler(async () => {
  const catalog = await useCatalog()
  for (const z of catalog.zones)
    for (const p of z.products) {
      const option = p.options.find((o) => o.code === PREVIEW_OPTION_CODE)
      if (option) return previewItemFrom(z.label, p.kind, option)
    }
  throw createError({ statusCode: 500, statusMessage: `카탈로그에 심사용 옵션 ${PREVIEW_OPTION_CODE} 가 없다` })
})
