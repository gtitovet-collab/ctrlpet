/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^['"]|['"]$/g, '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please check your environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Export the client if configured with a valid HTTP/HTTPS URL, otherwise null to prevent crashing on startup
const isValidUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (supabaseUrl && !isValidUrl(supabaseUrl)) {
  console.warn(
    'Aviso: A URL do Supabase configurada não parece ser um endereço HTTP/HTTPS válido. Verifique suas variáveis de ambiente.'
  );
}

