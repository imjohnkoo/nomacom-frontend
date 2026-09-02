<template>
  <a
    :class="[
      'n-link',
      `n-link--${color}`,
      {
        'n-link--underline': underline,
        'n-link--disabled': disabled,
      },
    ]"
    :href="disabled ? undefined : href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :tabindex="disabled ? -1 : undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
  >
    <slot />
    <span v-if="external" class="n-link__external-icon" aria-hidden="true">
      &#8599;
    </span>
  </a>
</template>

<script setup lang="ts">
export interface NLinkProps {
  href?: string
  external?: boolean
  underline?: boolean
  color?: 'primary' | 'neutral'
  disabled?: boolean
}

const props = withDefaults(defineProps<NLinkProps>(), {
  href: undefined,
  external: false,
  underline: true,
  color: 'primary',
  disabled: false,
})

function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
  }
}
</script>

<style scoped>
.n-link {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-weight: var(--n-font-weight-medium, 500);
  line-height: var(--n-font-line-height-normal, 1.5);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--n-transition-fast, 150ms ease),
    text-decoration-color var(--n-transition-fast, 150ms ease);
}

/* --- Underline --- */
.n-link--underline {
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}

/* --- Primary color --- */
.n-link--primary {
  color: var(--n-color-primary-600, #5025e8);
  text-decoration-color: var(--n-color-primary-300, #a78bff);
}

.n-link--primary:hover:not(.n-link--disabled) {
  color: var(--n-color-primary-700, #3f1cc0);
  text-decoration-color: var(--n-color-primary-600, #5025e8);
}

.n-link--primary:active:not(.n-link--disabled) {
  color: var(--n-color-primary-800, #2f1499);
}

/* --- Neutral color --- */
.n-link--neutral {
  color: var(--n-color-neutral-700, #404040);
  text-decoration-color: var(--n-color-neutral-300, #d4d4d4);
}

.n-link--neutral:hover:not(.n-link--disabled) {
  color: var(--n-color-neutral-900, #171717);
  text-decoration-color: var(--n-color-neutral-700, #404040);
}

.n-link--neutral:active:not(.n-link--disabled) {
  color: var(--n-color-neutral-900, #171717);
}

/* --- Focus --- */
.n-link:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
  outline-offset: 2px;
  border-radius: var(--n-radius-sm, 0.25rem);
}

/* --- Disabled --- */
.n-link--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: auto;
}

/* --- External icon --- */
.n-link__external-icon {
  display: inline-flex;
  font-size: 0.85em;
  line-height: 1;
}
</style>
