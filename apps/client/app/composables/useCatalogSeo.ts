import { SITE_ORIGIN, canonicalUrl, type PageMeta } from '#shared/catalog/seo'

/**
 * 카탈로그 페이지 메타(catalog spec F-9 · S-6 · D-15) — 제목(템플릿 « · 이심마니») · 설명 · canonical · og.
 * canonical · og:url 은 빌드 상수 https://esimmany.com + 경로(호스트 판정 0). og:image 는 자사 자산 절대 URL.
 */
export function useCatalogSeo(meta: PageMeta, image?: string) {
  const route = useRoute()
  const url = canonicalUrl(route.path)
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: `${meta.title} · 이심마니`,
    ogDescription: meta.description,
    ogUrl: url,
    ogType: 'website',
    ogSiteName: '이심마니',
    ogImage: image ? `${SITE_ORIGIN}${image}` : undefined,
    twitterCard: 'summary',
  })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}
