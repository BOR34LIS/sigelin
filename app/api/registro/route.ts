// app/api/registro/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Inicializa el cliente admin (esto está perfecto)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, nombre_completo } = await request.json();

    // Validaciones (sin cambios)
    if (!email || !password || !nombre_completo) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // --- PASO 1 (MODIFICADO): Crear el usuario y pasarle la metadata ---
    // El trigger 'handle_new_user' leerá esta metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre_completo: nombre_completo // <-- ¡Aquí le pasamos el dato al trigger!
      }
    });

    if (authError) {
      // Si el trigger falla (ej: el email ya existe), este error lo capturará
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }
    
    // --- PASO 2 (ELIMINADO) ---
    // ¡Ya no necesitamos insertar el perfil manualmente!
    // El trigger 'handle_new_user' (que acabamos de arreglar)
    // se encargará de esto automáticamente.

    // --- ÉXITO ---
    // Si authError es nulo, significa que el usuario se creó Y
    // el trigger se ejecutó exitosamente.
    return NextResponse.json({ message: '¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.' }, { status: 201 });

  } catch (error: any) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ message: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}