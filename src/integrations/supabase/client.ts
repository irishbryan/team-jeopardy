import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Local development (script/server) injects VITE_SUPABASE_URL and
// VITE_SUPABASE_PUBLISHABLE_KEY pointing at the local Supabase stack.
// The hosted project remains the fallback when they are not set.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://uwcmnaswnlxyxytxlntr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Y21uYXN3bmx4eXh5dHhsbnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzUyODgsImV4cCI6MjA3NDA1MTI4OH0.QRU8cCckNAKw9hquLIPV9LXAtRqS0X-jhAIfek0qfI0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});