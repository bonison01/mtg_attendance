// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bgynkcndhkazptfxsezh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneW5rY25kaGthenB0ZnhzZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NTUwMjIsImV4cCI6MjA1NjIzMTAyMn0.HlE14fwaziu5mO37qs9KJB4LyC3WOr4SUizPBgFTFTE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);