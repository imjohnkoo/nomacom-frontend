<script setup lang="ts">
import { ref } from 'vue'
import {
  NInfoChip,
  NStatusPill,
  NTrustNote,
  NPageHeading,
  NStepProgress,
  NBottomSheet,
  NLoaderDialog,
  NFieldCard,
  NHighlightCard,
  NDurationCalendar,
  NCodeRow,
  NLinkCard,
  NInput,
  NButton,
  NAlertDialog,
} from '@imjohnkoo/design-vue'
import type { CalDate } from '@imjohnkoo/design-vue'

const nameVal = ref('')
const phoneVal = ref('')

const isSheetOpen = ref(false)
const isLoaderOpen = ref(false)
const isAlertOpen = ref(false)
const isConfirmOpen = ref(false)

const selectedDate = ref<CalDate | null>({ year: 2026, month: 5, day: 24 })

function fireLoader() {
  isLoaderOpen.value = true
  setTimeout(() => {
    isLoaderOpen.value = false
  }, 2500)
}
</script>

<template>
  <div class="esim-doc">
    <header class="esim-doc__hero">
      <h1>Esimmany Patterns</h1>
      <p>
        eSIMmany B2C 4-step flow 를 위해 추가된 토스풍 컴포넌트 카탈로그. 토큰
        <code>primary</code> 팔레트와 <code>radius/shadow</code> 도 함께 갱신됨.
      </p>
    </header>

    <!-- ============== Page heading + progress + brand ============== -->
    <section class="esim-doc__sec">
      <h2>Page heading · Progress · Logo</h2>
      <p class="esim-doc__desc">전체 4 페이지 상단에 공통으로 쓰이는 진행 표시 + 헤딩 패턴.</p>
      <div class="esim-doc__demo">
        <NStepProgress :step="2" :total="4" label="이심 선택" />
        <div class="esim-doc__gap" />
        <NPageHeading
          eyebrow="eSIM QR 코드 발급"
          :title="`주문하신 분이\n맞는지 확인할게요`"
          :description="`주문 시 입력하신 이름과 전화번호를\n그대로 입력해 주세요.`"
        />
      </div>
    </section>

    <!-- ============== Chips ============== -->
    <section class="esim-doc__sec">
      <h2>NInfoChip · NStatusPill</h2>
      <p class="esim-doc__desc">
        <code>NInfoChip</code> : 변경 불가 식별자 (주문번호/상품) · <code>NStatusPill</code> :
        발급/주문 상태
      </p>
      <div class="esim-doc__demo esim-doc__demo--row">
        <NInfoChip label="주문번호" value="2024042312345678">
          <template #icon>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
          </template>
        </NInfoChip>
        <NInfoChip value="일본 5GB / 7일">
          <template #icon>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
          </template>
        </NInfoChip>
      </div>
      <div class="esim-doc__demo esim-doc__demo--row">
        <NStatusPill color="success" dot>주문완료</NStatusPill>
        <NStatusPill color="info">
          <template #icon>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </template>
          발급완료
        </NStatusPill>
        <NStatusPill color="warning">알림</NStatusPill>
        <NStatusPill color="error">차단</NStatusPill>
        <NStatusPill color="primary">브랜드</NStatusPill>
        <NStatusPill color="neutral">중립</NStatusPill>
      </div>
    </section>

    <!-- ============== Trust note ============== -->
    <section class="esim-doc__sec">
      <h2>NTrustNote</h2>
      <p class="esim-doc__desc">보안/안내 카드. 본인 확인, 자동 활성화 등 보조 안내.</p>
      <div class="esim-doc__demo">
        <NTrustNote>
          본인 확인은 주문자와 동일한지 검증하기 위한 용도예요.<br />
          입력한 정보는 안전하게 처리되며, 발급 외 다른 목적으로 사용하지 않아요.
        </NTrustNote>
      </div>
    </section>

    <!-- ============== Highlight card ============== -->
    <section class="esim-doc__sec">
      <h2>NHighlightCard</h2>
      <p class="esim-doc__desc">브랜드 그라데이션 카드 — 사용 기간 미리보기, 결과 요약 등.</p>
      <div class="esim-doc__demo">
        <NHighlightCard>
          <template #icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 8v4l3 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </template>
          eSIM 사용 기간은
          <b style="color: var(--color-primary-700)">2026.05.24 (일) ~ 2026.05.31 (일)</b>
          이에요.<br />
          <span style="font-size: 11px; color: #6b7280"
            >시작 시간은 선택하신 국가의 현지 시각 기준이에요.</span
          >
        </NHighlightCard>
        <div class="esim-doc__gap" />
        <NHighlightCard variant="plain">
          <template #icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 2" />
            </svg>
          </template>
          plain variant — 그라데이션 없이 단색 회색.
        </NHighlightCard>
      </div>
    </section>

    <!-- ============== Inputs ============== -->
    <section class="esim-doc__sec">
      <h2>NInput · underline variant</h2>
      <p class="esim-doc__desc">floating label — focus/입력 시 라벨 축소 + 보라 underline.</p>
      <div class="esim-doc__demo">
        <NInput v-model="nameVal" variant="underline" label="이름" />
        <div class="esim-doc__gap" />
        <NInput v-model="phoneVal" variant="underline" label="전화번호" type="tel" />
      </div>
    </section>

    <!-- ============== FieldCard ============== -->
    <section class="esim-doc__sec">
      <h2>NFieldCard</h2>
      <p class="esim-doc__desc">클릭형 dropdown trigger — 라벨/값/chevron.</p>
      <div class="esim-doc__demo esim-doc__demo--stack">
        <NFieldCard label="시작 국가" value="🇯🇵 일본 · Asia/Tokyo" active />
        <NFieldCard label="시작 날짜" value="2026.05.24 (일)" active />
        <NFieldCard label="시작 시간" placeholder="시간을 선택해 주세요" />
        <NFieldCard label="에러 예시" placeholder="필수 입력" error />
      </div>
    </section>

    <!-- ============== Calendar ============== -->
    <section class="esim-doc__sec">
      <h2>NDurationCalendar</h2>
      <p class="esim-doc__desc">
        시작일 선택 + duration 만큼 range 자동 확장 · 이전 월 disable · 다음 월 spillover.
      </p>
      <div class="esim-doc__demo">
        <NDurationCalendar v-model="selectedDate" :duration="7" />
        <p class="esim-doc__hint">
          선택: {{ selectedDate?.year }}.{{ String(selectedDate?.month).padStart(2, '0') }}.{{
            String(selectedDate?.day).padStart(2, '0')
          }}
          (+ 7일)
        </p>
      </div>
    </section>

    <!-- ============== Code rows ============== -->
    <section class="esim-doc__sec">
      <h2>NCodeRow</h2>
      <p class="esim-doc__desc">mono value + 복사 버튼 — eSIM 수동 설치 코드용.</p>
      <div class="esim-doc__demo esim-doc__codes">
        <NCodeRow label="SM-DP+ 주소" value="smdp.io.idemia.io" />
        <NCodeRow label="활성화 코드" value="CLF6X-VG2DH-9PMQ8-WERTY" />
        <NCodeRow label="LPA 전체" value="LPA:1$smdp.io.idemia.io$CLF6X-VG2DH-9PMQ8-WERTY" />
      </div>
    </section>

    <!-- ============== Link card ============== -->
    <section class="esim-doc__sec">
      <h2>NLinkCard</h2>
      <p class="esim-doc__desc">외부 가이드 링크 카드 — OS 별 안내 등.</p>
      <div class="esim-doc__demo esim-doc__demo--stack">
        <NLinkCard label="아이폰 설치 가이드" sub="iOS · Universal Link 자동 설치" href="#">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#111827">
              <path
                d="M19.665 16.811a10.32 10.32 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.563-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.025-1.154-.229-1.732-.764-.367-.32-.826-.87-1.377-1.648-.59-.829-1.075-1.794-1.456-2.891-.408-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422.745.28 1.224.422 1.434.422.157 0 .688-.166 1.588-.493.852-.303 1.572-.429 2.164-.379 1.604.13 2.809.762 3.611 1.901-1.434.871-2.144 2.091-2.13 3.658.012 1.221.456 2.237 1.33 3.044a4.378 4.378 0 0 0 1.336.871c-.108.31-.221.609-.341.895z"
              />
            </svg>
          </template>
        </NLinkCard>
        <NLinkCard label="안드로이드 설치 가이드" sub="Galaxy · Pixel · QR 등록" href="#">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3ddc84">
              <path
                d="M17.523 15.34a1.123 1.123 0 1 1 1.122-1.123 1.123 1.123 0 0 1-1.122 1.123m-11.046 0a1.123 1.123 0 1 1 1.123-1.123 1.123 1.123 0 0 1-1.123 1.123m11.45-6.02 2.24-3.879a.465.465 0 0 0-.165-.635.466.466 0 0 0-.635.17l-2.27 3.931a14.107 14.107 0 0 0-11.793 0L3.034 4.976a.467.467 0 0 0-.806.464l2.24 3.88A13.219 13.219 0 0 0 0 19.59h24a13.218 13.218 0 0 0-6.077-10.27"
              />
            </svg>
          </template>
        </NLinkCard>
      </div>
    </section>

    <!-- ============== Modal demos ============== -->
    <section class="esim-doc__sec">
      <h2>NLoaderDialog · NAlertDialog · NBottomSheet</h2>
      <p class="esim-doc__desc">버튼 클릭으로 미리보기.</p>
      <div class="esim-doc__demo esim-doc__demo--row">
        <NButton variant="primary" @click="fireLoader">Loader (2.5s)</NButton>
        <NButton variant="primary" @click="isAlertOpen = true">Alert</NButton>
        <NButton variant="primary" @click="isConfirmOpen = true">Confirm</NButton>
        <NButton variant="primary" @click="isSheetOpen = true">Bottom Sheet</NButton>
      </div>
    </section>

    <!-- ============== CTA ============== -->
    <section class="esim-doc__sec">
      <h2>NButton · size="xl"</h2>
      <p class="esim-doc__desc">sticky CTA preset — h56 + radius 2xl + brand shadow.</p>
      <div class="esim-doc__demo">
        <NButton variant="primary" size="xl" full-width>QR 코드 발행하기</NButton>
      </div>
    </section>

    <!-- ============== Modals & sheets (rendered) ============== -->
    <NLoaderDialog
      v-model="isLoaderOpen"
      title="주문을 확인하고 있어요"
      description="잠시만 기다려주세요…"
    />

    <NAlertDialog
      v-model="isAlertOpen"
      title="주문번호와 일치하지 않아요"
      color="warning"
      :closable="false"
    >
      <p
        style="
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          line-height: 1.55;
          margin-top: -6px;
        "
      >
        주문 시 입력하신 이름과 전화번호를<br />다시 한 번 확인해 주세요.
      </p>
      <template #actions>
        <NButton variant="primary" full-width @click="isAlertOpen = false">다시 입력하기</NButton>
      </template>
    </NAlertDialog>

    <NAlertDialog
      v-model="isConfirmOpen"
      title="이 내용으로 발급할까요?"
      color="primary"
      :closable="false"
    >
      <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; text-align: left">
        <div
          style="
            background: #f9fafb;
            border-radius: 14px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 13px;
          "
        >
          <div style="display: flex; justify-content: space-between">
            <span style="color: #6b7280">상품</span
            ><span style="font-weight: 600">일본 5GB / 7일</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span style="color: #6b7280">시작 일시</span
            ><span style="font-weight: 600">2026.05.24 오전 10시</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span style="color: #6b7280">수량</span><span style="font-weight: 600">1개</span>
          </div>
        </div>
      </div>
      <template #actions>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; width: 100%">
          <NButton variant="secondary" @click="isConfirmOpen = false">뒤로</NButton>
          <NButton variant="primary" @click="isConfirmOpen = false">발급하기</NButton>
        </div>
      </template>
    </NAlertDialog>

    <NBottomSheet v-model="isSheetOpen" title="시작 국가 선택">
      <div style="display: flex; flex-direction: column; gap: 4px">
        <div
          v-for="c in ['일본', '대만', '베트남', '태국']"
          :key="c"
          style="padding: 12px; border-radius: 12px; font-size: 15px; color: #111827"
        >
          {{ c }}
        </div>
      </div>
      <template #footer>
        <NButton variant="primary" size="xl" full-width @click="isSheetOpen = false"
          >선택 완료</NButton
        >
      </template>
    </NBottomSheet>
  </div>
</template>

<style scoped>
.esim-doc {
  max-width: 880px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.esim-doc__hero {
  margin-bottom: 28px;
}
.esim-doc__hero h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.01em;
}
.esim-doc__hero p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
}
.esim-doc__hero code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #5025e8;
}

.esim-doc__sec {
  margin-top: 36px;
  border-top: 1px solid #f1f5f9;
  padding-top: 24px;
}
.esim-doc__sec h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.esim-doc__sec p.esim-doc__desc {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: #64748b;
}
.esim-doc__sec code {
  background: #f3f4f6;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11.5px;
  color: #5025e8;
}

.esim-doc__demo {
  margin-top: 16px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  max-width: 460px;
}

.esim-doc__demo--row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.esim-doc__demo--stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.esim-doc__codes {
  background: #ffffff;
}

.esim-doc__gap {
  height: 16px;
}

.esim-doc__hint {
  margin: 10px 0 0;
  font-size: 11px;
  color: #94a3b8;
}
</style>
