<template>
  <div class="n-carousel" @mouseenter="pause" @mouseleave="resume">
    <div class="n-carousel__viewport">
      <div
        class="n-carousel__track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(_, index) in slideCount"
          :key="index"
          class="n-carousel__slide"
        >
          <slot :name="`slide-${index}`" />
        </div>
      </div>
    </div>

    <!-- Arrow controls -->
    <template v-if="showArrows && slideCount > 1">
      <button
        class="n-carousel__arrow n-carousel__arrow--prev"
        type="button"
        aria-label="Previous slide"
        @click="prev"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        class="n-carousel__arrow n-carousel__arrow--next"
        type="button"
        aria-label="Next slide"
        @click="next"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </template>

    <!-- Dot indicators -->
    <div v-if="showDots && slideCount > 1" class="n-carousel__dots">
      <button
        v-for="index in slideCount"
        :key="index - 1"
        :class="[
          'n-carousel__dot',
          { 'n-carousel__dot--active': currentIndex === index - 1 },
        ]"
        type="button"
        :aria-label="`Go to slide ${index}`"
        @click="goTo(index - 1)"
      />
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
  useSlots,
  watch,
} from 'vue';

export interface NCarouselProps {
  autoplay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
}

export default defineComponent({
  name: 'NCarousel',

  props: {
    autoplay: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      default: 5000,
    },
    showDots: {
      type: Boolean,
      default: true,
    },
    showArrows: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const slots = useSlots();
    const currentIndex = ref(0);
    let timer: ReturnType<typeof setInterval> | null = null;
    let isPaused = false;

    const slideCount = computed(() => {
      if (!slots.default) return 0;
      const children = slots.default();
      return children.length;
    });

    const goTo = (index: number) => {
      const total = slideCount.value;
      if (total === 0) return;
      currentIndex.value = ((index % total) + total) % total;
    };

    const next = () => goTo(currentIndex.value + 1);
    const prev = () => goTo(currentIndex.value - 1);

    const startAutoplay = () => {
      stopAutoplay();
      if (props.autoplay && slideCount.value > 1) {
        timer = setInterval(() => {
          if (!isPaused) next();
        }, props.interval);
      }
    };

    const stopAutoplay = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const pause = () => {
      isPaused = true;
    };

    const resume = () => {
      isPaused = false;
    };

    onMounted(() => {
      startAutoplay();
    });

    watch(
      () => [props.autoplay, props.interval],
      () => startAutoplay()
    );

    onBeforeUnmount(() => {
      stopAutoplay();
    });

    return {
      currentIndex,
      slideCount,
      goTo,
      next,
      prev,
      pause,
      resume,
    };
  },
});
</script>

<style scoped>
.n-carousel {
  position: relative;
  width: 100%;
  font-family: var(--font-fontFamily-sans);
}

.n-carousel__viewport {
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.n-carousel__track {
  display: flex;
  transition: transform var(--transition-normal);
  will-change: transform;
}

.n-carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
}

/* ---- Arrows ---- */
.n-carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: var(--borderWidth-1) solid var(--color-neutral-200);
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-0);
  color: var(--color-neutral-700);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
  z-index: 2;
}

.n-carousel__arrow:hover {
  background-color: var(--color-neutral-50);
  box-shadow: var(--shadow-md);
}

.n-carousel__arrow:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-carousel__arrow--prev {
  left: var(--spacing-3);
}

.n-carousel__arrow--next {
  right: var(--spacing-3);
}

/* ---- Dots ---- */
.n-carousel__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

.n-carousel__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: var(--borderWidth-0) solid transparent;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-200);
  cursor: pointer;
  transition: background-color var(--transition-fast),
    transform var(--transition-fast);
}

.n-carousel__dot:hover {
  background-color: var(--color-neutral-400);
}

.n-carousel__dot--active {
  background-color: var(--color-primary-500);
  transform: scale(1.25);
}

.n-carousel__dot:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
</style>
