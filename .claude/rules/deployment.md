# 배포 흐름 (CodeDeploy + GitHub Actions)

> **상태 (2026-05 기준)**: 이 문서는 m8-frontend 패턴을 nomacom-frontend 로 포팅한 **target state** 청사진. 실제 배포 자산 (`.github/workflows/`, `appspec.yml`, `deploy/scripts/`, `apps/*/Dockerfile`) 은 **아직 미구축** — weekly A 트랙에서 부트스트랩 중.
> ECR/CodeDeploy app name / DockerHub repo / SSM 경로 등 환경 의존 값은 A-1 audit 결과로 채울 placeholder. 본 문서가 "확정 fact" 가 되려면 A-3 admin dev 배포 1회 성공 후 학습 반영 필요.

```
GitHub push (prod branch)
  ↓
GitHub Actions (path filter로 admin/client 판별)
  ↓
Docker build (시크릿 미포함) → DockerHub or ECR (audit 후 확정)
  ↓
CodeDeploy trigger (per-app application, 같은 repo)
  ↓
EC2: /app/nomacom-frontend에 repo 복사
  ↓
BeforeInstall: deploy/scripts/before_deploy.sh
  → /app/app-name.conf 읽어서 어떤 앱인지 판별
  → 기존 컨테이너 stop/rm
  ↓
AfterInstall: deploy/scripts/after_deploy.sh
  → SSM에서 /nomacom/shared/ + /nomacom/{app}/ 파라미터 fetch
  → .env.production 파일 생성
  → 컨테이너 레지스트리 로그인 (SSM 크레덴셜)
  → docker pull <registry>/{app-name}:prod
  → docker run --env-file .env.production + 헬스체크
```

## app-name.conf

각 EC2 인스턴스에 미리 생성되어 있어야 합니다. 이 파일이 deploy scripts의 분기 기준입니다.

- admin EC2: `/app/app-name.conf` = `nomacom-admin`
- client EC2: `/app/app-name.conf` = `nomacom-client`

## GitHub Actions Path Filter

각 workflow는 해당 앱 경로 + design system 변경 시에만 트리거됩니다:

```yaml
paths:
  - 'apps/admin/**'                    # 또는 apps/client/**
  - 'packages/design-tokens/**'
  - 'packages/design-vue/**'
  - 'package.json'
  - 'yarn.lock'
```

→ design system만 변경해도 admin + client 두 workflow 모두 트리거됨.

> **mobile (`apps/mobile/**`) 은 별도 트리거**: Expo EAS 빌드 / OTA update 경로 — 본 CodeDeploy 파이프라인과 분리. 별도 workflow 필요 (현재 미구축).

## CodeDeploy Applications (target — A 트랙 audit 시 확정)

| CodeDeploy Application | Deployment Group | Docker Image | EC2 |
|---|---|---|---|
| `nomacom-admin` | `prod` | `<registry>/nomacom-admin:prod` | admin EC2 (app-name.conf: `nomacom-admin`) |
| `nomacom-client` | `prod` | `<registry>/nomacom-client:prod` | client EC2 (app-name.conf: `nomacom-client`) |

각 application은 **같은 GitHub repo** (`<org>/nomacom-frontend`) 를 가리키지만, 서로 다른 EC2로 배포됩니다.

**audit 시 확정 필요**:
- `<registry>` = DockerHub vs ECR (m8 는 `overnodes/m8-*` DockerHub)
- `<org>` = nomacom 또는 imjohnkoo 등 — 실 repo URL
- 기존 nomacom-admin / nomacom-client-nuxt3 별도 repo 가 살아있다면 cutover 일정 (weekly A-5)

## 브랜치 전략 (현 시점 미정 → 결정 필요)

**현 상태**: `main` 단독 브랜치. m8-frontend 는 `dev` / `prod` 분리 + `main` (DS publish 트리거).

**선택지** (A 트랙 안정화 후 결정):
- (a) m8 패턴 그대로: `dev` (검증) / `prod` (배포 트리거) / `main` (DS publish)
- (b) 단순화: `main` (DS publish + dev 검증) / `prod` (배포)
- (c) 단일 `main` + tag 기반 배포 (CodeDeploy 가 tag 트리거 지원하면)

본 문서는 (a) 가정으로 작성. (b)/(c) 채택 시 본 문서 + skill 갱신 필요.

## prod push 정책

- prod push는 `nomacomfe-prod-push-check` skill 로 pre-flight 검증 후 수행
- prod push 후 `nomacomfe-finish-branch` skill 이 prod↔dev 동기화 포함
- `.claude/hooks/guard-prod-push.sh` 가 수동 `git push *prod*` 를 차단 (사용자 명시 승인 필요)
