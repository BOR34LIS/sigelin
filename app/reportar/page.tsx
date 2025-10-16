// Al usar hooks como useState, necesitamos especificar que este es un Componente de Cliente.
'use client';

// Importamos los hooks necesarios de React. Ya no importamos desde 'next/navigation'.
import React, { useState, useEffect, Suspense } from 'react';

// Componente principal que se renderizará en la ruta /reportar
function ReporteComponent() {
  // Ya no usamos el hook useSearchParams.
  
  // Estados para almacenar la información del reporte y del PC
  const [pcId, setPcId] = useState('');
  const [sala, setSala] = useState('');
  const [computador, setComputador] = useState('');
  
  // Estados para manejar el formulario
  const [tipoProblema, setTipoProblema] = useState('computador');
  const [descripcion, setDescripcion] = useState('');
  
  // Estado para mostrar mensajes al usuario (ej: "Enviando...", "Reporte enviado")
  const [status, setStatus] = useState('');

  // useEffect se ejecuta una vez que el componente se monta en el cliente.
  // Ahora leerá la URL directamente desde el objeto 'window' del navegador.
  useEffect(() => {
    // Usamos las APIs estándar del navegador para obtener los parámetros de la URL.
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');

    if (idFromUrl && idFromUrl.startsWith('LAB') && idFromUrl.length === 8) {
      // Validamos que el ID tenga el formato esperado (LAB + 5 números)
      const salaParsed = idFromUrl.substring(3, 6); // Extrae los caracteres del 3 al 5 (sala)
      const pcParsed = idFromUrl.substring(6, 8);   // Extrae los caracteres del 6 al 7 (PC)

      // Guardamos la información en los estados
      setPcId(idFromUrl);
      setSala(salaParsed);
      setComputador(pcParsed);
    } else {
      // Si no hay ID o el formato es incorrecto, lo indicamos
      setStatus('ID de equipo no válido o no encontrado.');
    }
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez.

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenimos que la página se recargue
    setStatus('Enviando reporte...');

    const reporte = {
      pcId,
      sala,
      computador,
      tipoProblema,
      descripcion,
      fecha: new Date().toISOString(), // Añadimos la fecha actual
      estado: 'abierto' // Estado inicial del reporte
    };
    
    try {
      // Hacemos una llamada a nuestra futura API para guardar el reporte
      const response = await fetch('/api/reportes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reporte),
      });

      if (!response.ok) {
        throw new Error('Falló la respuesta del servidor');
      }

      // Si todo sale bien, mostramos un mensaje de éxito
      const result = await response.json();
      console.log('Reporte enviado:', result);
      setStatus(`¡Reporte para el PC ${computador} de la sala ${sala} enviado con éxito!`);
      // Opcional: Limpiar el formulario
      setDescripcion('');
      setTipoProblema('computador');

    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      setStatus('Error al enviar el reporte. Inténtalo de nuevo.');
    }
  };

  // Si aún no se ha cargado la info del PC, muestra un mensaje
  if (!pcId && !status) {
    return <div className="p-4 text-center">Cargando información del equipo...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Reportar Incidencia</h1>
        
        {/* Mostramos la información del PC extraída de la URL */}
        <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-gray-600">Estás reportando para:</p>
          <p className="text-lg font-semibold text-blue-800">
            Computador: <span className="font-bold">{computador}</span>
          </p>
          <p className="text-lg font-semibold text-blue-800">
            Sala: <span className="font-bold">{sala}</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">ID Completo: {pcId}</p>
        </div>

        {/* Formulario de reporte */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tipo-problema" className="block text-sm font-medium text-gray-700">
              Tipo de Problema
            </label>
            <select
              id="tipo-problema"
              value={tipoProblema}
              onChange={(e) => setTipoProblema(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="computador">Problema con el Computador (CPU)</option>
              <option value="monitor">Problema con el Monitor</option>
              <option value="teclado">Problema con el Teclado</option>
              <option value="mouse">Problema con el Mouse</option>
              <option value="software">Problema de Software / Sistema</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción Adicional (opcional)
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: El mouse no enciende, la pantalla se ve azul..."
            />
          </div>

          <button
            type="submit"
            disabled={!pcId || status.includes('Enviando')}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {status.includes('Enviando') ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </form>

        {/* Mostramos el estado del envío */}
        {status && <p className="mt-4 text-sm text-center text-gray-600">{status}</p>}
      </div>
    </main>
  );
}


// Se mantiene Suspense por si en el futuro se añaden otros componentes que lo necesiten,
// aunque ahora no es estrictamente necesario para leer la URL de esta manera.
export default function ReportarPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ReporteComponent />
        </Suspense>
    )
}

