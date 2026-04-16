<template>
  <div
    :class="[
      'n-marquee',
      `n-marquee--${direction}`,
      { 'n-marquee--pause-on-hover': pauseOnHover },
    ]"
    :style="{ '--n-marquee-duration': animationDuration }"
  >
    <div class="n-marquee__track" ref="trackRef">
      <div class="n-marquee__content" ref="contentRef">
        <slot />
      </div>
      <div class="n-marquee__content" aria-hidden="true">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue';

export interface NMarqueeProps {
  speed?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
}

export default defineComponent({
  name: 'NMarquee',

  props: {
    speed: {
      type: Number,
      default: 50,
    },
    direction: {
      type: String,
      default: 'left',
      validator: (value: string) => ['left', 'right'].includes(value),
    },
    pauseOnHover: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const contentRef = ref<HTMLElement | null>(null);
    const trackRef = ref<HTMLElement | null>(null);
    const contentWidth = ref(0);
    let resizeObserver: ResizeObserver | null = null;

    const animationDuration = computed(() => {
      if (contentWidth.value === 0 || props.speed === 0) return '10s';
      return `${contentWidth.value / props.speed}s`;
    });

    const measure = () => {
      if (contentRef.value) {
        contentWidth.value = contentRef.value.offsetWidth;
      }
    };

    onMounted(() => {
      measure();
      if (contentRef.value) {
        resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(contentRef.value);
      }
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
    });

    return { contentRef, trackRef, animationDuration };
  },
});
</script>

<style scoped>
.n-marquee {
  overflow: hidden;
  width: 100%;
  position: relative;
  font-family: var(--font-fontFamily-sans);
}

.n-marquee__track {
  display: inline-flex;
  white-space: nowrap;
  animation: n-marquee-scroll var(--n-marquee-duration, 10s) linear infinite;
}

.n-marquee--right .n-marquee__track {
  animation-name: n-marquee-scroll-right;
}

.n-marquee--pause-on-hover:hover .n-marquee__track {
  animation-play-state: paused;
}

.n-marquee__content {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

@keyframes n-marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes n-marquee-scroll-right {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
