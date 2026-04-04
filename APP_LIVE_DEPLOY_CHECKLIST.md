# App Live Deploy Checklist

This is the app-only rollout list for the LEGACY+ client, coach, admin, and XP web app surfaces.

## 1. Commit Required Untracked App Files

These untracked files are referenced by app pages and should be committed before a Git-based deploy:

- `assets/planner-guides/meal-top-guide.svg`
- `assets/planner-guides/meal-angle-guide.svg`
- `assets/planner-guides/meal-detail-guide.svg`
- `assets/planner-guides/progress-front-guide.svg`
- `assets/planner-guides/progress-side-guide.svg`
- `assets/planner-guides/progress-back-guide.svg`
- `assets/planner-guides/progress-detail-guide.svg`
- `assets/training-library/legacy-youtube-library-import-template.csv`
- `lib/progress-photo-upload.js`

## 2. Apply Required App Migrations

These migrations are the app-side database dependencies still sitting untracked locally:

- `supabase/migrations/20260329125500_nutrition_provider_accounts.sql`
- `supabase/migrations/20260330093000_progress_photo_ai_estimates.sql`

Notes:

- `20260329125500_nutrition_provider_accounts.sql` is required for the nutrition provider account flow used by LogMeal-backed meal/photo analysis.
- `20260330093000_progress_photo_ai_estimates.sql` should be applied if the progress-photo AI flow is part of the release.
- `20260401093000_exclude_qa_from_public_coach_directory.sql` is website/public-roster related and is not required for an app-only rollout.

## 3. App Pages To Smoke Test After Deploy

- `/account`
- `/login/client.html`
- `/login/coach.html`
- `/client-dashboard.html`
- `/client-packages.html`
- `/client-planner.html`
- `/client-schedule.html`
- `/client-profile.html`
- `/client-rewards.html`
- `/client-settings.html`
- `/coach-dashboard.html`
- `/coach-clients.html`
- `/coach-schedule.html`
- `/coach-programming.html`
- `/coach-training.html`
- `/coach-health.html`
- `/coach-profile.html`
- `/coach-settings.html`
- `/coach-commissions.html`
- `/admin-dashboard.html`
- `/admin-clients.html`
- `/admin-leads.html`
- `/admin-financials.html`
- `/admin-settings.html`

## 4. App-Specific Validation Focus

- In `client-planner`, confirm the planner guide images load and the progress photo script initializes.
- In `coach-programming`, confirm the import-template download works.
- In nutrition/photo flows, confirm the provider-account table exists before testing any LogMeal path.
- In client, coach, admin, and XP pages, confirm the shared shell, auth bootstrap, and dashboard bundle all load with the normalized `20260402deployready1` asset version.

## 5. Not Part Of The App-Only Release

These are outside the app-only rollout and can be ignored for now:

- public coach pages
- Caleb website card/profile rollout
- public about/facilities photo optimization
- store and store-product website pages
- public sitemap / SEO changes
