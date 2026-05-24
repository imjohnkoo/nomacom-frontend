# design/

ESIMmany 마케팅 자산 (네이버 스마트스토어 상품상세 PNG export 용).

> **이 폴더는 `apps/admin`, `apps/client`, `apps/mobile` 의 배포와 무관합니다.** 어떤 turbo
> 빌드도 거치지 않고, 어떤 package.json 에도 등록되어 있지 않습니다. 단순한 정적 HTML 모음.

---

## 디렉토리 구조

```
design/
├── README.md                      ← 본 문서
├── shared/                        ← 모든 섹션이 공통으로 link 하는 자산
│   ├── tokens.css                   - design-tokens 의 CSS 변수 사본
│   ├── base.css                     - reset · 페이지 canvas · 툴바 · 공통 primitives
│   └── export.js                    - PNG export 버튼 wiring
├── sections/                      ← 14개 독립 섹션 파일 (각각 standalone)
│   ├── 01-hero.html
│   ├── 02-trust-strip.html       (NEW)
│   ├── 03-plan-matrix.html       (NEW)
│   ├── 04-payment-benefits.html  (NEW)
│   ├── 05-why.html
│   ├── 06-stats.html
│   ├── 07-reviews.html           (NEW)
│   ├── 08-coverage.html
│   ├── 09-how-it-works.html
│   ├── 10-comparison.html        (NEW)
│   ├── 11-compatibility.html
│   ├── 12-refund.html            (NEW)
│   ├── 13-faq.html
│   └── 14-final-cta.html
├── products/                      ← 상품별 composed gallery
│   └── japan-7day/
│       └── index.html               - 14 섹션 iframe 미리보기 + 섹션별 export
├── plan-2026-05-19.html           ← 본 작업의 수정 계획서 (시각화)
└── esim-detail.html               ← 이전 단일 파일 버전 (참조용 · 사용 안 함)
```

## 디자인 토큰

`shared/tokens.css` 는 `packages/design-tokens/src/*.json` 의 **수동 사본**.
turbo 빌드 / workspace 의존성 없음 — 색상 / shadow / radius 가 변경되면 수동으로 동기화.

## 사용법

### 섹션 하나 PNG export

```
open design/sections/03-plan-matrix.html
```

→ 브라우저 → 우측 상단 보라색 "PNG 저장" 버튼 클릭 → `esim-detail-03-plan-matrix-<ts>.png` 다운로드.

### 전체 페이지 미리보기 + 섹션별 export

```
open design/products/japan-7day/index.html
```

→ 좌측 sidebar 로 섹션 탐색 → 각 섹션 카드의 "PNG 저장" 버튼 → 자동으로 해당 섹션 standalone
파일이 새 탭에서 열리고 `?auto-export=1` 쿼리로 export 가 자동 실행됩니다.

### 다른 상품 만들기

```
cp -R design/products/japan-7day design/products/taiwan-5day
```

→ `taiwan-5day/index.html` 내부 텍스트 (상품명 / 도시 / 가격 등) 만 교체.
섹션 파일 자체를 상품별로 다르게 하고 싶으면 **`sections/` 도 함께 복사** 후 경로만 맞추면 됩니다
(현재는 모든 product 가 동일한 `sections/*.html` 을 공유).

### 섹션 디자인 수정

각 섹션 HTML 파일이 self-contained:

- `<head>` 의 `<style>` 블록 → 그 섹션 전용 스타일
- `shared/tokens.css` + `shared/base.css` → 공통 토큰 · 페이지 frame · 툴바
- 변경 후 브라우저 새로고침 만으로 즉시 반영

## 쿼리 파라미터

각 섹션 파일이 인식하는 query string:

| param            | 효과                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| `?embed=1`       | dev toolbar 숨김. `<body>` 배경 투명. **product gallery 의 iframe 이 자동으로 붙임.** |
| `?auto-export=1` | 페이지 로드 직후 (800ms 후) 첫 export 버튼을 자동 클릭. 검수 / 자동화용.              |

`?embed=1&auto-export=1` 동시 사용 시 export PNG 에 툴바가 안 들어가는 깔끔한 형태로 자동 캡처됨.

## Placeholder 데이터

수정 계획서 (`plan-2026-05-19.html`) 의 §7 Open Questions 답 미정 항목은
`<span class="placeholder">예시</span>` 마커로 표시했습니다.

- 화면에서는 보임 (작은 주황 라벨 — "예시", "확인 필요" 등)
- PNG export 시점에는 자동으로 숨김 (`base.css` 의 `.is-exporting .placeholder { display:none }`)

→ 결과적으로 PNG 출력물에는 placeholder 마커가 안 나오고, 디자이너는 무엇이 가짜 데이터인지
화면으로 확인 가능.

확정 답안이 나오면 각 섹션 파일에서 해당 텍스트만 교체하고 `.placeholder` 마커를 제거하면
됩니다.

## 종속 자산

CDN 으로만 로드 (오프라인 환경에서는 동작 안 함):

- Pretendard — `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css`
- html-to-image — `unpkg.com/html-to-image@1.11.13/dist/html-to-image.js`

오프라인이 필요하면 두 자산을 `shared/vendor/` 로 다운로드해 link 경로만 바꾸면 됩니다.

## 알려진 한계 / 다음 작업

- 섹션 파일은 상품 데이터를 hardcode. JSON-driven 템플릿팅은 아직 미도입 (필요 시 다음 차수).
- 전체 페이지 (14 섹션 하나의 긴 PNG) export 기능은 없음. 필요 시 Playwright 기반 export 추가
  검토.
- 통신사 로고 / 사업자 번호 / 사진 후기 등 §7 Open Questions 항목은 placeholder.
