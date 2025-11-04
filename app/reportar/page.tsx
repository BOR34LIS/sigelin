// app/reportar/page.tsx (Versión CORRECTA)

import ReporteComponent from "@/components/reportar/ReporteComponent";
import React from "react";

// (Opcional pero recomendado) Fuerza a la página a ser dinámica
// Esto ayuda a evitar errores de caché con los searchParams
export const dynamic = 'force-dynamic';

// 1. La página (Componente de Servidor) recibe 'searchParams'
export default function ReportarPage({
  searchParams,
}: {
  searchParams: { id: string | undefined };
}) {

  // 2. Lee el 'id' de los parámetros de la URL
  const pcIdFromUrl = searchParams.id;

  // 3. Pasa el 'id' como prop al componente de cliente
  return (
    <main>
      <ReporteComponent pcIdFromUrl={pcIdFromUrl} />
    </main>
  );
}