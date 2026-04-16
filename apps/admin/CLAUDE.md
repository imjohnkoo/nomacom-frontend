# CLAUDE.md

## Project Overview

Nomacom Admin Dashboard — Nuxt 4 기반 관리자 대시보드.

## Tech Stack

- Nuxt 4 (Vue 3, Nitro server)
- Drizzle ORM + PostgreSQL (postgres.js driver)
- @imjohnkoo/design-vue, @imjohnkoo/design-tokens (GitHub Packages)
- Yarn 4 (Berry, node-modules linker)

## Project Structure

```
app/              # Nuxt app directory (pages, layouts, components)
server/
  api/            # Nitro API routes (file-based: *.get.ts, *.post.ts)
  database/
    schema.ts     # Drizzle schema definitions
    index.ts      # DB connection instance
    migrations/   # Drizzle generated migrations
drizzle.config.ts # Drizzle Kit configuration
```

## Key Commands

- `yarn dev` — dev server
- `yarn build` — production build
- `yarn db:generate` — generate migrations from schema changes
- `yarn db:migrate` — apply migrations
- `yarn db:studio` — open Drizzle Studio

## Conventions

- API routes follow Nuxt file-based routing: `server/api/{resource}.{method}.ts`
- DB schema changes go in `server/database/schema.ts`, then run `yarn db:generate`
- Design system packages are scoped under `@imjohnkoo` and hosted on GitHub Packages
- Environment variables: `DATABASE_URL`, `NOMACOM_PACKAGES_TOKEN`
