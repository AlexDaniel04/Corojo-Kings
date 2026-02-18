import { createClient } from '@supabase/supabase-js';

// Usa variables de entorno para mayor seguridad
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Recuerda agregar en tu archivo .env:
// VITE_SUPABASE_URL="https://kynmdcwghausibiskwpx.supabase.co"
// VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bm1kY3dnaGF1c2liaXNrd3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDQzMDIsImV4cCI6MjA4NjkyMDMwMn0.qRXBVntjWXyJiNkTQtkVJCQn-TC0X2635w2VBMaaDvc"
