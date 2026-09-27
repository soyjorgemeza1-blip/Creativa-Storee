import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://jjxeiuswuirlujxdosuv.supabase.co",
  "sb_publishable_L6SGbp9Zi2qDGZIl4_1T4g_WzerEG0d",
  {
    auth: {
      storage: window.sessionStorage,
      storageKey: "creativa-supabase-auth",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);