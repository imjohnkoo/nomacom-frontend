<template>
  <div :class="['n-user', `n-user--${size}`]">
    <div class="n-user__avatar">
      <img
        v-if="avatar && !avatarError"
        :src="avatar"
        :alt="name ?? ''"
        class="n-user__avatar-image"
        @error="avatarError = true"
      />
      <span v-else class="n-user__avatar-initials">{{ initials }}</span>
    </div>

    <div v-if="name || description" class="n-user__info">
      <span v-if="name" class="n-user__name">{{ name }}</span>
      <span v-if="description" class="n-user__description">{{ description }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue';

export interface NUserProps {
  name?: string
  description?: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg'
}

export default defineComponent({
  name: 'NUser',

  props: {
    name: {
      type: String,
      default: undefined,
    },
    description: {
      type: String,
      default: undefined,
    },
    avatar: {
      type: String,
      default: undefined,
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
  },

  setup(props) {
    const avatarError = ref(false);

    const initials = computed(() => {
      if (!props.name) return '?';
      const parts = props.name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    });

    return { avatarError, initials };
  },
});
</script>

<style>
.n-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

/* ---- Avatar ---- */
.n-user__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-primary-100, #dbeafe);
  color: var(--color-primary-700, #1d4ed8);
  overflow: hidden;
  font-weight: var(--font-fontWeight-semibold, 600);
  font-size: var(--font-fontSize-sm, 0.875rem);
  user-select: none;
}

.n-user__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.n-user__avatar-initials {
  line-height: 1;
}

/* ---- Info ---- */
.n-user__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.n-user__name {
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-900, #111827);
  font-size: var(--font-fontSize-base, 1rem);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.n-user__description {
  font-weight: var(--font-fontWeight-regular, 400);
  color: var(--color-neutral-500, #6b7280);
  font-size: var(--font-fontSize-sm, 0.875rem);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- Size: sm ---- */
.n-user--sm .n-user__avatar {
  width: 28px;
  height: 28px;
  font-size: var(--font-fontSize-xs, 0.75rem);
}

.n-user--sm .n-user__name {
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-user--sm .n-user__description {
  font-size: var(--font-fontSize-xs, 0.75rem);
}

/* ---- Size: md ---- */
.n-user--md .n-user__avatar {
  width: 36px;
  height: 36px;
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-user--md .n-user__name {
  font-size: var(--font-fontSize-base, 1rem);
}

.n-user--md .n-user__description {
  font-size: var(--font-fontSize-sm, 0.875rem);
}

/* ---- Size: lg ---- */
.n-user--lg .n-user__avatar {
  width: 48px;
  height: 48px;
  font-size: var(--font-fontSize-base, 1rem);
}

.n-user--lg .n-user__name {
  font-size: var(--font-fontSize-lg, 1.125rem);
}

.n-user--lg .n-user__description {
  font-size: var(--font-fontSize-sm, 0.875rem);
}
</style>
