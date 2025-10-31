// app/reportar/page.tsx

import React, { Suspense } from 'react';
import ReporteComponent from '../../components/reportar/ReporteComponent';

// Componente "Loading..." simple que se mostrará
// mientras ReporteComponent lee la URL.
function LoadingFallback() {
  // Puedes usar tu clase CSS aquí si quieres
  return <div style={{ padding: '2rem', textAlign: 'center' }}>
    Cargando información del equipo...
  </div>;
}

// ESTA PÁGINA YA NO RECIBE searchParams
export default function ReportarPage() {
  
  // Simplemente renderizamos el componente cliente
  // envuelto en un <Suspense>
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReporteComponent />
    </Suspense>
  );
}