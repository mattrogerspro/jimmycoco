#!/bin/sh
# One-time setup: activate the repo's version-controlled git hooks.
# Git does not run hooks from a tracked folder unless you point it there.
#
# Run once from anywhere inside the repo:  sh email/tools/install-hooks.sh

ROOT=$(git rev-parse --show-toplevel) || { echo "not inside a git repo"; exit 1; }
git -C "$ROOT" config core.hooksPath .githooks
chmod +x "$ROOT/.githooks/"* 2>/dev/null || true
echo "Installed: core.hooksPath -> .githooks"
echo "Active hooks:"
ls -1 "$ROOT/.githooks" 2>/dev/null | sed 's/^/  - /'
echo
echo "The pre-push hook will sync Resend on every push when RESEND_API_KEY is set."
echo "Bypass any single push with:  SKIP_RESEND_SYNC=1 git push"
