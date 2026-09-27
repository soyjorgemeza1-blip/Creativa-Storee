# Creativa Storee

## Supabase setup

1. In the Supabase dashboard, open **SQL Editor** and run `supabase/schema.sql`.
2. In **Authentication → Sign In / Providers**, enable **Phone** and configure an SMS provider. New accounts may need to verify their phone with the code sent by SMS.
3. `src/supabase.js` contains the project URL and publishable key. The publishable key is intended for browser use; never put a `service_role` key in the frontend.

Profiles and active customer sessions are stored in Supabase. Full names are unique, and a new login replaces the previous active session for that account. The previous device checks for replacement every 10 seconds.

Accounts that existed only in browser storage are not migrated. Customers need to register again after Supabase is configured. Product data, cart, favorites, and reviews are still stored locally.