// app/reportar/page.tsx

import ReporteComponent from "@/components/reportar/ReporteComponent";
import React from "react";

export const dynamic = 'force-dynamic';

// --- ESTA ES LA PARTE A ARREGLAR ---
// 1. Definimos la interfaz correcta para las props de la página
interface ReportarPageProps {
  searchParams: {
    // searchParams puede ser un string, un array de strings, o undefined
    id?: string | string[];
  };
}

// 2. Usamos la nueva interfaz en tu componente
export default function ReportarPage({ searchParams }: ReportarPageProps) {

  // 3. Extraemos el 'id' de forma segura
  //    (Si hay múltiples ?id=, toma el primero. Si no hay, es undefined)
  const pcIdFromUrl = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id;

  // 4. Pasa el 'id' como prop al componente de cliente
  return (
    <main>
      <ReporteComponent pcIdFromUrl={pcIdFromUrl} />
    </main>
  );
}