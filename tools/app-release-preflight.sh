#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[1/6] Function syntax"
npm run check:functions

echo "[2/6] Client XP tests"
npm run test:xp-client

echo "[3/6] Coach XP tests"
npm run test:xp-coach

echo "[4/6] Planner tests"
npm run test:planner

if [ -n "${APP_BASE_URL:-}" ] && [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_PUBLISHABLE_KEY:-}" ]; then
  if [ -n "${QA_CLIENT_PASSWORD:-}" ] && [ -n "${QA_COACH_PASSWORD:-}" ]; then
    echo "[5/6] App smoke"
    node tools/qa-live-app-smoke.mjs
  else
    echo "[5/6] App smoke skipped (QA_CLIENT_PASSWORD / QA_COACH_PASSWORD not set)"
  fi

  if [ -n "${EXISTING_CLIENT_EMAIL:-}" ] && [ -n "${EXISTING_CLIENT_PASSWORD:-}" ] && [ -n "${EXISTING_COACH_EMAIL:-}" ] && [ -n "${EXISTING_COACH_PASSWORD:-}" ]; then
    echo "[6/6] Nutrition photo smoke"
    node tools/nutrition-photo-smoke.mjs
  else
    echo "[6/6] Nutrition photo smoke skipped (existing client/coach env not set)"
  fi
else
  echo "[5/6] App smoke skipped (APP_BASE_URL / SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY not set)"
  echo "[6/6] Nutrition photo smoke skipped (app env not set)"
fi

echo "App release preflight completed."
