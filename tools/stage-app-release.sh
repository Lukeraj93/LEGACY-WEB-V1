#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

paths=(
  "account.html"
  "account-shell.js"
  "admin-account-records.js"
  "admin-clients.html"
  "admin-dashboard.html"
  "admin-dashboard.js"
  "admin-financials.html"
  "admin-leads.html"
  "admin-settings.html"
  "assets/coach-availability-calendar.js"
  "assets/planner-guides"
  "assets/training-library/legacy-youtube-library-import-template.csv"
  "auth-config.js"
  "client-dashboard.html"
  "client-dashboard.js"
  "client-packages.html"
  "client-planner.html"
  "client-planner.js"
  "client-profile.html"
  "client-rewards.html"
  "client-schedule.html"
  "client-settings.html"
  "client-waiver.html"
  "client-waiver.js"
  "coach-clients.html"
  "coach-commissions.html"
  "coach-dashboard.html"
  "coach-dashboard.js"
  "coach-health.html"
  "coach-profile.html"
  "coach-programming.html"
  "coach-programming.js"
  "coach-schedule.html"
  "coach-settings.html"
  "coach-training.html"
  "dashboard-auth.js"
  "lib/progress-photo-upload.js"
  "login/client.html"
  "login/coach.html"
  "netlify.toml"
  "netlify/functions"
  "reset-password.html"
  "styles.css"
  "supabase/migrations/20260329125500_nutrition_provider_accounts.sql"
  "supabase/migrations/20260330093000_progress_photo_ai_estimates.sql"
  "tools/admin-live-workflow-verify.mjs"
  "tools/local-coach-training-smoke.mjs"
  "tools/nutrition-photo-smoke.mjs"
  "tools/qa-live-app-smoke.mjs"
  "APP_LIVE_DEPLOY_CHECKLIST.md"
  "APP_LIVE_DEPLOY_SEQUENCE.md"
  "XP coach gamification"
  "XP gamification"
)

existing=()
for path in "${paths[@]}"; do
  if [ -e "$path" ]; then
    existing+=("$path")
  fi
done

if [ "${#existing[@]}" -eq 0 ]; then
  echo "No app release paths found to stage."
  exit 1
fi

git add -- "${existing[@]}"
echo "Staged app release paths:"
printf ' - %s\n' "${existing[@]}"
