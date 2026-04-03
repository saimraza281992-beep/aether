import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our Supabase database
export type DreamNode = {
  id: string;
  created_at: string;
  symbols: string[];
  emotions: string[];
  location: string; // e.g., 'Lahore', 'Global'
  x: number;
  y: number;
  color: string;
  snippet: string; // Anonymous short snippet
};
