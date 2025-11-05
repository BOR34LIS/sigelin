import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // se obtienen los datos del reporte
    const reporte = await request.json();

    const { data, error } = await supabase
      .from("tickets_reparacion")
      .insert([
        {
          equipo_id: reporte.pcId,
          titulo_problema: reporte.tipoProblema,
          descripcion_problema: reporte.descripcion,
          estado: reporte.estado,
          created_at: reporte.fecha,
          usuario_reporta_id: reporte.usuario_reporta_id,
        },
      ])
      .select();

    // Manejar errores de Supabase
    if (error) {
      console.error("Error de Supabase:", error.message);
      return NextResponse.json(
        { message: "Error al actualizar el reporte", error: error.message },
        { status: 500 }
      );
    }

    // mensaje de exito
    return NextResponse.json(
      { message: "Reporte actualizado con éxito", data: data },
      { status: 201 }
    );
  } catch (e) {
    // manejo de errores general
    console.error("Error en el servidor:", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
