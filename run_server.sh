#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

# Conda provides Ruby, compiler tools, and the RubyGems environment.
if [[ -z "${CONDA_PREFIX:-}" || ! -x "${CONDA_PREFIX}/bin/ruby" ]]; then
  if command -v conda >/dev/null 2>&1; then
    exec conda run --no-capture-output -n cozy-site bash "$0" "$@"
  fi
  printf 'Activate the environment first: conda activate cozy-site\n' >&2
  exit 1
fi

site_bundle="${CONDA_PREFIX}/bin/bundle"
if ! "$site_bundle" _2.2.19_ --version >/dev/null 2>&1; then
  printf 'Install Bundler in the active environment: gem install bundler -v 2.2.19\n' >&2
  exit 1
fi

"$site_bundle" _2.2.19_ config set --local path vendor/bundle
"$site_bundle" _2.2.19_ check || "$site_bundle" _2.2.19_ install
exec "$site_bundle" _2.2.19_ exec jekyll serve --host 127.0.0.1 --livereload "$@"
