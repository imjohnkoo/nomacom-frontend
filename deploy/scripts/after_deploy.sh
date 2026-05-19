#!/bin/bash
set -euo pipefail
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

APP_NAME=$(cat /app/app-name.conf 2>/dev/null || echo "unknown")
echo "After deploy: ${APP_NAME}"

ENV_FILE="/tmp/.env.production"
rm -f "$ENV_FILE"

# SSM 에서 공유 파라미터 fetch — /nomacom/shared/{db,maya,docker,...}
aws ssm get-parameters-by-path \
  --region ap-northeast-2 \
  --path "/nomacom/shared/" \
  --recursive \
  --with-decryption \
  --query 'Parameters[*].[Name,Value]' \
  --output text | while IFS=$'\t' read -r name value; do
    key="${name##*/}"
    echo "${key}=${value}" >> "$ENV_FILE"
  done

# 앱별 SSM 경로에서 추가 파라미터 fetch — /nomacom/{app}/
case "${APP_NAME}" in
  nomacom-admin)
    SSM_APP_PATH="/nomacom/admin/"
    ;;
  nomacom-client)
    SSM_APP_PATH="/nomacom/client/"
    ;;
  *)
    echo "Unknown app: ${APP_NAME}"
    exit 1
    ;;
esac

aws ssm get-parameters-by-path \
  --region ap-northeast-2 \
  --path "${SSM_APP_PATH}" \
  --recursive \
  --with-decryption \
  --query 'Parameters[*].[Name,Value]' \
  --output text | while IFS=$'\t' read -r name value; do
    key="${name##*/}"
    echo "${key}=${value}" >> "$ENV_FILE"
  done

# DockerHub 로그인 (SSM SecureString + --password-stdin 패턴 — PAT 평문 노출 차단)
DOCKER_ID=$(aws ssm get-parameter --region ap-northeast-2 --name "/nomacom/shared/docker/DOCKER_ID" --with-decryption --query 'Parameter.Value' --output text)
DOCKER_PW=$(aws ssm get-parameter --region ap-northeast-2 --name "/nomacom/shared/docker/DOCKER_PW" --with-decryption --query 'Parameter.Value' --output text)
echo "$DOCKER_PW" | docker login -u "$DOCKER_ID" --password-stdin
unset DOCKER_ID DOCKER_PW

docker pull imjohnkoo/"${APP_NAME}":prod

# 앱별 실행 옵션
case "${APP_NAME}" in
  nomacom-admin)
    docker run \
      --publish 3000:3000 \
      --restart always \
      --detach \
      --name "${APP_NAME}" \
      --env-file "$ENV_FILE" \
      --log-driver json-file \
      --log-opt max-size=10m \
      --log-opt max-file=10 \
      --health-cmd="node -e 'process.exit(0)'" \
      --health-interval=10s \
      --health-timeout=5s \
      --health-retries=3 \
      --health-start-period=30s \
      imjohnkoo/"${APP_NAME}":prod
    ;;

  nomacom-client)
    # 깡통 빌드: runtimeConfig 미사용. 도메인 로직 부활 시 NUXT_PUBLIC_ alias 매핑 추가.
    docker run \
      --publish 3000:3000 \
      --restart always \
      --detach \
      --name "${APP_NAME}" \
      --env-file "$ENV_FILE" \
      --log-driver json-file \
      --log-opt max-size=10m \
      --log-opt max-file=10 \
      --health-cmd="node -e 'process.exit(0)'" \
      --health-interval=10s \
      --health-timeout=5s \
      --health-retries=3 \
      --health-start-period=30s \
      imjohnkoo/"${APP_NAME}":prod
    ;;
esac

# 임시 env 파일 삭제
rm -f "$ENV_FILE"

# 헬스체크 대기 (최대 60초)
echo "Waiting for container to become healthy..."
for i in $(seq 1 12); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "${APP_NAME}" 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    echo "Container is healthy!"
    break
  fi
  echo "  Status: $STATUS (attempt $i/12)"
  sleep 5
done
