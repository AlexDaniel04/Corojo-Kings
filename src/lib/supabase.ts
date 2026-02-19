
import { createClient } from '@supabase/supabase-js';

// Permite funcionar tanto en Vite (import.meta.env) como en Node (process.env)
let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} else {
  supabaseUrl = process.env.VITE_SUPABASE_URL;
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno para Supabase');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Recuerda agregar en tu archivo .env:
// VITE_SUPABASE_URL="https://kynmdcwghausibiskwpx.supabase.co"
// VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bm1kY3dnaGF1c2liaXNrd3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDQzMDIsImV4cCI6MjA4NjkyMDMwMn0.qRXBVntjWXyJiNkTQtkVJCQn-TC0X2635w2VBMaaDvc"
