# Auth Setup (Supabase)

1. Create a Supabase project.
2. Enable `Email` provider in `Authentication > Providers`.
3. Run SQL in [supabase-schema.sql](./supabase-schema.sql) to create `profiles` table.
4. Create users in Supabase auth and set role using either:
   - `profiles.role` (`coach` or `client`), or
   - user metadata `role` (`coach` or `client`).
5. Copy [auth-config.example.js](./auth-config.example.js) to `auth-config.js` and fill:
   - `supabaseUrl`
   - `supabaseAnonKey`
   - optional `coachAccessCode`

After this:
- Coach login routes to `/coach-portal.html`
- Client login routes to `/client-portal.html`
