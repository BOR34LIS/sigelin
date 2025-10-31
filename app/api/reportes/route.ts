// app/api/reportes/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Inicializa el cliente (usa tus variables de .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    // 2. Obtener los datos del reporte que envió el formulario
    const reporte = await request.json();

    // 3. Insertar los datos en tu tabla 'tickets_reparacion'
    //    ¡Estos son los campos actualizados!
    const { data, error } = await supabase
      .from('tickets_reparacion') // <-- CAMBIADO: Nombre de tu tabla
      .insert([
        {
          // Columna en Supabase   <-- Dato que viene del formulario
          equipo_id:                reporte.pcId,
          titulo_problema:          reporte.tipoProblema,
          descripcion_problema:     reporte.descripcion,
          estado:                   reporte.estado,
          created_at:             reporte.fecha,
          
          // Omitimos 'sala' y 'computador' del formulario, 
          // ya que 'equipo_id' (ej: LAB40821) contiene esa información.
          
          // Omitimos 'id' (se autogenera)
          // Omitimos 'usuario_reporta_id', 'prioridad', 'fecha_cierre'
          // (se llenarán con NULL o su valor por defecto).
        }
      ])
      .select(); 

    // 4. Manejar un posible error de Supabase
    if (error) {
      console.error('Error de Supabase:', error.message);
      return NextResponse.json({ message: 'Error al crear el reporte', error: error.message }, { status: 500 });
    }

    // 5. Enviar una respuesta de éxito al cliente
    return NextResponse.json({ message: 'Reporte enviado con éxito', data: data }, { status: 201 });

  } catch (e) {
    // Manejar un error inesperado
    console.error('Error en el servidor:', e);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}