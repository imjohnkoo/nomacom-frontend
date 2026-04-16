<template>
  <div
    :class="[
      'n-mobile-layout',
      { 'n-mobile-layout--safe-area': safeArea },
    ]"
    :style="outerStyles"
  >
    <div
      :class="[
        'n-mobile-layout__frame',
        { 'n-mobile-layout__frame--shadow': frameShadow },
      ]"
      :style="frameStyles"
    >
      <!-- Status bar slot (optional) -->
      <div v-if="$slots['status-bar']" class="n-mobile-layout__status-bar">
        <slot name="status-bar" />
      </div>

      <!-- Main scrollable content -->
      <div class="n-mobile-layout__content">
        <slot />
      </div>

      <!-- Bottom safe area / home indicator -->
      <div v-if="safeArea" class="n-mobile-layout__safe-bottom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type MobileDevicePreset = 'se' | 'standard' | 'pro' | 'plus' | 'pro-max'

export interface NMobileLayoutProps {
  /**
   * Max width of the mobile frame (desktop only).
   * On actual mobile devices, the frame always stretches to 100%.
   * Default '440px' — matches iPhone Pro Max viewport.
   */
  maxWidth?: string
  /**
   * Device width preset. Overrides maxWidth if set.
   *   se       → 375px  (iPhone SE)
   *   standard → 393px  (iPhone 16)
   *   pro      → 402px  (iPhone 16 Pro)
   *   plus     → 430px  (iPhone 16 Plus / 15 Pro Max)
   *   pro-max  → 440px  (iPhone 16 Pro Max)
   */
  device?: MobileDevicePreset
  /** Background color of the outer area (desktop). Default neutral-100 */
  outerBackground?: string
  /** Background color of the inner frame. Default white */
  innerBackground?: string
  /** Show shadow around the frame on desktop. Default true */
  frameShadow?: boolean
  /** Enable safe-area insets (notch/home indicator padding). Default false */
  safeArea?: boolean
  /** Minimum height. Default '100dvh' */
  minHeight?: string
}

const props = withDefaults(defineProps<NMobileLayoutProps>(), {
  maxWidth: '440px',
  device: undefined,
  outerBackground: undefined,
  innerBackground: undefined,
  frameShadow: true,
  safeArea: false,
  minHeight: '100dvh',
})

const deviceWidths: Record<MobileDevicePreset, string> = {
  'se': '375px',
  'standard': '393px',
  'pro': '402px',
  'plus': '430px',
  'pro-max': '440px',
}

const resolvedMaxWidth = computed(() => {
  if (props.device) return deviceWidths[props.device]
  return props.maxWidth
})

const outerStyles = computed(() => {
  const styles: Record<string, string> = {
    minHeight: props.minHeight,
  }
  if (props.outerBackground) {
    styles.backgroundColor = props.outerBackground
  }
  return styles
})

const frameStyles = computed(() => {
  const styles: Record<string, string> = {
    maxWidth: resolvedMaxWidth.value,
  }
  if (props.innerBackground) {
    styles.backgroundColor = props.innerBackground
  }
  return styles
})
</script>

<style>
.n-mobile-layout {
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: var(--color-neutral-100, #f5f5f5);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-mobile-layout__frame {
  width: 100%;
  min-height: inherit;
  background-color: var(--color-neutral-0, #ffffff);
  display: flex;
  flex-direction: column;
  position: relative;
}

/*
 * Mobile breakpoint: 560px
 *
 * All current and foreseeable phone viewports (max ~450px CSS pixels)
 * fall below this. On these devices the frame always stretches to 100%
 * so the maxWidth prop is effectively desktop-only.
 *
 * iPhone viewport reference (CSS pixels):
 *   SE          375px
 *   16          393px
 *   16 Pro      402px
 *   16 Plus     430px
 *   16 Pro Max  440px
 *
 * 560px gives ~120px headroom above the largest phone.
 */
@media (max-width: 559px) {
  .n-mobile-layout {
    background-color: transparent;
  }

  .n-mobile-layout__frame {
    max-width: 100% !important;
    box-shadow: none !important;
  }
}

/* Shadow only on desktop */
@media (min-width: 560px) {
  .n-mobile-layout__frame--shadow {
    box-shadow:
      0 0 0 1px var(--color-neutral-200, #e5e5e5),
      var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  }
}

.n-mobile-layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Safe area support for notched devices */
.n-mobile-layout--safe-area .n-mobile-layout__content {
  padding-top: env(safe-area-inset-top, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

.n-mobile-layout__safe-bottom {
  flex-shrink: 0;
  height: env(safe-area-inset-bottom, 0px);
  min-height: env(safe-area-inset-bottom, 0px);
}

.n-mobile-layout__status-bar {
  flex-shrink: 0;
  width: 100%;
  z-index: 10;
}

/* Thin scrollbar inside the frame */
.n-mobile-layout__content::-webkit-scrollbar {
  width: 4px;
}

.n-mobile-layout__content::-webkit-scrollbar-track {
  background: transparent;
}

.n-mobile-layout__content::-webkit-scrollbar-thumb {
  background: var(--color-neutral-300, #d4d4d4);
  border-radius: 4px;
}

.n-mobile-layout__content::-webkit-scrollbar-thumb:hover {
  background: var(--color-neutral-400, #a3a3a3);
}
</style>
