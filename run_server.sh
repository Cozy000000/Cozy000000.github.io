#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if [[ ! -d node_modules ]]; then
  printf 'Install dependencies first: bash scripts/with-cozy-env.sh npm ci\n' >&2
  exit 1
fi
exec bash scripts/with-cozy-env.sh npm run dev -- "$@"
