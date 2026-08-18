# design/

ESIMmany 마케팅 자산 (네이버 스마트스토어 상품상세 PNG export 용).

> **이 폴더는 `apps/admin`, `apps/client`, `apps/mobile` 의 배포와 무관합니다.** 어떤 turbo
> 빌드도 거치지 않고, 어떤 package.json 에도 등록되어 있지 않습니다. 단순한 정적 HTML 모음.
> deploy paths 필터 밖이라 자유롭게 커밋 가능.

---

## 두 세대의 구조 (중요)

`products/` 아래에 **서로 다른 두 아키텍처**가 공존합니다. 신규 상품은 **southern-eu 패턴**을 따르세요.

| | **japan-7day** (구) | **southern-eu** (신, 권장) |
| --- | --- | --- |
| 섹션 소스 | 상위 공유 `design/sections/` (`SECTION_BASE = '../../sections'`) | 상품 폴더 내 자체 `sections/` |
| 합성 방식 | **iframe** (`?embed=1` 로 각 섹션을 iframe 으로 삽입) | **fetch + inject** — 섹션 HTML 을 fetch 해서 `.canvas` 만 추출, inline `<style>` 을 main head 에 주입. iframe 없음 → height 자동, 내부 스크롤 없음 |
| shared / assets | 상위 `design/shared/` 공유 | 상품 폴더 내 자체 `shared/` + `assets/` (모델 사진·지도·로고) |
| 섹션 수 | 14 (`04-payment-benefits` 포함) | 13 (`04` 폐기 — plan-picker 가 흡수) |
| variations | 없음 | 섹션별 `*-variations.html` 탐색본 (A/B 후보) → 확정안만 `sections/NN-slug.html` 로 승격 |
| 카피 | 일본 일반 | EU 특화 rewrite (24h rolling 갱신·2개국 자동 전환 등) |

> 새 상품은 southern-eu 를 복사해 시작하는 것을 권장 (자체 sections/shared/assets 로 self-contained,
> 상품 간 간섭 없음). japan-7day 는 상위 공유 `sections/` 를 쓰므로 다른 상품과 섹션을 공유.

---

## 디렉토리 구조

```
design/
├── README.md                      ← 본 문서
├── shared/                        ← (구) japan-7day 가 공유하는 공통 자산
│   ├── tokens.css                   - design-tokens 의 CSS 변수 사본 (curated subset)
│   ├── base.css                     - reset · 페이지 canvas · 툴바 · 공통 primitives
│   └── export.js                    - PNG export 버튼 wiring
├── sections/                      ← (구) japan-7day 용 공유 섹션 14종 (standalone)
│   ├── 01-hero.html
│   ├── 02-trust-strip.html
│   ├── 03-plan-picker.html
│   ├── 04-payment-benefits.html
│   ├── 05-why.html  …  14-final-cta.html
├── products/                      ← 상품별 composed gallery
│   ├── japan-7day/                  ← (구) iframe 합성, 상위 sections/ 참조
│   │   └── index.html
│   └── southern-eu/                 ← (신) self-contained, fetch+inject 합성
│       ├── index.html                 - 13 섹션 갤러리 + 섹션별 PNG export
│       ├── sections/                  - 자체 섹션 13종 (01·02·03·05~14, 04 없음)
│       ├── shared/                    - 자체 tokens.css · base.css · export.js
│       ├── assets/                    - logo / maps(iberia) / models / data
│       └── *-variations.html          - 섹션별 디자인 후보 탐색본 (확정안은 sections/ 로 승격)
├── plan-2026-05-19.html           ← 초기 수정 계획서 (시각화)
├── plan-2026-05-20-EU.html        ← southern-eu(EU) 계획서
└── esim-detail.html               ← 이전 단일 파일 버전 (참조용 · 사용 안 함)
```

## 디자인 토큰

각 `shared/tokens.css` 는 `packages/design-tokens/src/*.json` 의 **수동 사본 (curated subset)** 입니다.
turbo 빌드 / workspace 의존성 없음 — `colors` / `shadows` / `radius` / `fonts` 만 미러링하며
(spacing scale · typography scale · breakpoints 는 미반영, 섹션이 자체 정의), 토큰 값이 바뀌면
**수동으로 동기화**해야 합니다. (현재 colors·shadows·radius 는 소스 JSON 과 일치 — 2026-06-11 점검)

> 동기화 대상이 둘: 상위 `design/shared/tokens.css` 와 `products/southern-eu/shared/tokens.css`.
> 현재 두 파일은 동일 내용. design-tokens 갱신 시 둘 다 함께 수정.

## 사용법

### 전체 페이지 미리보기 + 섹션별 export

```
open design/products/southern-eu/index.html      # (신) fetch+inject — 권장
open design/products/japan-7day/index.html        # (구) iframe
```

→ 좌측 sidebar 로 섹션 탐색 → 각 섹션 카드의 "PNG 저장" 버튼 → 해당 섹션 standalone 파일이
새 탭에서 `?auto-export=1` 쿼리와 함께 열리고 export 가 자동 실행됩니다.

> **southern-eu 는 fetch 기반**이라 `file://` 에서 CORS 차단될 수 있습니다. 그 경우 로컬 서버로:
>
> ```
> cd design/products/southern-eu && python3 -m http.server 8000
> # → http://localhost:8000/
> ```
>
> (Safari 는 `file://` fetch 를 허용하는 편. Chrome 은 로컬 서버 필요.)

### 섹션 하나 PNG export

```
open design/products/southern-eu/sections/03-plan-picker.html
```

→ 브라우저 → 우측 상단 보라색 "PNG 저장" 버튼 클릭 → 해당 섹션 PNG 다운로드.

### 다른 상품 만들기 (southern-eu 패턴 권장)

```
cp -R design/products/southern-eu design/products/taiwan-5day
```

→ `taiwan-5day/sections/*.html` 의 텍스트·이미지를 상품에 맞게 교체.
self-contained 라 다른 상품 섹션과 간섭 없음. `index.html` 의 `SECTIONS` 배열에서 섹션 목록·hint
를 조정하면 됩니다. (japan-7day 처럼 상위 공유 `sections/` 를 쓰고 싶으면 `SECTION_BASE` 만 변경.)

### 섹션 디자인 수정

각 섹션 HTML 파일이 self-contained:

- `<head>` 의 `<style>` 블록 → 그 섹션 전용 스타일
- `shared/tokens.css` + `shared/base.css` → 공통 토큰 · 페이지 frame · 툴바
- 변경 후 브라우저 새로고침 만으로 즉시 반영

### variations 워크플로 (southern-eu)

`*-variations.html` (예: `plan-picker-variations.html`) 는 한 섹션의 여러 디자인 후보를 한 파일에
나열한 탐색본입니다. 후보 중 확정안을 골라 `sections/NN-slug.html` 로 옮기면(승격) `index.html`
갤러리에 반영됩니다. variations 파일은 의사결정 기록용으로 남겨둡니다.

## 쿼리 파라미터

각 섹션 standalone 파일이 인식하는 query string:

| param            | 효과                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| `?embed=1`       | dev toolbar 숨김 · `<body>` 배경 투명. **(구) japan-7day 의 iframe 합성이 자동 부착.** southern-eu 의 fetch+inject 는 `.canvas` 만 추출하므로 embed 불필요. |
| `?auto-export=1` | 페이지 로드 직후 (800ms 후) 첫 export 버튼을 자동 클릭. 검수 / 자동화용.            |

`?embed=1&auto-export=1` 동시 사용 시 export PNG 에 툴바가 안 들어가는 깔끔한 형태로 자동 캡처됨.

## Placeholder 데이터

미확정 항목은 `<span class="placeholder">예시</span>` 마커로 표시 (작은 주황 라벨).

- 화면에서는 보임 ("예시", "확인 필요" 등)
- PNG export 시점에는 자동 숨김 (`base.css` 의 `.is-exporting .placeholder { display:none }`)

확정 답안이 나오면 해당 텍스트만 교체하고 `.placeholder` 마커를 제거합니다.

> southern-eu 섹션 본문은 현재 placeholder 마커 없이 실 카피로 채워진 상태. 60·90일 (출시 예정)
> 카피는 상품 출시 미확정으로 전면 제거됨 — 출시 확정 시 재도입 (`*-variations.html` 의 기록은 보존).

## 종속 자산

CDN 으로만 로드 (오프라인 환경에서는 동작 안 함):

- Pretendard — `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css`
- html-to-image — `unpkg.com/html-to-image@1.11.13/dist/html-to-image.js`

오프라인이 필요하면 두 자산을 `shared/vendor/` 로 다운로드해 link 경로만 바꾸면 됩니다.

## 알려진 한계 / 다음 작업

- 섹션 파일은 상품 데이터를 hardcode. JSON-driven 템플릿팅은 아직 미도입 (필요 시 다음 차수).
- 전체 페이지 (전 섹션 하나의 긴 PNG) export 기능은 없음. 필요 시 Playwright 기반 export 검토.
- **japan-7day → southern-eu 패턴 마이그레이션** 미완 (C-2, 일본 SKU 사업 신호 대기). 현재 japan-7day
  는 상위 공유 `sections/` + iframe 구식.
- southern-eu: 60·90일 상품 출시 미확정 (확정 시 카피 재도입), `model_male.png` 미사용(female 만),
  스마트스토어 실 업로드 미완 — weekly C 트랙 참조.
