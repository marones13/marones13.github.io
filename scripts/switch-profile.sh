#!/usr/bin/env bash
# Swap the live site file: copies a profile HTML over index.html.
#
# Usage (from repo root):
#   ./scripts/switch-profile.sh baseline.html
#   ./scripts/switch-profile.sh my-opportunity.html
#
# Before overwriting, the current index.html is saved to profiles/.last-index.html
# (gitignored). List candidates: ls profiles/*.html

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROFILES="$ROOT/profiles"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <profile-file>"
  echo "  Files in $PROFILES:"
  ls -1 "$PROFILES"/*.html 2>/dev/null || echo "  (none yet)"
  exit 1
fi

NAME="$1"
# Allow "baseline" or "baseline.html"
[[ "$NAME" == *.html ]] || NAME="${NAME}.html"

SRC="$PROFILES/$NAME"
if [[ ! -f "$SRC" ]]; then
  echo "Not found: $SRC"
  exit 1
fi

cp "$ROOT/index.html" "$PROFILES/.last-index.html"
cp "$SRC" "$ROOT/index.html"
echo "OK: index.html is now from profiles/$NAME"
echo "     Previous index saved as profiles/.last-index.html (restore with this script if needed)"
