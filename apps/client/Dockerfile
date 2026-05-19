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
COPY apps/client/package.json ./apps/client/

# Install dependencies (skip postinstall hooks until source is copied)
RUN yarn install --mode=skip-build

# Design system source + build
COPY packages/design-tokens/ ./packages/design-tokens/
COPY packages/design-vue/ ./packages/design-vue/
RUN yarn workspace @imjohnkoo/design-tokens run build
RUN yarn workspace @imjohnkoo/design-vue run build

# Client source + Nuxt prepare + build
COPY apps/client/ ./apps/client/
RUN yarn workspace nomacom-client run postinstall
# Node heap 확장 — Nuxt/Nitro build 가 기본 2GB 초과 가능.
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN yarn workspace nomacom-client run build

# ---- Stage 2: Runtime ----
FROM node:22-slim

WORKDIR /app

# Copy only the production build output
COPY --from=builder /app/apps/client/.output ./.output
COPY --from=builder /app/apps/client/package.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
