# Creativa Storee

## Supabase setup

1. In the Supabase dashboard, open **SQL Editor** and run `supabase/schema.sql`.
2. In **Authentication → Sign In / Providers → Email**, enable the Email provider and email confirmations. The default confirmation template sends a link; no custom SMTP or Twilio setup is required for initial testing.
3. In **Authentication → URL Configuration**, set the Site URL and allow-list redirect URL to `https://soyjorgemeza1-blip.github.io/Creativa-Storee/`.
4. Run `supabase/schema.sql` in the SQL Editor to install/update the profile trigger that stores the contact phone from signup metadata.
5. `src/supabase.js` contains the project URL and publishable key. The publishable key is intended for browser use; never put a `service_role` key in the frontend.

Profiles and active customer sessions are stored in Supabase. Full names and contact phone numbers are unique, and a new login replaces the previous active session for that account. The previous device checks for replacement every 10 seconds. Customers sign in with email; the phone number is profile data only.

Accounts that existed only in browser storage are not migrated. Customers need to register again after Supabase is configured. Product data, cart, favorites, and reviews are still stored locally.