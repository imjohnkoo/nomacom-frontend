<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Feedback</h1>
      <p class="showcase-section__desc">
        스피너, 프로그레스 바, 스켈레톤 등 사용자 피드백 컴포넌트입니다.
      </p>
    </div>

    <!-- NSpinner -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NSpinner</h2>
      <p class="showcase-section__desc">로딩 상태를 표시하는 스피너입니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">크기 비교</div>
          <div class="showcase-row" style="align-items: flex-end;">
            <div style="text-align: center;">
              <NSpinner size="sm" />
              <div style="font-size: 12px; color: var(--color-neutral-400); margin-top: 4px;">sm</div>
            </div>
            <div style="text-align: center;">
              <NSpinner size="md" />
              <div style="font-size: 12px; color: var(--color-neutral-400); margin-top: 4px;">md</div>
            </div>
            <div style="text-align: center;">
              <NSpinner size="lg" />
              <div style="font-size: 12px; color: var(--color-neutral-400); margin-top: 4px;">lg</div>
            </div>
            <div style="text-align: center;">
              <NSpinner size="xl" />
              <div style="font-size: 12px; color: var(--color-neutral-400); margin-top: 4px;">xl</div>
            </div>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">인라인 로딩</div>
          <div class="showcase-row">
            <NSpinner size="sm" color="primary" />
            <span style="font-size: 14px; color: var(--color-neutral-600);">데이터를 불러오고 있습니다...</span>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">풀 로딩 패턴</div>
          <div style="display: flex; flex-direction: column; align-items: center; padding: 32px 0; gap: 16px; border: 1px dashed var(--color-neutral-200); border-radius: 8px;">
            <NSpinner size="lg" color="primary" />
            <span style="font-size: 14px; color: var(--color-neutral-500);">주문 정보를 불러오고 있습니다...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NProgress -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NProgress</h2>
      <p class="showcase-section__desc">진행률 바입니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">색상</div>
          <div class="showcase-stack">
            <NProgress :model-value="75" color="primary" />
            <NProgress :model-value="60" color="success" />
            <NProgress :model-value="45" color="warning" />
            <NProgress :model-value="30" color="error" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">크기</div>
          <div class="showcase-stack">
            <NProgress :model-value="50" size="sm" />
            <NProgress :model-value="50" size="md" />
            <NProgress :model-value="50" size="lg" />
          </div>
        </div>
      </div>
    </div>

    <!-- NSkeleton -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NSkeleton</h2>
      <p class="showcase-section__desc">콘텐츠 로딩 플레이스홀더입니다.</p>
      <div class="showcase-card">
        <div class="showcase-stack">
          <NSkeleton width="100%" height="20px" />
          <NSkeleton width="80%" height="20px" />
          <NSkeleton width="60%" height="20px" />
          <div class="showcase-row">
            <NSkeleton width="40px" height="40px" rounded />
            <div class="showcase-stack" style="flex: 1; gap: 8px;">
              <NSkeleton width="120px" height="14px" />
              <NSkeleton width="200px" height="14px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NSpinner,
  NProgress,
  NSkeleton,
} from '@imjohnkoo/design-vue'
</script>
