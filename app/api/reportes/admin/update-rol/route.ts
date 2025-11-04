// app/api/admin/update-rol/route.ts

import { NextResponse } from 'next/server';
// Importamos la función 'createServiceRoleClient' que usa la Service Role Key
import { createServiceRoleClient } from '@/lib/supabase/server'; 

export async function POST(request: Request) {
  // Esta ruta debe ser protegida con un middleware que valide el rol 'Administrador'
  // antes de que la solicitud llegue aquí.

  try {
    const { userId, newRol } = await request.json();

    if (!userId || !newRol) {
      return NextResponse.json({ error: 'Faltan el ID de usuario o el nuevo rol.' }, { status: 400 });
    }

    // 1. Inicializar el cliente con la Service Role Key (Permisos de Admin en DB)
    const supabaseAdmin = createServiceRoleClient(); // <--- Uso de la función corregida

    // 2. Ejecutar la actualización en la tabla 'usuarios'
    // La Service Role Key permite esta operación sin ser bloqueada por RLS.
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ rol: newRol })
      .eq('id', userId); 

    if (error) {
      console.error('Error de Supabase al actualizar el rol:', error);
      return NextResponse.json({ error: `Error de Base de Datos: ${error.message}` }, { status: 500 });
    }

    // Opcional: Si usas Custom Claims (JWT), también deberías actualizar el claim del usuario aquí.

    return NextResponse.json({ success: true, message: `Rol de usuario actualizado a ${newRol}` });

  } catch (error) {
    console.error('Error general en la API de actualización de rol:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}