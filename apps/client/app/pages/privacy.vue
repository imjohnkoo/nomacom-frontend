<script setup lang="ts">
import { STATIC_DESCRIPTIONS } from '#shared/catalog/seo'
import LegalDocument from '~/components/legal/LegalDocument.vue'
import { PRIVACY } from '~/content/legal'

// canonical · 설명 — sitemap 에 든 정적 페이지(catalog F-9 · QA ⑥ R11)
useCatalogSeo({ title: PRIVACY.title, description: STATIC_DESCRIPTIONS['/privacy'] })
</script>

<template>
  <LegalDocument :doc="PRIVACY" />
</template>
