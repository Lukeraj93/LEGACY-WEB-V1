# QA Credentials Setup

`luke_raj@hotmail.com` is treated as the real production super-admin account.

QA work should use separate coach/client accounts. Do not reuse the production super-admin account for routine smoke tests.

Do not hardcode production credentials inside scripts.

## Required environment variables

### Super-admin tooling

- `LEGACY_SUPER_ADMIN_EMAIL`
  - optional
  - defaults to `luke_raj@hotmail.com`
- `LEGACY_SUPER_ADMIN_PASSWORD`
  - required for any tool that signs in as the real super-admin account

### Demo / QA seeding

- `LEGACY_DEMO_ACCOUNT_PASSWORD`
  - required for `tools/seed-demo-year-one.mjs`
  - used only for seeded coach/client QA accounts

### QA browser/perf scripts

- `QA_CLIENT_EMAIL`
  - optional
- `QA_CLIENT_PASSWORD`
  - required for client-side QA scripts
- `QA_COACH_EMAIL`
  - optional
- `QA_COACH_PASSWORD`
  - required for coach-side QA scripts

### One-off account creation scripts

- `COACH_ACCOUNT_PASSWORD`
  - required for `tools/create-coach-demo-account.mjs`
- `KYLIE_ACCOUNT_PASSWORD`
  - required for `tools/register-kylie-live.mjs`

### Stable QA account provisioning

- `tools/provision-qa-accounts.mjs`
  - creates or updates one dedicated QA coach account and one dedicated QA client account
  - defaults:
    - `qa.coach@legacycoaching.com.my`
    - `qa.client@legacycoaching.com.my`
  - uses `QA_COACH_EMAIL`, `QA_COACH_PASSWORD`, `QA_CLIENT_EMAIL`, and `QA_CLIENT_PASSWORD` when provided
  - otherwise it generates strong passwords at runtime and prints them once

## Example

```bash
export LEGACY_SUPER_ADMIN_EMAIL="luke_raj@hotmail.com"
export LEGACY_SUPER_ADMIN_PASSWORD="your-real-admin-password"
export QA_CLIENT_PASSWORD="your-client-qa-password"
export QA_COACH_PASSWORD="your-coach-qa-password"
```

## Important

- Do not commit real passwords into the repo.
- Keep production admin access separate from QA/demo credentials.
- If the real admin password changes, update your local shell env before running these tools again.
- The app should treat Luke's account as the production admin identity, while QA scripts should keep using dedicated QA coach/client accounts.
