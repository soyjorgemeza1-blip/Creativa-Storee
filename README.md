# Creativa Storee

## Supabase setup

1. In the Supabase dashboard, open **SQL Editor** and run `supabase/schema.sql`.
2. In **Authentication → Sign In / Providers → Email**, enable email signups and confirmations. No Twilio setup is needed.
3. In **Authentication → Email Templates → Confirm signup**, use `{{ .Token }}` in the message so Supabase emails a verification code. Re-run `supabase/schema.sql` after changes to update the profile trigger.
4. `src/supabase.js` contains the project URL and publishable key. The publishable key is intended for browser use; never put a `service_role` key in the frontend.

Profiles and active customer sessions are stored in Supabase. Full names and contact phone numbers are unique, and a new login replaces the previous active session for that account. The previous device checks for replacement every 10 seconds. Customers sign in with email; the phone number is profile data only.

Accounts that existed only in browser storage are not migrated. Customers need to register again after Supabase is configured. Product data, cart, favorites, and reviews are still stored locally.