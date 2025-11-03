// lib/supabase/server.ts

import { createClient } from '@supabase/supabase-js';

// Función para crear un cliente con permisos de Service Role (ADMIN)
// Este cliente se usa en rutas de servidor donde se necesita ignorar RLS.
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan las variables de entorno para el cliente de Service Role.');
  }

  // Usamos el paquete principal, no @supabase/ssr, y configuramos 'auth' para null
  // y 'global' para que ignore RLS y use la clave de administrador.
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false, // No mantener sesión
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    // Opcional: headers: { 'Authorization': `Bearer ${serviceRoleKey}` } si es necesario
  });
}
