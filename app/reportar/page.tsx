// Al usar hooks como useState, necesitamos especificar que este es un Componente de Cliente.
'use client';
import { Suspense } from 'react';
import ReporteComponent from '../../components/reportar/ReporteComponent';
// Se mantiene Suspense por si en el futuro se añaden otros componentes que lo necesiten,
// aunque ahora no es estrictamente necesario para leer la URL de esta manera.
export default function ReportarPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ReporteComponent />
        </Suspense>
    )
}

