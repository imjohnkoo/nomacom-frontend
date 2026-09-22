<script setup lang="ts">
import LegalDocument from '~/components/legal/LegalDocument.vue'
import { TERMS } from '~/content/legal'

useHead({ title: TERMS.title })
</script>

<template>
  <LegalDocument :doc="TERMS" />
</template>
