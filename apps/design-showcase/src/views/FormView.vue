<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Form</h1>
      <p class="showcase-section__desc">
        입력 필드, 전화번호 포매팅 등 폼 관련 컴포넌트와 Composable입니다.
      </p>
    </div>

    <!-- NInput -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NInput</h2>
      <p class="showcase-section__desc">텍스트 입력 필드입니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">기본</div>
          <div class="showcase-stack">
            <NInput v-model="textValue" placeholder="텍스트를 입력하세요" />
            <NInput v-model="textValue" placeholder="비활성" :disabled="true" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">크기</div>
          <div class="showcase-stack">
            <NInput placeholder="Small" size="sm" />
            <NInput placeholder="Medium" size="md" />
            <NInput placeholder="Large" size="lg" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">에러 상태</div>
          <NInput placeholder="에러 상태" :error="true" />
        </div>
      </div>
    </div>

    <!-- usePhoneFormat (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">usePhoneFormat <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">한국 전화번호 포매팅 Composable. 자동으로 하이픈을 삽입합니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">전화번호 입력</div>
          <div class="showcase-stack">
            <input
              class="phone-demo-input"
              type="tel"
              placeholder="전화번호를 입력하세요"
              :value="phone.formatted.value"
              @input="phone.handleInput"
            />
            <div style="font-size: 13px; color: var(--color-neutral-500);">
              포매팅: <span class="showcase-code">{{ phone.formatted.value || '—' }}</span>
            </div>
            <div style="font-size: 13px; color: var(--color-neutral-500);">
              원본: <span class="showcase-code">{{ phone.raw.value || '—' }}</span>
            </div>
            <div :style="{ fontSize: '13px', color: phone.isValid.value ? 'var(--color-success-500)' : 'var(--color-error-500)' }">
              {{ phone.isValid.value ? '유효한 전화번호' : '유효하지 않은 전화번호' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NInput, usePhoneFormat } from '@imjohnkoo/design-vue'

const textValue = ref('')
const phone = usePhoneFormat()
</script>

<style scoped>
.phone-demo-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid var(--color-neutral-300, #d4d4d4);
  border-radius: 8px;
  font-family: var(--font-fontFamily-sans, sans-serif);
  outline: none;
  transition: border-color 0.15s ease;
}
.phone-demo-input:focus {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-100, #dbeafe);
}
</style>
