# Nomacom Admin Dashboard

Nomacom 프로젝트의 관리자 대시보드 애플리케이션.

## Tech Stack

- **Framework:** Nuxt 4
- **ORM:** Drizzle ORM + PostgreSQL
- **Design System:** @imjohnkoo/design-vue, @imjohnkoo/design-tokens
- **Package Manager:** Yarn 4 (Berry)

## Prerequisites

- Node.js 20+
- PostgreSQL
- `NOMACOM_PACKAGES_TOKEN` 환경변수 (GitHub Packages 인증)
- `DATABASE_URL` 환경변수 (기본값: `postgresql://localhost:5432/nomacom_admin`)

## Setup

```bash
yarn install
```

## Development

```bash
yarn dev
```

## Database

```bash
yarn db:generate   # 마이그레이션 생성
yarn db:migrate    # 마이그레이션 적용
yarn db:studio     # Drizzle Studio (DB GUI)
```

## Production

```bash
yarn build
yarn preview
```
