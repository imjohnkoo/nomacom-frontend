# Claude Code 보조 자산 카탈로그

`.claude/` 디렉토리에 프로젝트 전용 Claude Code 보조 자산을 둡니다. 새 세션 시작 시 자동 로드됩니다.

## 구조

```
.claude/
├── agents/        # 특정 task에 특화된 sub-agent
├── commands/      # /command 형태로 호출하는 wrapper
├── skills/        # model-invoked, 자동 트리거되는 도메인 가이드
├── hooks/         # PostToolUse / PreToolUse 셸 훅
├── rules/         # CLAUDE.md 에서 참조하는 도메인 rules (monorepo 공유)
├── scripts/       # 운영 스크립트
├── settings.json        # 팀 공유 권한/hook 등록/attribution
└── settings.local.json  # 개인 설정 (Notion MCP 등)
```

앱별 rules는 필요 시 `apps/<name>/.claude/rules/` 에 분리 가능.

## Hooks

- **PostToolUse (Edit|Write|MultiEdit)** → `.claude/hooks/format-on-edit.sh` — prettier 자동 포맷 (.vue, .ts, .tsx, .js, .jsx, .json, .md, .yml, .yaml, .css)
- **PreToolUse (Bash)** → `.claude/hooks/guard-prod-push.sh` — prod/main push, force push, `docker push`, `git reset --hard`, `aws ssm put|delete` 차단

## Skills 카탈로그

| 스킬 | 출처 | 목적 |
|---|---|---|
| `ask-questions-if-underspecified` | m8-backend 이식 | 요구사항 모호 시 질문 |
| `dispatching-parallel-agents` | m8-backend 이식 | 독립 task들을 sub-agent에 병렬 위임 |
| `systematic-debugging` | m8-backend 이식 | root cause 우선 디버깅 |
| `verification-before-completion` | m8-backend 이식 | "완료" 선언 전 빌드/테스트 증거 강제 |
| `vue` | onmax/nuxt-skills@00fb59d | Vue 3 Composition API, defineModel, composables |
| `nuxt` | onmax/nuxt-skills@00fb59d | Nuxt 4+ server routes, middleware, runtime config |
| `vite` | onmax/nuxt-skills@00fb59d | Vite config, plugins, library mode (DS 빌드용) |
| `vitest` | onmax/nuxt-skills@00fb59d | Vitest 테스트 패턴, mocking, coverage |
| `vueuse` | onmax/nuxt-skills@00fb59d | VueUse composables 카탈로그 (268개) |
| `ts-library` | onmax/nuxt-skills@00fb59d | TS library publishing (`@imjohnkoo/design-*` 작업용) |

## Vendoring 정책 (외부 출처)

`onmax/nuxt-skills`에서 가져온 6개 스킬은 **frontmatter에 `source: onmax/nuxt-skills@<sha>` + `vendored_at: <date>`**로 출처를 추적합니다. 자동 업데이트는 차단 — supply chain 리스크 방지.

- 갱신 확인: `.claude/scripts/sync-nuxt-skills.sh` (upstream과 diff만 출력, 자동 머지 없음)
- 권장 주기: 분기 1회 + Nuxt/Vue major 릴리스 시
- 갱신 절차: 스크립트로 diff 확인 → 변경사항 수동 리뷰 → 재 vendoring → SHA/날짜 갱신

## 포팅 진행 상황

- ✅ `rules/deployment.md` — CodeDeploy + GitHub Actions 배포 흐름 (A 트랙)
- ✅ `rules/ssm-paths.md` — AWS SSM Parameter Store 경로 (A-2c)
- ✅ `skills/nomacomfe-finish-branch`, `skills/nomacomfe-prod-push-check` — branch/prod push 자동화 (A 트랙 완료 후 본격 의미)
- 🟡 `rules/design-system-publish.md` — GitHub Packages publish 파이프라인 (C-1 = (b) 결정 2026-05-21 → C-2 포팅 중)
- ❌ `rules/notion-workflow.md` — nomacom 개발 워크플로우는 Notion 비사용으로 미포팅 결정
