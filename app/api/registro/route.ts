import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// inicializa el cliente de Supabase con privilegios de administrador
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, nombre_completo } = await request.json();

    // Validaciones básicas
    if (!email || !password || !nombre_completo) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // crear el usuario en Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          nombre_completo: nombre_completo,
        },
      });

    if (authError) {
      // Si hay un error al crear el usuario, devolverlo
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        message:
          "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error inesperado:", error);
    return NextResponse.json(
      { message: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
