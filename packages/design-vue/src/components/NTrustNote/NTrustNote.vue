<template>
  <div class="n-trust-note">
    <span class="n-trust-note__icon" aria-hidden="true">
      <slot name="icon">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </slot>
    </span>
    <div class="n-trust-note__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface NTrustNoteProps {
  // intentionally empty — content via slots
  _?: never
}
</script>

<style scoped>
.n-trust-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-2xl, 1rem);
  background-color: var(--color-neutral-50, #fafafa);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-trust-note__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin-top: 2px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-primary-100, #e3dbff);
  color: var(--color-primary-600, #5025e8);
}

.n-trust-note__body {
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-neutral-500, #737373);
}
</style>
