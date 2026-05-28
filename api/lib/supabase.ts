import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load local .env variables if present (for local dev)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const supabaseUrl = process.env.SUPABASE_URL;

// Prioritize SUPABASE_SERVICE_ROLE_KEY for backend admin operations to bypass RLS policies
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables! Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel Dashboard.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
