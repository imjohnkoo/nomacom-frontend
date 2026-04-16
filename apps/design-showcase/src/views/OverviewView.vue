<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Nomacom Design System</h1>
      <p class="showcase-section__desc">
        Vue 3 + React Native 기반 공유 디자인 시스템. 디자인 토큰, 컴포넌트, Composable을 제공합니다.
      </p>
    </div>

    <div class="showcase-grid">
      <div class="showcase-card">
        <div class="showcase-card__title">패키지</div>
        <div class="showcase-stack">
          <div><span class="showcase-code">@imjohnkoo/design-tokens</span> — 디자인 토큰</div>
          <div><span class="showcase-code">@imjohnkoo/design-vue</span> — Vue 3 컴포넌트</div>
          <div><span class="showcase-code">@imjohnkoo/design-mobile</span> — React Native 컴포넌트</div>
        </div>
      </div>

      <div class="showcase-card">
        <div class="showcase-card__title">신규 컴포넌트</div>
        <div class="showcase-stack">
          <div><span class="showcase-code">NSpinner</span> — 로딩 스피너</div>
          <div><span class="showcase-code">NAlertDialog</span> — 경고 다이얼로그</div>
          <div><span class="showcase-code">NConfirmDialog</span> — 확인 다이얼로그</div>
          <div><span class="showcase-code">NPageHeader</span> — 페이지 헤더</div>
          <div><span class="showcase-code">NCopyButton</span> — 복사 버튼</div>
          <div><span class="showcase-code">NQRCode</span> — QR코드</div>
          <div><span class="showcase-code">NMobileLayout</span> — 모바일 최적화 레이아웃</div>
        </div>
      </div>

      <div class="showcase-card">
        <div class="showcase-card__title">신규 Composable</div>
        <div class="showcase-stack">
          <div><span class="showcase-code">useCopyToClipboard</span> — 클립보드 복사</div>
          <div><span class="showcase-code">usePhoneFormat</span> — 전화번호 포매팅</div>
        </div>
      </div>

      <div class="showcase-card">
        <div class="showcase-card__title">개선된 컴포넌트</div>
        <div class="showcase-stack">
          <div><span class="showcase-code">NSeparator</span> — 라벨 포함 구분선 지원 추가</div>
        </div>
      </div>
    </div>
  </div>
</template>
