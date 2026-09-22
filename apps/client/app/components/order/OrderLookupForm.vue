<script setup lang="ts">
// 주문번호 조회 폼 (홈 카드 · /my-esim 공용 · spec F-9).
// 유효한 번호는 발급 호스트(runtimeConfig.public.guestAppOrigin)의 /verify/{주문번호} 로 «전체 이동» 한다 — SPA 이동 아님(K3).
import { NButton, NInput } from '@imjohnkoo/design-vue'
import {
  ORDER_LOOKUP_MESSAGES,
  buildGuestVerifyUrl,
  validateOrderNumber,
} from '~/utils/order-lookup'

const props = withDefaults(defineProps<{ inputId: string; submitLabel?: string }>(), {
  submitLabel: '내 eSIM 찾기',
})

const config = useRuntimeConfig()
const value = ref('')
const error = ref<string | null>(null)
const isNavigating = ref(false)

const errorId = computed(() => `${props.inputId}-error`)

const onSubmit = async () => {
  const result = validateOrderNumber(value.value)
  if (!result.ok) {
    error.value = ORDER_LOOKUP_MESSAGES[result.error]
    return
  }
  error.value = null
  isNavigating.value = true
  await navigateTo(buildGuestVerifyUrl(config.public.guestAppOrigin, result.orderId), {
    external: true,
  })
}

watch(value, () => {
  if (error.value) error.value = null
})
</script>

<template>
  <form class="order-lookup" novalidate @submit.prevent="onSubmit">
    <label :for="inputId" class="order-lookup__label">주문번호</label>
    <NInput
      :id="inputId"
      v-model="value"
      variant="box"
      size="lg"
      placeholder="주문번호 숫자를 입력해 주세요"
      inputmode="numeric"
      autocomplete="off"
      :error="!!error"
      :aria-describedby="error ? errorId : undefined"
    />
    <p v-if="error" :id="errorId" class="order-lookup__error" role="alert">{{ error }}</p>
    <div class="order-lookup__cta">
      <NButton type="submit" variant="primary" size="lg" full-width :loading="isNavigating">
        {{ submitLabel }}
      </NButton>
    </div>
  </form>
</template>

<style scoped>
.order-lookup {
  display: flex;
  flex-direction: column;
}

.order-lookup__label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--n-color-neutral-700, #404040);
}

.order-lookup__error {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--n-color-error-500, #ef4444);
}

.order-lookup__cta {
  margin-top: 12px;
}
</style>
