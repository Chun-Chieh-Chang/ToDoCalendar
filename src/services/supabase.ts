import { createClient } from '@supabase/supabase-js';

// 強制轉型為 string，因為我們已在 vite-env.d.ts 中聲明了這些變數
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing in .env file. Cloud sync will be disabled.');
}

// 建立並導出 Supabase 客戶端實例
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
