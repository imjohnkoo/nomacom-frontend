<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Layout</h1>
      <p class="showcase-section__desc">
        모바일 레이아웃, 페이지 헤더, 구분선 등 레이아웃 컴포넌트입니다.
      </p>
    </div>

    <!-- NMobileLayout (NEW) -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NMobileLayout <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">
        모바일 최적화 레이아웃. 모바일에서는 전체 화면, 데스크탑에서는 가운데 모바일 프레임으로 표시됩니다.
        nomacom-client-nuxt3의 app.vue 패턴을 컴포넌트화한 것입니다.
      </p>

      <div class="showcase-stack" style="gap: 32px;">
        <!-- Default -->
        <div>
          <div class="showcase-card__title" style="margin-bottom: 12px;">기본 (440px — iPhone Pro Max)</div>
          <div class="mobile-demo-wrapper">
            <NMobileLayout max-width="440px" min-height="500px">
              <NPageHeader
                step="1/4"
                title="주문을 확인합니다."
                meta="12345"
                meta-label="주문번호"
                height="12rem"
              />
              <div style="padding: 16px;">
                <div style="background: var(--color-neutral-50); border-radius: 12px; padding: 16px;">
                  <p style="font-size: 14px; color: var(--color-neutral-600); line-height: 1.6;">
                    모바일에서는 전체 너비, 데스크탑에서는 400px 프레임으로 표시됩니다.
                    양 옆에 회색 배경이 보이는 것이 데스크탑 뷰입니다.
                  </p>
                </div>
              </div>
            </NMobileLayout>
          </div>
        </div>

        <!-- Device presets -->
        <div>
          <div class="showcase-card__title" style="margin-bottom: 12px;">디바이스 프리셋</div>
          <div class="showcase-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
            <div v-for="preset in devicePresets" :key="preset" class="mobile-demo-small">
              <div style="font-size: 12px; font-weight: 600; color: var(--color-neutral-500); margin-bottom: 8px; text-align: center;">
                {{ preset }} ({{ presetWidths[preset] }})
              </div>
              <NMobileLayout :device="preset" min-height="300px">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 16px; gap: 8px;">
                  <NSpinner size="sm" color="primary" />
                  <span style="font-size: 13px; color: var(--color-neutral-500);">{{ preset }}</span>
                </div>
              </NMobileLayout>
            </div>
          </div>
        </div>

        <!-- With PageHeader + Content -->
        <div>
          <div class="showcase-card__title" style="margin-bottom: 12px;">실제 사용 예시 (eSIMMany 스타일)</div>
          <div class="mobile-demo-wrapper">
            <NMobileLayout device="pro-max" min-height="600px" :safe-area="false">
              <NPageHeader
                step="3/4"
                title="사용 시작 일시를 선택하세요."
                meta="12345"
                meta-label="주문번호"
                height="14rem"
              />
              <div style="padding: 12px;">
                <div style="background: white; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; gap: 16px;">
                  <div>
                    <label style="font-size: 14px; font-weight: 500; color: var(--color-neutral-800);">국가 선택</label>
                    <div style="margin-top: 4px; padding: 8px 12px; border: 1px solid var(--color-neutral-200); border-radius: 8px; font-size: 14px; color: var(--color-neutral-400);">
                      국가를 선택하세요
                    </div>
                  </div>
                  <div>
                    <label style="font-size: 14px; font-weight: 500; color: var(--color-neutral-800);">시작 날짜</label>
                    <div style="margin-top: 4px; padding: 8px 12px; border: 1px solid var(--color-neutral-200); border-radius: 8px; font-size: 14px; color: var(--color-neutral-400);">
                      날짜를 선택하세요
                    </div>
                  </div>
                  <NButton :full-width="true" size="lg">QR코드 발행하기</NButton>
                </div>
              </div>
            </NMobileLayout>
          </div>
        </div>

        <!-- Props table -->
        <div class="showcase-wide-card">
          <div class="showcase-card__title">Props</div>
          <table class="props-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="showcase-code">maxWidth</span></td>
                <td>string</td>
                <td>'440px'</td>
                <td>모바일 프레임 최대 너비 (데스크탑 전용, 모바일은 항상 100%)</td>
              </tr>
              <tr>
                <td><span class="showcase-code">device</span></td>
                <td>'se' | 'standard' | 'pro' | 'plus' | 'pro-max'</td>
                <td>—</td>
                <td>디바이스 프리셋 (375/393/402/430/440px)</td>
              </tr>
              <tr>
                <td><span class="showcase-code">outerBackground</span></td>
                <td>string</td>
                <td>neutral-100</td>
                <td>외부 영역 배경색 (데스크탑)</td>
              </tr>
              <tr>
                <td><span class="showcase-code">innerBackground</span></td>
                <td>string</td>
                <td>white</td>
                <td>프레임 내부 배경색</td>
              </tr>
              <tr>
                <td><span class="showcase-code">frameShadow</span></td>
                <td>boolean</td>
                <td>true</td>
                <td>데스크탑에서 프레임 그림자</td>
              </tr>
              <tr>
                <td><span class="showcase-code">safeArea</span></td>
                <td>boolean</td>
                <td>false</td>
                <td>safe-area-inset 패딩 (노치/홈 인디케이터)</td>
              </tr>
              <tr>
                <td><span class="showcase-code">minHeight</span></td>
                <td>string</td>
                <td>'100dvh'</td>
                <td>최소 높이</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Usage code -->
        <div class="showcase-wide-card">
          <div class="showcase-card__title">사용법 (nomacom-client-nuxt3 app.vue 대체)</div>
          <pre class="usage-code">&lt;!-- Before (Tailwind 인라인) --&gt;
&lt;div class="flex min-h-screen w-full justify-center bg-gray-100"&gt;
  &lt;div class="w-full max-w-[400px] bg-white"&gt;
    &lt;NuxtPage /&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;!-- After (NMobileLayout) --&gt;
&lt;NMobileLayout device="pro-max" :safe-area="true"&gt;
  &lt;NuxtPage /&gt;
&lt;/NMobileLayout&gt;</pre>
        </div>
      </div>
    </div>

    <!-- NPageHeader -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NPageHeader <span class="showcase-code">NEW</span></h2>
      <p class="showcase-section__desc">배경 이미지, 스텝 표시, 제목, 부제목을 지원하는 페이지 헤더입니다.</p>
      <div class="showcase-stack" style="gap: 24px;">
        <div class="showcase-card" style="padding: 0; overflow: hidden;">
          <NPageHeader
            step="1/4"
            title="주문을 확인합니다."
            subtitle="본인 확인을 위해 이름과 전화번호를 입력해 주세요."
            meta="12345"
            meta-label="주문번호"
          />
        </div>

        <div class="showcase-card" style="padding: 0; overflow: hidden;">
          <NPageHeader
            step="2/4"
            title="발행할 이심을 선택하세요."
            meta="67890"
            meta-label="주문번호"
            height="14rem"
          />
        </div>

        <div class="showcase-card" style="padding: 0; overflow: hidden;">
          <NPageHeader
            step="4/4"
            title="QR코드가 발행되었습니다."
            meta="12345"
            meta-label="주문번호"
            height="18rem"
          />
        </div>
      </div>
    </div>

    <!-- NSeparator -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NSeparator</h2>
      <p class="showcase-section__desc">콘텐츠를 분리하는 구분선입니다. 라벨 기능이 추가되었습니다.</p>
      <div class="showcase-grid">
        <div class="showcase-card">
          <div class="showcase-card__title">기본 구분선</div>
          <div class="showcase-stack" style="gap: 16px;">
            <p style="font-size: 14px; color: var(--color-neutral-600);">첫 번째 섹션</p>
            <NSeparator />
            <p style="font-size: 14px; color: var(--color-neutral-600);">두 번째 섹션</p>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">라벨 포함</div>
          <div class="showcase-stack" style="gap: 16px;">
            <NSeparator label="또는" />
            <NSeparator label="섹션 제목" />
            <NSeparator>아이폰 설치 코드</NSeparator>
            <NSeparator>안드로이드 설치 코드</NSeparator>
          </div>
        </div>

        <div class="showcase-card">
          <div class="showcase-card__title">세로 구분선</div>
          <div class="showcase-row" style="height: 40px;">
            <span style="font-size: 14px;">항목 A</span>
            <NSeparator orientation="vertical" />
            <span style="font-size: 14px;">항목 B</span>
            <NSeparator orientation="vertical" />
            <span style="font-size: 14px;">항목 C</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NMobileLayout,
  NPageHeader,
  NSeparator,
  NButton,
  NSpinner,
} from '@imjohnkoo/design-vue'
import type { MobileDevicePreset } from '@imjohnkoo/design-vue'

const devicePresets: MobileDevicePreset[] = ['se', 'standard', 'pro', 'plus', 'pro-max']

const presetWidths: Record<MobileDevicePreset, string> = {
  'se': '375px',
  'standard': '393px',
  'pro': '402px',
  'plus': '430px',
  'pro-max': '440px',
}
</script>

<style scoped>
.mobile-demo-wrapper {
  border: 1px solid var(--color-neutral-200, #e5e5e5);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-neutral-100, #f5f5f5);
}

.mobile-demo-small {
  border: 1px solid var(--color-neutral-200, #e5e5e5);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-neutral-100, #f5f5f5);
  padding: 12px;
}

.props-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.props-table th {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid var(--color-neutral-200, #e5e5e5);
  color: var(--color-neutral-600, #525252);
  font-weight: 600;
}

.props-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
}

.usage-code {
  background: var(--color-neutral-900, #171717);
  color: var(--color-neutral-100, #f5f5f5);
  padding: 16px;
  border-radius: 8px;
  font-family: var(--font-fontFamily-mono, monospace);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}
</style>
