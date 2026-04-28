// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ✅ Supabase Project URL
const SUPABASE_URL = "https://kuifzhkeurpoukkmqqwf.supabase.co";

// ✅ 正確 anon public key（不能有中文）
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWZ6aGtldXJwb3Vra21xcXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzg5NDYsImV4cCI6MjA4NTYxNDk0Nn0.PRKqoWdDw_-EV6pEAyozCysH2ItpKgGAm4udxUHpvwI";

// ✅ 建立 client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      flowType: 'implicit',        // ✅ 修 confirm email（不用 PKCE）
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,    // ✅ 自動讀取 #access_token
    },
  }
);