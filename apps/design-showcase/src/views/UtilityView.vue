<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Utility</h1>
      <p class="showcase-section__desc">
        Composable 유틸리티 — 클립보드 복사, 전화번호 포매팅 등입니다.
      </p>
    </div>

    <!-- useCopyToClipboard (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">useCopyToClipboard <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">클립보드 복사 Composable. 복사 후 자동 리셋됩니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">기본 사용</div>
          <div class="showcase-stack">
            <div style="display: flex; align-items: center; gap: 8px;">
              <input
                class="util-input"
                :value="copyText"
                @input="copyText = ($event.target as HTMLInputElement).value"
                placeholder="복사할 텍스트"
              />
              <NButton size="sm" @click="clipboard.copy(copyText)">
                {{ clipboard.copied.value ? '복사됨!' : '복사' }}
              </NButton>
            </div>
            <div style="font-size: 13px; color: var(--color-neutral-500);">
              상태: <span :class="clipboard.copied.value ? 'util-copied' : ''">{{ clipboard.copied.value ? 'copied = true' : 'copied = false' }}</span>
            </div>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">코드 복사 예시</div>
          <div class="showcase-stack">
            <div v-for="(item, index) in codeItems" :key="index" class="util-code-row">
              <div class="util-code-row__label">
                <span style="font-size: 12px; font-weight: 600; color: var(--color-neutral-500);">{{ item.label }}</span>
                <span style="font-size: 12px; color: var(--color-neutral-400); word-break: break-all;">{{ item.value }}</span>
              </div>
              <NCopyButton :value="item.value" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- usePhoneFormat (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">usePhoneFormat <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">한국 전화번호 자동 포매팅. 010-XXXX-XXXX 형식으로 변환됩니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">실시간 포매팅</div>
          <div class="showcase-stack">
            <input
              class="util-input"
              type="tel"
              placeholder="010-0000-0000"
              :value="phone.formatted.value"
              @input="phone.handleInput"
            />
            <div style="display: flex; gap: 16px; font-size: 13px;">
              <span style="color: var(--color-neutral-500);">
                원본: <span class="showcase-code">{{ phone.raw.value || '—' }}</span>
              </span>
              <span :style="{ color: phone.isValid.value ? 'var(--color-success-500)' : 'var(--color-error-500)' }">
                {{ phone.isValid.value ? 'Valid' : 'Invalid' }}
              </span>
            </div>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">프로그래밍 제어</div>
          <div class="showcase-stack">
            <div class="showcase-row">
              <NButton size="sm" variant="outline" @click="phone.set('01012345678')">01012345678 설정</NButton>
              <NButton size="sm" variant="outline" @click="phone.set('01098765432')">01098765432 설정</NButton>
              <NButton size="sm" variant="ghost" @click="phone.clear()">초기화</NButton>
            </div>
            <div style="font-size: 13px; color: var(--color-neutral-500);">
              현재: <span class="showcase-code">{{ phone.formatted.value || '(비어있음)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton,
  NCopyButton,
  useCopyToClipboard,
  usePhoneFormat,
} from '@imjohnkoo/design-vue'

const copyText = ref('LPA:1$smdp.example.com$ACTIVATION-CODE-12345')
const clipboard = useCopyToClipboard()
const phone = usePhoneFormat()

const codeItems = [
  { label: 'SM-DP+ 주소', value: 'smdp.example.com' },
  { label: '활성화 코드', value: 'K2-ABC123-DEF456-GH789' },
  { label: '전체 코드', value: 'LPA:1$smdp.example.com$K2-ABC123-DEF456-GH789' },
]
</script>

<style scoped>
.util-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--color-neutral-300, #d4d4d4);
  border-radius: 6px;
  font-family: var(--font-fontFamily-sans, sans-serif);
  outline: none;
  transition: border-color 0.15s ease;
}
.util-input:focus {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-100, #dbeafe);
}

.util-copied {
  color: var(--color-success-500, #22c55e);
  font-weight: 600;
}

.util-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-neutral-100, #f5f5f5);
}
.util-code-row:last-child {
  border-bottom: none;
}

.util-code-row__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
</style>
