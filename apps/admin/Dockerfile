# syntax=docker/dockerfile:1

# ---- Stage 1: Build ----
FROM node:22 AS builder

RUN corepack enable
RUN corepack prepare yarn@4.5.3 --activate

WORKDIR /app

# Root workspace config
COPY .yarnrc.yml package.json yarn.lock tsconfig.base.json ./

# Package.json for each workspace member (dependency resolution)
COPY packages/design-tokens/package.json ./packages/design-tokens/
COPY packages/design-vue/package.json ./packages/design-vue/
COPY apps/admin/package.json ./apps/admin/

# Install dependencies (skip postinstall hooks until source is copied)
RUN yarn install --mode=skip-build

# Design system source + build
COPY packages/design-tokens/ ./packages/design-tokens/
COPY packages/design-vue/ ./packages/design-vue/
RUN yarn workspace @imjohnkoo/design-tokens run build
RUN yarn workspace @imjohnkoo/design-vue run build

# Admin source + Nuxt prepare + build
COPY apps/admin/ ./apps/admin/
RUN yarn workspace nomacom-admin run postinstall
# Node heap 확장 — Nuxt/Nitro build 가 기본 2GB 초과 가능.
# m8-frontend 2026-04-22 admin 배포 실패 (Ineffective mark-compacts near heap limit) 학습 적용.
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN yarn workspace nomacom-admin run build

# ---- Stage 2: Runtime ----
FROM node:22-slim

WORKDIR /app

# Copy only the production build output
COPY --from=builder /app/apps/admin/.output ./.output
COPY --from=builder /app/apps/admin/package.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
