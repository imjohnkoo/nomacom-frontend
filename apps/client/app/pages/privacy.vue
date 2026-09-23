<script setup lang="ts">
import LegalDocument from '~/components/legal/LegalDocument.vue'
import { PRIVACY } from '~/content/legal'

useHead({ title: PRIVACY.title })
</script>

<template>
  <LegalDocument :doc="PRIVACY" />
</template>
