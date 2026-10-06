# Creativa Storee

## Supabase setup

1. In the Supabase dashboard, open **SQL Editor** and run `supabase/schema.sql`.
2. In **Authentication → Sign In / Providers → Email**, enable the Email provider and email confirmations. Keep the default signup and password-recovery link templates; no custom SMTP or Twilio setup is needed for initial testing.
3. In **Authentication → URL Configuration**, set the Site URL and allow-list redirect URL to `https://soyjorgemeza1-blip.github.io/Creativa-Storee/`.
4. Run `supabase/schema.sql` in the SQL Editor to install/update the profile trigger that stores the contact phone from signup metadata.
5. `src/supabase.js` contains the project URL and publishable key. The publishable key is intended for browser use; never put a `service_role` key in the frontend.

Profiles and active customer sessions are stored in Supabase. Full names and provided contact phone numbers are unique; phone is optional. Customers register and sign in with email and password; email links are sent only for initial signup confirmation and the **Forgot password** flow. Each confirmed recovery link opens a password-reset form. A new login replaces the previous active session for that account, and the previous device checks for replacement every 10 seconds.

Accounts that existed only in browser storage are not migrated. Customers need to register again after Supabase is configured. Product data, cart, favorites, and reviews are still stored locally.