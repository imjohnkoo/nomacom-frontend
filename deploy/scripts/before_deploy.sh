#!/bin/bash
set -euo pipefail

APP_NAME=$(cat /app/app-name.conf 2>/dev/null || echo "unknown")
echo "Before deploy: ${APP_NAME}"

if [ "$(docker ps -aq -f name="${APP_NAME}")" ]; then
  docker stop "${APP_NAME}" || true
  docker rm "${APP_NAME}" || true
fi

if [[ "$(docker images -q imjohnkoo/"${APP_NAME}":prod 2>/dev/null)" != "" ]]; then
  docker rmi -f imjohnkoo/"${APP_NAME}":prod || true
fi
