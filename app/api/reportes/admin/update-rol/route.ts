import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId, newRol } = await request.json();

    if (!userId || !newRol) {
      return NextResponse.json(
        { error: "Faltan el ID de usuario o el nuevo rol." },
        { status: 400 }
      );
    }

    // iniciamos el cliente de Supabase con privilegios de administrador
    const supabaseAdmin = createServiceRoleClient();

    // actualizamos el rol del usuario en la tabla 'usuarios'
    const { error } = await supabaseAdmin
      .from("usuarios")
      .update({ rol: newRol })
      .eq("id", userId);

    if (error) {
      console.error("Error de Supabase al actualizar el rol:", error);
      return NextResponse.json(
        { error: `Error de Base de Datos: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Rol de usuario actualizado a ${newRol}`,
    });
  } catch (error) {
    console.error("Error general en la API de actualización de rol:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
