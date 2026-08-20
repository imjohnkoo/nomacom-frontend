<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Charts</h1>
      <p class="showcase-section__desc">
        <code>vue-chrts</code> 위에 얹은 얇은 래퍼입니다. optional peer 라
        <code>@imjohnkoo/design-vue/charts</code> 서브엔트리로만 노출됩니다 —
        차트를 안 쓰는 앱의 번들에는 들어가지 않습니다.
      </p>
    </div>

    <!-- 팔레트 -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">팔레트</h2>
      <p class="showcase-section__desc">
        nomacom 보라 기준으로 도출하고 OKLab ΔE + 색각이상 시뮬레이션으로 검증했습니다.
        <strong>5색 전부 흰 배경 대비 3:1 을 통과</strong>해 얇은 선과 작은 도넛 조각도 보입니다.
      </p>
      <div class="showcase-wide-card">
        <div class="showcase-card__title">CHART_DEFAULT_COLORS — 범주형 (순서 무관)</div>
        <div class="swatches">
          <div v-for="(c, i) in defaultColors" :key="c" class="swatch">
            <span class="swatch__chip" :style="{ background: c }" />
            <span class="swatch__meta">
              <b>chart-{{ i + 1 }}</b>
              <code>{{ c }}</code>
            </span>
          </div>
        </div>
        <p class="demo-note">
          ⚠️ 슬롯 2(오렌지)와 5(앰버)는 절대 인접시키지 마세요 — protan 시야에서 ΔE 0.4 로
          사실상 한 색이 됩니다. 순서대로 배정하고 재정렬·건너뛰기 금지.
        </p>
      </div>

      <div class="showcase-wide-card" style="margin-top: 16px">
        <div class="showcase-card__title">CHART_SEQUENTIAL_COLORS — 순서형 (명도 계단)</div>
        <div class="swatches">
          <div v-for="(c, i) in seqColors" :key="c" class="swatch">
            <span class="swatch__chip" :style="{ background: c }" />
            <span class="swatch__meta">
              <b>seq-{{ i + 1 }}</b>
              <code>{{ c }}</code>
            </span>
          </div>
        </div>
        <p class="demo-note">
          primary 300/400/500/700/900. 600·800 은 인접 명도차가 가시 하한 미달이라 건너뛰었습니다.
        </p>
      </div>
    </div>

    <!-- NLineChart / NAreaChart -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NLineChart · NAreaChart</h2>
      <p class="showcase-section__desc">일자별 발급/개통 추이.</p>
      <div class="chart-grid">
        <div class="showcase-wide-card">
          <div class="showcase-card__title">NLineChart</div>
          <NLineChart
            :data="daily"
            x-key="date"
            :series="issueSeries"
            :height="260"
            y-label="건"
          />
        </div>
        <div class="showcase-wide-card">
          <div class="showcase-card__title">NAreaChart — stacked</div>
          <NAreaChart
            :data="daily"
            x-key="date"
            :series="issueSeries"
            :height="260"
            stacked
          />
        </div>
      </div>

      <div class="showcase-wide-card" style="margin-top: 16px">
        <div class="showcase-card__title">y-domain 고정 — 비율 계열</div>
        <NLineChart
          :data="daily"
          x-key="date"
          :series="rateSeries"
          :height="220"
          :y-domain="[0, 5]"
          :formatter="(v: number) => `${v.toFixed(1)}%`"
        />
        <p class="demo-note">
          비율 계열은 <code>yDomain</code> 고정이 사실상 필수입니다. 자동 스케일이면 기간을 바꿀 때마다
          진폭이 달라져 <strong>평시 1.8% 가 꼭대기까지 차올라 정상을 이상으로 오독</strong>하게 만듭니다.
        </p>
      </div>
    </div>

    <!-- NBarChart / NDonutChart -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NBarChart · NDonutChart</h2>
      <div class="chart-grid">
        <div class="showcase-wide-card">
          <div class="showcase-card__title">NBarChart</div>
          <NBarChart
            :data="byCountry"
            x-key="country"
            :series="countrySeries"
            :height="260"
          />
        </div>
        <div class="showcase-wide-card">
          <div class="showcase-card__title">NDonutChart — variant="list"</div>
          <NDonutChart
            :data="byChannel"
            value-key="value"
            label-key="channel"
            :height="260"
            variant="list"
            tooltip-percent
          />
        </div>
      </div>
    </div>

    <!-- 상태 -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">빈 상태 · 로딩</h2>
      <p class="showcase-section__desc">
        로딩 자리표시에는 <code>role="status"</code> + <code>aria-busy</code> 가 붙어 낭독기에도 전달됩니다.
      </p>
      <div class="chart-grid">
        <div class="showcase-wide-card">
          <div class="showcase-card__title">empty</div>
          <NLineChart :data="[]" x-key="date" :series="issueSeries" :height="200" />
        </div>
        <div class="showcase-wide-card">
          <div class="showcase-card__title">loading</div>
          <NLineChart :data="daily" x-key="date" :series="issueSeries" :height="200" loading />
        </div>
      </div>
    </div>

    <!-- 이중축 금지 -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">이중축(dual-axis) 은 지원하지 않습니다</h2>
      <div class="showcase-wide-card warn-card">
        <p style="margin: 0 0 10px">
          단위가 다른 두 계열을 좌우 축에 겹쳐 그리면, 두 축의 스케일을 임의로 정하는 것만으로
          <strong>존재하지 않는 상관을 만들어낼 수 있습니다.</strong> 같은 데이터로 「함께 오른다」와
          「무관하다」를 둘 다 그릴 수 있다면 그건 도표가 아니라 주장입니다.
        </p>
        <p style="margin: 0">
          대안: <b>2-패널 세로 스택</b>(x축 정렬 — <code>padding.left</code> 를 같은 값으로 고정),
          <b>small multiples</b>, 또는 <b>지수화</b>(기준 시점 = 100).
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NAreaChart,
  NBarChart,
  NDonutChart,
  NLineChart,
  CHART_DEFAULT_COLORS,
  CHART_SEQUENTIAL_COLORS,
} from '@imjohnkoo/design-vue/charts'

const defaultColors = CHART_DEFAULT_COLORS
const seqColors = CHART_SEQUENTIAL_COLORS

const daily = [
  { date: '08-13', issued: 412, activated: 388, failRate: 1.6 },
  { date: '08-14', issued: 455, activated: 421, failRate: 1.9 },
  { date: '08-15', issued: 610, activated: 574, failRate: 2.4 },
  { date: '08-16', issued: 588, activated: 552, failRate: 1.8 },
  { date: '08-17', issued: 502, activated: 480, failRate: 1.4 },
  { date: '08-18', issued: 471, activated: 449, failRate: 1.7 },
  { date: '08-19', issued: 534, activated: 509, failRate: 2.1 },
]

const issueSeries = [
  { key: 'issued', label: '발급' },
  { key: 'activated', label: '개통' },
]

const rateSeries = [{ key: 'failRate', label: '개통 실패율' }]

const byCountry = [
  { country: '일본', count: 1820 },
  { country: '베트남', count: 1104 },
  { country: '태국', count: 962 },
  { country: '유럽', count: 731 },
  { country: '미국', count: 508 },
]
const countrySeries = [{ key: 'count', label: '발급 건수' }]

const byChannel = [
  { channel: '스마트스토어', value: 6420 },
  { channel: '자사몰', value: 3180 },
  { channel: '쿠팡', value: 1740 },
  { channel: '기타', value: 1118 },
]
</script>

<style scoped>
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  gap: 16px;
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 10px;
}

.swatch__chip {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.swatch__meta {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.swatch__meta b {
  font-size: 12px;
  font-weight: 600;
}

.swatch__meta code {
  font-size: 11px;
  color: var(--n-color-neutral-500, #737373);
}

.demo-note {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--n-color-neutral-500, #737373);
}

.demo-note code {
  background: var(--n-color-neutral-100, #f5f5f5);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.warn-card {
  border-left: 3px solid var(--n-color-warning-500, #f59e0b);
  font-size: 14px;
  line-height: 1.7;
}
</style>
