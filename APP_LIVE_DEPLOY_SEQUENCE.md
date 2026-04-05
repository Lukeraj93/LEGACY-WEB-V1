# App Live Deploy Sequence

This is the exact app-only release flow from the current local project state.

## 1. Run local preflight

Use the local app stack first.

```bash
cd "/Users/lukelango/Desktop/Codex Project"

APP_BASE_URL="http://127.0.0.1:8888" \
SUPABASE_URL="http://127.0.0.1:54321" \
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..." \
QA_CLIENT_EMAIL="client.local@legacy.local" \
QA_CLIENT_PASSWORD="LegacyLocal!123" \
QA_COACH_EMAIL="coach.local@legacy.local" \
QA_COACH_PASSWORD="LegacyLocal!123" \
EXISTING_CLIENT_EMAIL="client.local@legacy.local" \
EXISTING_CLIENT_PASSWORD="LegacyLocal!123" \
EXISTING_COACH_EMAIL="coach.local@legacy.local" \
EXISTING_COACH_PASSWORD="LegacyLocal!123" \
./tools/app-release-preflight.sh
```

## 2. Stage the app-only release set

This stages app pages, shared app shell files, app functions, app assets, app migrations, and the updated smoke scripts.

```bash
cd "/Users/lukelango/Desktop/Codex Project"
./tools/stage-app-release.sh
git diff --cached --name-only
```

Review the staged set before commit. It should exclude website-only files such as public blog pages, public coach pages, store pages, and public image-gallery work.

## 3. Commit the app release

```bash
cd "/Users/lukelango/Desktop/Codex Project"
git commit -m "Prepare app release and stabilize planner flows"
```

## 4. Apply the app database migrations to the linked remote project

The app-side release currently depends on:

- `supabase/migrations/20260329125500_nutrition_provider_accounts.sql`
- `supabase/migrations/20260330093000_progress_photo_ai_estimates.sql`

Run:

```bash
cd "/Users/lukelango/Desktop/Codex Project"
npx supabase db push --linked --include-all
```

If you want to inspect first:

```bash
cd "/Users/lukelango/Desktop/Codex Project"
npx supabase migration list --linked
```

## 5. Push the branch

```bash
cd "/Users/lukelango/Desktop/Codex Project"
git push -u origin HEAD
```

## 6. Trigger the app deploy

This repo is already linked to Netlify project `silly-paletas-b48eff`.

Preview deploy:

```bash
cd "/Users/lukelango/Desktop/Codex Project"
npx netlify deploy --build
```

Production deploy:

```bash
cd "/Users/lukelango/Desktop/Codex Project"
npx netlify deploy --build --prod
```

## 7. Run the post-deploy app smoke

Swap in the live app URL and live QA credentials:

```bash
cd "/Users/lukelango/Desktop/Codex Project"

APP_BASE_URL="https://app.legacycoaching.com.my" \
SUPABASE_URL="https://ejitroflboctigjubyvm.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..." \
QA_CLIENT_EMAIL="qa.client@legacycoaching.com.my" \
QA_CLIENT_PASSWORD="..." \
QA_COACH_EMAIL="qa.coach@legacycoaching.com.my" \
QA_COACH_PASSWORD="..." \
node tools/qa-live-app-smoke.mjs
```

For the nutrition photo path:

```bash
cd "/Users/lukelango/Desktop/Codex Project"

APP_BASE_URL="https://app.legacycoaching.com.my" \
SUPABASE_URL="https://ejitroflboctigjubyvm.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..." \
EXISTING_CLIENT_EMAIL="qa.client@legacycoaching.com.my" \
EXISTING_CLIENT_PASSWORD="..." \
EXISTING_COACH_EMAIL="qa.coach@legacycoaching.com.my" \
EXISTING_COACH_PASSWORD="..." \
node tools/nutrition-photo-smoke.mjs
```

## 8. Release gates

Do not call the app release done until all of these are true:

- `./tools/app-release-preflight.sh` passes locally
- the two app migrations are applied remotely
- Netlify deploy succeeds
- `tools/qa-live-app-smoke.mjs` passes against the live app
- `tools/nutrition-photo-smoke.mjs` passes against the live app if nutrition-photo flow is part of the release
