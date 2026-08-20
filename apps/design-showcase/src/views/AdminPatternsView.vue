<template>
  <div>
    <div class="showcase-section">
      <h1 class="showcase-section__title">Admin Patterns</h1>
      <p class="showcase-section__desc">
        운영 어드민 화면이 반복 복제하던 패턴을 흡수한 컴포넌트들입니다.
        m8 DS 의 「Admin 패턴 표준화」 세트를 nomacom 구조로 옮겼습니다.
      </p>
    </div>

    <!-- NKpi / NKpiStrip -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NKpi · NKpiStrip</h2>
      <p class="showcase-section__desc">
        대시보드 상단 KPI 행. 델타는 색에만 의존하지 않고 ▲▼ 기호 + 스크린리더 문구를 함께 냅니다.
      </p>
      <div class="showcase-wide-card">
        <NKpiStrip>
          <NKpi label="총 발급" value="12,458" delta="+8.2%" hint="전월 대비" />
          <NKpi label="활성 eSIM" value="3,102" delta="-1.4%" hint="전월 대비" />
          <NKpi label="개통 대기" value="47" sub="건" accent="warning" />
          <!-- 취소율은 오르면 나쁜 지표다. trend 를 주지 않으면 악화가 초록으로 표시된다. -->
          <NKpi
            label="취소율"
            value="2.1"
            suffix="%"
            delta="+0.3%p"
            trend="up-bad"
            hint="전월 대비"
          />
        </NKpiStrip>
      </div>

      <div class="showcase-wide-card" style="margin-top: 16px">
        <div class="showcase-card__title">trend — 방향과 «좋고 나쁨» 은 다르다</div>
        <NKpiStrip>
          <NKpi label="매출 (up-good)" value="284.3M" delta="+8.2%" hint="상승 = 초록" />
          <NKpi
            label="개통 실패율 (up-bad)"
            value="2.4"
            suffix="%"
            delta="+0.6%p"
            trend="up-bad"
            hint="상승 = 빨강"
          />
          <NKpi
            label="동시 접속 (neutral)"
            value="1,204"
            delta="+120"
            trend="neutral"
            hint="좋고 나쁨 없음"
          />
        </NKpiStrip>
        <p class="demo-note">
          화살표 방향(▲▼)과 낭독 문구(증가/감소)는 <strong>항상 실제 증감</strong>을 따르고,
          색만 <code>trend</code> 를 따릅니다.
        </p>
      </div>

      <div class="showcase-wide-card" style="margin-top: 16px">
        <div class="showcase-card__title">loading — 값 자리만 스켈레톤</div>
        <NKpiStrip>
          <NKpi label="총 발급" value="—" loading />
          <NKpi label="활성 eSIM" value="—" loading />
          <NKpi label="개통 대기" value="—" loading />
        </NKpiStrip>
      </div>
    </div>

    <!-- NDetailHeader + NDescriptionList -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NDetailHeader · NDescriptionList</h2>
      <p class="showcase-section__desc">
        상세 페이지 헤더와 key-value 블록. NDescriptionList 는
        <code>&lt;dl&gt;/&lt;dt&gt;/&lt;dd&gt;</code> 시맨틱을 그대로 씁니다.
      </p>
      <div class="showcase-wide-card">
        <NDetailHeader
          title="김노마 (ORD-20260819-0042)"
          avatar-text="김노"
          title-tag="h3"
          :meta="detailMeta"
        >
          <template #badges>
            <NStatusPill status="success" label="개통 완료" />
          </template>
        </NDetailHeader>

        <div style="margin-top: 20px">
          <NDescriptionList :items="detailItems" :columns="2" divider />
        </div>
      </div>
    </div>

    <!-- NSegmentedControl + NFilterPill + NDateRangeFilter -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NSegmentedControl · NFilterPill · NDateRangeFilter</h2>
      <p class="showcase-section__desc">
        목록 상단 필터 3종. 전부 키보드로 조작됩니다 —
        SegmentedControl 은 화살표 키 + roving tabindex, FilterPill 은
        <code>aria-pressed</code>, DateRangeFilter 는 Esc 로 패널이 닫힙니다.
      </p>
      <div class="showcase-wide-card">
        <div class="showcase-card__title">NSegmentedControl</div>
        <div class="showcase-row" style="flex-direction: column; align-items: flex-start; gap: 14px">
          <NSegmentedControl v-model="statusTab" :options="statusOptions" />
          <NSegmentedControl v-model="statusTab" :options="statusOptions" pill />
          <NSegmentedControl v-model="statusTab" :options="statusOptions" size="sm" />
        </div>
        <p class="demo-note">선택됨: <code>{{ statusTab }}</code></p>
      </div>

      <div class="showcase-wide-card" style="margin-top: 16px">
        <div class="showcase-card__title">NFilterPill</div>
        <div class="showcase-row">
          <NFilterPill
            v-for="pill in pills"
            :key="pill.key"
            :active="activePill === pill.key"
            :count="pill.count"
            @click="activePill = pill.key"
          >
            {{ pill.label }}
          </NFilterPill>
        </div>
        <p class="demo-note">선택됨: <code>{{ activePill }}</code></p>
      </div>

      <div class="showcase-wide-card" style="margin-top: 16px">
        <div class="showcase-card__title">NDateRangeFilter</div>
        <NDateRangeFilter
          v-model="dateRange"
          v-model:preset="datePreset"
          @apply="onRangeApply"
        />
        <p class="demo-note">
          적용됨: <code>{{ dateRange.startDate || '—' }} ~ {{ dateRange.endDate || '—' }}</code>
          (preset: <code>{{ datePreset }}</code>)
        </p>
        <p class="demo-note">
          최대 90일 제한이 걸려 있습니다 — 더 긴 범위를 직접 입력하면 적용이 차단됩니다.
        </p>
      </div>
    </div>

    <!-- NEditableField -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NEditableField</h2>
      <p class="showcase-section__desc">
        상세 페이지 인라인 편집. 편집 진입 시 입력으로 포커스가 이동하고, 저장/취소 후
        트리거로 돌아옵니다. Enter 저장 · Esc 취소 (textarea 는 Cmd/Ctrl+Enter).
      </p>
      <div class="showcase-wide-card">
        <dl class="edit-grid">
          <div class="edit-row">
            <dt>고객명</dt>
            <dd><NEditableField v-model="editable.name" @save="flash('고객명')" /></dd>
          </div>
          <div class="edit-row">
            <dt>수량</dt>
            <dd><NEditableField v-model="editable.qty" type="number" @save="flash('수량')" /></dd>
          </div>
          <div class="edit-row">
            <dt>플랜</dt>
            <dd>
              <NEditableField
                v-model="editable.plan"
                type="select"
                :options="planOptions"
                @save="flash('플랜')"
              />
            </dd>
          </div>
          <div class="edit-row">
            <dt>메모</dt>
            <dd>
              <NEditableField v-model="editable.memo" type="textarea" block @save="flash('메모')" />
            </dd>
          </div>
          <div class="edit-row">
            <dt>ICCID</dt>
            <dd>
              <NEditableField
                v-model="editable.iccid"
                mono
                readonly
                readonly-reason="발급 후에는 변경할 수 없습니다"
              />
            </dd>
          </div>
        </dl>
        <p v-if="lastSaved" class="demo-note">최근 저장: <code>{{ lastSaved }}</code></p>
      </div>
    </div>

    <!-- NAsyncSection -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NAsyncSection</h2>
      <p class="showcase-section__desc">
        로딩 · 에러 · 빈 · 콘텐츠 4상태 래퍼. <strong>최초 로드는 스켈레톤, 데이터가 있는 갱신은
        오버레이</strong>라 필터를 바꿀 때 표가 빈 화면으로 깜빡이지 않습니다.
      </p>
      <div class="showcase-row" style="margin-bottom: 12px">
        <NButton
          v-for="s in asyncStates"
          :key="s"
          size="sm"
          :variant="asyncState === s ? 'primary' : 'outline'"
          @click="asyncState = s"
        >
          {{ s }}
        </NButton>
      </div>
      <div class="showcase-wide-card">
        <NAsyncSection
          :pending="asyncState === 'loading' || asyncState === 'refreshing'"
          :empty="asyncState === 'loading' || asyncState === 'empty'"
          :error="asyncState === 'error' ? new Error('boom') : undefined"
          error-message="주문 목록을 불러오지 못했습니다."
          empty-title="조건에 맞는 주문이 없습니다"
          skeleton="table"
          :skeleton-rows="4"
          :skeleton-columns="4"
          @retry="asyncState = 'content'"
        >
          <NDescriptionList :items="detailItems" :columns="2" />
        </NAsyncSection>
      </div>
    </div>

    <!-- NFormModal -->
    <div class="showcase-section">
      <h2 class="showcase-section__title">NFormModal</h2>
      <p class="showcase-section__desc">
        CRUD 모달 골격. footer 의 저장 버튼이 <code>form</code> 속성으로 본문 폼과 연결돼 있어
        입력 필드에서 <strong>Enter 로도 제출</strong>됩니다. 제출 중에는 Esc · 백드롭 · X 가 전부 막힙니다.
      </p>
      <div class="showcase-row">
        <NButton size="sm" @click="openFormModal(false)">열기</NButton>
        <NButton size="sm" variant="outline" @click="openFormModal(true)">
          제출 중 상태로 열기
        </NButton>
      </div>

      <NFormModal
        v-model="formModalOpen"
        title="플랜 추가"
        description="새 요금제를 등록합니다."
        :submitting="formSubmitting"
        :error="formError"
        submit-label="등록"
        @submit="onFormSubmit"
        @cancel="formError = undefined"
      >
        <NFormField label="플랜명" required>
          <NInput v-model="formDraft.name" placeholder="예: 일본 5일 3GB" maxlength="40" />
        </NFormField>
        <NFormField label="데이터 용량" hint="GB 단위로 입력하세요">
          <NInput v-model="formDraft.data" placeholder="3" inputmode="decimal" />
        </NFormField>
      </NFormModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  NAsyncSection,
  NButton,
  NDateRangeFilter,
  NDescriptionList,
  NDetailHeader,
  NEditableField,
  NFilterPill,
  NFormField,
  NFormModal,
  NInput,
  NKpi,
  NKpiStrip,
  NSegmentedControl,
  NStatusPill,
} from '@imjohnkoo/design-vue'
import type { NDateRangeFilterValue } from '@imjohnkoo/design-vue'

/* ── NDetailHeader / NDescriptionList ── */
const detailMeta = [
  { label: '주문일', value: '2026-08-19' },
  { label: '결제', value: '38,000원' },
  { label: 'ICCID', value: '8982...0042', mono: true, locked: true },
]

const detailItems = [
  { label: '상품명', value: '일본 5일 3GB' },
  { label: '수량', value: '1' },
  { label: '개통 국가', value: '일본' },
  { label: '개통 시각', value: '2026-08-20 09:12' },
  { label: '잔여 데이터', value: '2.1GB / 3GB' },
  { label: '판매 채널', value: '네이버 스마트스토어' },
]

/* ── 필터 ── */
const statusTab = ref('all')
const statusOptions = [
  { label: '전체', value: 'all' },
  { label: '개통 완료', value: 'active', badge: '3,102' },
  { label: '대기', value: 'pending', badge: '47', badgeWarn: true },
  { label: '취소', value: 'canceled' },
]

const activePill = ref('all')
const pills = [
  { key: 'all', label: '전체', count: 12458 },
  { key: 'today', label: '오늘 주문', count: 132 },
  { key: 'unissued', label: '미발급', count: 7 },
  { key: 'refund', label: '환불 요청', count: 3 },
]

const dateRange = ref<NDateRangeFilterValue>({ startDate: '', endDate: '' })
const datePreset = ref('7d')
function onRangeApply() {
  /* 데모라 별도 처리 없음 — 실제 앱에서는 여기서 목록을 다시 조회한다 */
}

/* ── NEditableField ── */
const editable = reactive({
  name: '김노마',
  qty: 1,
  plan: 'jp-5d-3gb',
  memo: '공항에서 수령 예정',
  iccid: '89820000000000000042',
})
const planOptions = [
  { label: '일본 5일 3GB', value: 'jp-5d-3gb' },
  { label: '일본 7일 5GB', value: 'jp-7d-5gb' },
  { label: '유럽 10일 8GB', value: 'eu-10d-8gb' },
]
const lastSaved = ref('')
function flash(field: string) {
  lastSaved.value = field
}

/* ── NAsyncSection ── */
const asyncStates = ['content', 'loading', 'refreshing', 'empty', 'error'] as const
type AsyncState = (typeof asyncStates)[number]
const asyncState = ref<AsyncState>('content')

/* ── NFormModal ── */
const formModalOpen = ref(false)
const formSubmitting = ref(false)
const formError = ref<string | undefined>()
const formDraft = reactive({ name: '', data: '' })

function openFormModal(submitting: boolean) {
  formError.value = undefined
  formSubmitting.value = submitting
  formModalOpen.value = true
}

function onFormSubmit() {
  if (!formDraft.name.trim()) {
    formError.value = '플랜명을 입력해 주세요.'
    return
  }
  formError.value = undefined
  formModalOpen.value = false
}
</script>

<style scoped>
.demo-note {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--n-color-neutral-500, #737373);
}

.demo-note code {
  background: var(--n-color-neutral-100, #f5f5f5);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 14px 24px;
  margin: 0;
}

.edit-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-row dt {
  font-size: 13px;
  font-weight: 500;
  color: var(--n-color-neutral-500, #737373);
}

.edit-row dd {
  margin: 0;
}
</style>
