# Creativa Storee

## Supabase setup

1. In the Supabase dashboard, open **SQL Editor** and run `supabase/schema.sql`.
2. In **Authentication → Sign In / Providers → Phone**, enable **Phone** and turn off **Enable phone confirmations**. This password-based setup does not send SMS codes.
3. `src/supabase.js` contains the project URL and publishable key. The publishable key is intended for browser use; never put a `service_role` key in the frontend.

Profiles and active customer sessions are stored in Supabase. Full names are unique, and a new login replaces the previous active session for that account. The previous device checks for replacement every 10 seconds. Because phone confirmation is disabled, users can register a number they do not own.

Accounts that existed only in browser storage are not migrated. Customers need to register again after Supabase is configured. Product data, cart, favorites, and reviews are still stored locally.