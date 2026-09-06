import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  "https://kcnpjxtzxtsyymtfxbqz.supabase.co";

const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_API_KEY || 
  "";

// Cliente para uso en el navegador
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Cliente para uso en servidor (API routes)
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

export default supabase;
