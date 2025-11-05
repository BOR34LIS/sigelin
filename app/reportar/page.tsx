import ReporteComponent from "@/components/reportar/ReporteComponent";
import React from "react";

export const dynamic = "force-dynamic";

// interfaz para los props del componente de página
interface ReportarPageProps {
  searchParams: {
    id?: string | string[];
  };
}

// componente de página principal
export default function ReportarPage({ searchParams }: ReportarPageProps) {
  // se extrae el 'id' de los parámetros de búsqueda
  const pcIdFromUrl = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id;

  // pasa el 'id' como prop al componente de cliente
  return (
    <main>
      <ReporteComponent pcIdFromUrl={pcIdFromUrl} />
    </main>
  );
}
