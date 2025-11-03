// lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";

// Se asume que las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
// están definidas en tu archivo .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Es una buena práctica lanzar un error si las claves faltan en producción
  console.error("Missing Supabase environment variables for client.");
}

// Exporta la instancia del cliente para su uso en componentes 'use client'
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);