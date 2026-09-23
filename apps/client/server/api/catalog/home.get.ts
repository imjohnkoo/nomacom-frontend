import { POPULAR_COUNTRIES, POPULAR_MULTI_ZONES } from '../../../app/content/popular'
import { resolveHome } from '../../../shared/catalog/home'

// 페이지 전용 데이터 라우트 — 외부 계약이 아니다(`/api/v1` 밖 · mobile · backend 가 쓰지 않는다).
// 홈(`/`)이 프리렌더 때 부르고 결과는 payload 에 고정된다. 응답 모양은 홈과 함께 바뀌어도 된다.
export default defineEventHandler(async () => {
  const catalog = await useCatalog()
  const home = resolveHome(catalog, POPULAR_COUNTRIES, POPULAR_MULTI_ZONES)
  // 실 카탈로그에서 목록이 어긋나면 프리렌더를 실패시켜 빌드를 멈춘다(표본 픽스처는 없는 것을 건너뛴다)
  if (home.missing.length > 0 && !catalog.fixture) {
    throw createError({
      statusCode: 500,
      statusMessage: `홈 인기 목록이 카탈로그와 어긋난다 — app/content/popular.ts: ${home.missing.join(', ')}`,
    })
  }
  return { popular: home.popular, multi: home.multi }
})
