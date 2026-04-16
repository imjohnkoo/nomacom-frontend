<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Elements</h1>
      <p class="showcase-section__desc">
        버튼, 뱃지, 알림, 스피너, QR코드, 복사 버튼 등 핵심 UI 요소입니다.
      </p>
    </div>

    <!-- NButton -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NButton</h2>
      <p class="showcase-section__desc">5가지 변형, 3가지 크기, 로딩/비활성 상태를 지원합니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">변형(Variant)</div>
          <div class="showcase-row">
            <NButton variant="primary">기본</NButton>
            <NButton variant="secondary">보조</NButton>
            <NButton variant="outline">아웃라인</NButton>
            <NButton variant="ghost">고스트</NButton>
            <NButton variant="danger">위험</NButton>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">크기</div>
          <div class="showcase-row">
            <NButton size="sm">Small</NButton>
            <NButton size="md">Medium</NButton>
            <NButton size="lg">Large</NButton>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">상태</div>
          <div class="showcase-row">
            <NButton :loading="true">로딩 중</NButton>
            <NButton :disabled="true">비활성</NButton>
            <NButton :full-width="true">전체 너비</NButton>
          </div>
        </div>
      </div>
    </div>

    <!-- NBadge -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NBadge</h2>
      <p class="showcase-section__desc">상태 표시를 위한 뱃지입니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">색상</div>
          <div class="showcase-row">
            <NBadge color="neutral" label="기본" />
            <NBadge color="primary" label="주요" />
            <NBadge color="success" label="성공" />
            <NBadge color="warning" label="경고" />
            <NBadge color="error" label="오류" />
            <NBadge color="info" label="정보" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">변형</div>
          <div class="showcase-row">
            <NBadge color="primary" variant="solid" label="Solid" />
            <NBadge color="primary" variant="subtle" label="Subtle" />
            <NBadge color="primary" variant="outline" label="Outline" />
          </div>
        </div>
      </div>
    </div>

    <!-- NAlert -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NAlert</h2>
      <p class="showcase-section__desc">4가지 색상, 제목/설명, 닫기 옵션을 지원합니다.</p>
      <div class="showcase-stack">
        <NAlert color="info" title="안내" description="유용한 정보를 전달하는 알림입니다." />
        <NAlert color="success" title="성공" description="작업이 성공적으로 완료되었습니다." :closable="true" />
        <NAlert color="warning" title="경고" description="주의가 필요한 사항입니다." :closable="true" />
        <NAlert color="error" title="오류" description="문제가 발생했습니다. 다시 시도해주세요." :closable="true" />
      </div>
    </div>

    <!-- NSpinner (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NSpinner <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">SVG 기반 로딩 스피너. 4가지 크기와 6가지 색상을 지원합니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">크기</div>
          <div class="showcase-row">
            <NSpinner size="sm" />
            <NSpinner size="md" />
            <NSpinner size="lg" />
            <NSpinner size="xl" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">색상</div>
          <div class="showcase-row">
            <NSpinner color="primary" />
            <NSpinner color="neutral" />
            <NSpinner color="success" />
            <NSpinner color="warning" />
            <NSpinner color="error" />
            <NSpinner color="info" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">라벨</div>
          <div class="showcase-stack">
            <NSpinner label="불러오는 중..." />
            <NSpinner size="lg" color="success" label="처리 중입니다..." />
          </div>
        </div>
      </div>
    </div>

    <!-- NCopyButton (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NCopyButton <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">클립보드 복사 버튼. 복사 성공 시 상태가 변경됩니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">변형</div>
          <div class="showcase-row">
            <NCopyButton value="복사된 텍스트 1" variant="primary" />
            <NCopyButton value="복사된 텍스트 2" variant="outline" />
            <NCopyButton value="복사된 텍스트 3" variant="ghost" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">크기 & 커스텀 라벨</div>
          <div class="showcase-row">
            <NCopyButton value="LPA:1$example.com$ABC123" label="SM-DP+ 복사" size="sm" />
            <NCopyButton value="activation-code-example" label="활성화 코드 복사" size="md" />
          </div>
        </div>
      </div>
    </div>

    <!-- NQRCode (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NQRCode <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">QR코드 표시 컴포넌트. 3가지 크기를 지원합니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">크기</div>
          <div class="showcase-row" style="align-items: flex-start;">
            <NQRCode value="https://nomacom.example.com/small" size="sm" />
            <NQRCode value="https://nomacom.example.com/medium" size="md" />
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">대형</div>
          <NQRCode value="LPA:1$smdp.example.com$ACTIVATION_CODE_12345" size="lg" />
        </div>
      </div>
    </div>

    <!-- NSeparator (IMPROVED) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NSeparator <span class="showcase-code">IMPROVED</span></h2>
      <p class="showcase-section__desc">구분선. 라벨 포함 기능이 추가되었습니다.</p>
      <div class="showcase-card">
        <div class="showcase-stack" style="gap: 24px;">
          <div>
            <div class="showcase-card__title">기본</div>
            <NSeparator />
          </div>
          <div>
            <div class="showcase-card__title">라벨 포함</div>
            <NSeparator label="또는" />
          </div>
          <div>
            <div class="showcase-card__title">슬롯 콘텐츠</div>
            <NSeparator>아이폰 설치 코드</NSeparator>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NButton,
  NBadge,
  NAlert,
  NSpinner,
  NCopyButton,
  NQRCode,
  NSeparator,
} from '@imjohnkoo/design-vue'
</script>
