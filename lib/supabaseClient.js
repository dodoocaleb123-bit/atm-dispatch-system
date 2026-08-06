import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Automatically strip any trailing slashes ('/') or whitespace
const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);