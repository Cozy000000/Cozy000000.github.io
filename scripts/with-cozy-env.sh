#!/usr/bin/env bash
set -euo pipefail

if [[ "${CONDA_DEFAULT_ENV:-}" != "cozy-site" ]]; then
  if command -v conda >/dev/null 2>&1; then
    exec conda run --no-capture-output -n cozy-site bash "$0" "$@"
  fi
  printf 'Activate the environment first: conda activate cozy-site\n' >&2
  exit 1
fi

if [[ ! -x "${CONDA_PREFIX}/bin/node" || ! -x "${CONDA_PREFIX}/bin/npm" ]]; then
  printf 'Install Node in cozy-site: conda env update -n cozy-site -f environment.yml\n' >&2
  exit 1
fi

# IDE/login shells can prepend a system Node even after Conda activation.
export PATH="${CONDA_PREFIX}/bin:${PATH}"
exec "$@"
