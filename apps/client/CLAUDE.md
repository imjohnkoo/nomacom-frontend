# CLAUDE.md — nomacom-client-nuxt3

> eSIMMany: eSIM QR code issuance web app for Naver Smart Store customers

## Project Overview

**Service Name**: eSIMMany (이심매니)
**Purpose**: A B2C mobile web app where customers who purchased eSIM products from Naver Smart Store can verify their order, select usage start date/time/country, generate eSIMs via Maya API, and receive QR codes for installation.
**Target Users**: Korean consumers (mobile-first, fixed 400px max-width layout)
**UI Language**: Korean only

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Nuxt 3.17+ | SSR + Server Routes |
| Frontend | Vue 3 Composition API | `<script setup>` pattern |
| Styling | TailwindCSS | NanumSquareNeo, Pretendard fonts |
| UI Components | HeadlessUI, HeroIcons | Listbox, Modal, etc. |
| State | Pinia | Options API style store |
| DB | PostgreSQL + Drizzle ORM | `postgres` driver (not pg) |
| External API | Maya API | eSIM provisioning (Basic Auth) |
| Date | date-fns, date-fns-tz, dayjs | Timezone conversion is critical |
| QR | qrcode-vue3 | activation_code → QR rendering |
| Package Manager | Yarn 1.x | Uses `yarn.lock` |

## Core User Flow (4 Steps)

```
1. /verify/{orderId}       → Identity verification with name + phone number
2. /details/{orderId}      → Select eSIM product from order list
3. /select-date/{orderId}  → Choose start country/date/time → Create eSIM via Maya API
4. /view/{orderId}         → Display QR code + download + manual installation codes
```

Orders with already-issued eSIMs skip from details directly to view.

## Directory Structure

```
nomacom-client-nuxt3/
├── app.vue                        # Root: fixed 400px width layout
├── pages/                         # File-based routing (4 pages)
│   ├── index.vue                  # Landing page with direct order ID input
│   ├── verify/[orderId].vue       # Step 1: Identity verification
│   ├── details/[orderId].vue      # Step 2: Product selection
│   ├── select-date/[orderId].vue  # Step 3: Date/time selection + activation
│   └── view/[orderId].vue         # Step 4: QR code display
├── components/popup/              # 8 modal components
├── composables/useApi.ts          # API calls (verifyOrder, activateOrder)
├── stores/order.ts                # Pinia: orders[], singleOrder
├── types/                         # TypeScript interfaces
│   ├── order.ts                   # Order, Esim types
│   └── api.ts                     # Request/Response types
├── utils/                         # Client utilities (date, formatter)
├── server/
│   ├── api/v1/
│   │   ├── verify.post.ts         # POST /api/v1/verify
│   │   └── activate.post.ts       # POST /api/v1/activate
│   ├── db/
│   │   ├── schema.ts              # Drizzle schema (orders, esims, planTypes, plans)
│   │   └── index.ts               # DB connection (singleton pattern)
│   └── utils/                     # Server utilities (maya-api, auth, date, string)
├── assets/                        # Fonts, icons, background images
└── public/                        # Static files (duplicate images with assets/)
```

## Data Model (Drizzle Schema)

```
orders (PK: productOrderId)
  ├── orderId, productOrderStatus, lastChangedType
  ├── productName, productOption, quantity, totalPaymentAmount
  ├── customerName, customerPhoneNumber, customerId, customerEmail
  ├── receiverName, receiverPhoneNumber
  ├── cancel/return related fields
  └── 1:N → esims

esims (PK: esimId = iccid)
  ├── Maya API response fields (apn, smdpAddress, activationCode, manualCode, etc.)
  └── FK: orderId → orders.productOrderId

planTypes (PK: planTypeId)
  ├── Plan display info (kr/eng names, data type/limit, country lists)
  ├── Maya API fields (uid, policyId, dataQuotaMb, validityDays)
  └── 1:N → plans

plans (PK: planId, auto-increment)
  ├── User input (startDate, startTime, startTimeZone, startCountry)
  ├── Computed values (timeToBeActivatedInUTC, timeToBeActivatedInLocal)
  ├── FK: esimId → esims.esimId
  └── FK: planTypeId → planTypes.planTypeId
```

## API Endpoints

### POST /api/v1/verify
- **Input**: `{ fullName, phoneNumber, orderId, productOrderId? }`
- **Behavior**: Query orders by orderId → check cancellation status → join planType → respond with esims
- **Response**: `{ verified, cancelled?, details?: OrderDetails[] }`

### POST /api/v1/activate
- **Input**: Order info + start date/time/timezone/country
- **Behavior**: Validate order → create eSIMs via Maya API (loop by quantity) → save to DB (esim + plan)
- **Response**: `{ verified, details: [OrderDetails] }` (includes created eSIMs)

## External API Integration

### Maya API (eSIM Provisioning)
- **Auth**: Basic Auth (clientId:clientSecret → Base64)
- **Endpoints**: `{MAYA_API_ENDPOINT}/esim` (POST: create, GET /{iccid}: retrieve)
- **Key Response Fields**: iccid, activation_code, smdp_address, manual_code

## Environment Variables

```env
DATABASE_URL=postgres://user:password@host:5432/esimmany
MAYA_API_ENDPOINT=https://api.maya.net/connectivity/v1
MAYA_API_CLIENT_ID=xxx
MAYA_API_CLIENT_SECRET=xxx
```

Exposed via runtimeConfig as server-only values. Only `apiBase` is public.

## Code Conventions

1. **ESLint + Prettier**: single quotes, semicolons, 100 char width, ES5 trailing commas
2. **Vue**: `<script setup lang="ts">` + `<template>` order, Composition API
3. **Server**: Nuxt server utils auto-import, `defineEventHandler`, `createError()` for errors
4. **DB**: `useDB()` singleton, Drizzle relational queries (`db.query.*.findMany/findFirst`)
5. **Types**: Interfaces defined separately in server/api and types/ (duplication exists, consolidation needed)
6. **Fonts**: NanumSquareNeo (primary), Pretendard (secondary)
7. **Colors**: cyan-600 primary palette, vtd-primary (cyan palette for datepicker)

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Dev server (--dotenv .env.local)
yarn build            # Production build
yarn preview          # Preview build
yarn lint             # ESLint
yarn format           # Prettier
```

## Known Issues / Technical Debt

1. **Duplicate images in assets/ and public/**: Identical images exist in both `assets/icons` and `public/icons`
2. **Type duplication**: Interfaces in `server/api/` files and `types/` directory are defined separately
3. **Incomplete error handling**: No rollback logic when Maya API fails during activation
4. **Hardcoded delays**: 3-second `setTimeout` for UX loading animations in verify/select-date
5. **No authentication**: Access controlled only by order ID + name/phone (no login system)
6. **No structured logging**: Only `console.error` used, no structured logging implementation
7. **No tests**: No unit/integration/E2E test files exist

## Project Status

- **Branch**: `init-config` (default branch, 2 commits)
- **Stage**: Early development (WiP)
- **Legacy reference**: `.claude/skills/m8-project.md` contains M8 Messaging Client guidelines from a previous project. Architecture/patterns are referenceable, but domain logic differs from eSIMMany.
