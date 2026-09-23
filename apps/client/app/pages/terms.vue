<script setup lang="ts">
import { STATIC_DESCRIPTIONS } from '#shared/catalog/seo'
import LegalDocument from '~/components/legal/LegalDocument.vue'
import { TERMS } from '~/content/legal'

// canonical · 설명 — sitemap 에 든 정적 페이지(catalog F-9 · QA ⑥ R11)
useCatalogSeo({ title: TERMS.title, description: STATIC_DESCRIPTIONS['/terms'] })
</script>

<template>
  <LegalDocument :doc="TERMS" />
</template>
