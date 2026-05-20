<template>
  <component
    :is="href ? 'a' : 'button'"
    :class="['n-link-card', { 'n-link-card--button': !href }]"
    :href="href || undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    @click="$emit('click', $event)"
  >
    <span v-if="$slots.icon" class="n-link-card__icon">
      <slot name="icon" />
    </span>
    <span class="n-link-card__text">
      <span class="n-link-card__label">{{ label }}</span>
      <span v-if="sub" class="n-link-card__sub">{{ sub }}</span>
    </span>
    <span class="n-link-card__chev" aria-hidden="true">
      <slot name="chev">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </slot>
    </span>
  </component>
</template>

<script setup lang="ts">
export interface NLinkCardProps {
  label: string
  sub?: string
  href?: string
  external?: boolean
}

withDefaults(defineProps<NLinkCardProps>(), {
  sub: undefined,
  href: undefined,
  external: false,
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<style scoped>
.n-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #f1f1f4;
  border-radius: var(--radius-xl, 0.75rem);
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-900, #171717);
  font-family: var(--font-fontFamily-sans, sans-serif);
  text-decoration: none;
  transition: border-color 160ms ease;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.n-link-card:hover {
  border-color: var(--color-primary-300, #a78bff);
}

.n-link-card--button {
  appearance: none;
}

.n-link-card__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg, 0.5rem);
  background-color: var(--color-neutral-50, #fafafa);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.n-link-card__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.n-link-card__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-900, #171717);
}

.n-link-card__sub {
  font-size: 11px;
  color: var(--color-neutral-400, #a3a3a3);
}

.n-link-card__chev {
  margin-left: auto;
  color: var(--color-neutral-400, #a3a3a3);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}
</style>
