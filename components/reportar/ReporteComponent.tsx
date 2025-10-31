// En tu archivo ReporteComponent.tsx

"use client";

import React, { useState, useEffect } from 'react';
// 1. IMPORTAMOS EL HOOK
import { useSearchParams } from 'next/navigation'; 
import './ReporteComponent.css'; 

// 2. YA NO NECESITAMOS LA INTERFAZ DE PROPS

function ReporteComponent() { // <-- Sin props
  
  // 3. LLAMAMOS AL HOOK PARA OBTENER LOS PARÁMETROS
  const searchParams = useSearchParams();
  
  // 4. Extraemos el ID de los parámetros
  const pcIdFromUrl = searchParams.get('id'); // .get('id') en lugar de .id

  // Tus estados (sin cambios)
  const [pcId, setPcId] = useState('');
  const [sala, setSala] = useState('');
  const [computador, setComputador] = useState('');
  
  const [tipoProblema, setTipoProblema] = useState('computador');
  const [descripcion, setDescripcion] = useState('');
  const [status, setStatus] = useState('');

  // 5. El useEffect ahora reacciona a 'pcIdFromUrl' (que viene del hook)
  useEffect(() => {
    
    if (pcIdFromUrl && pcIdFromUrl.startsWith('LAB') && pcIdFromUrl.length === 8) {
      const salaParsed = pcIdFromUrl.substring(3, 6); 
      const pcParsed = pcIdFromUrl.substring(6, 8);   

      setPcId(pcIdFromUrl);
      setSala(salaParsed);
      setComputador(pcParsed);
      setStatus(''); 
    } else {
      setStatus('ID de equipo no válido o no encontrado.');
    }
  }, [pcIdFromUrl]); // El efecto se ejecuta cuando el hook termine de leer la URL

  // ... (El resto de tu código: handleSubmit, y el return JSX ...)
  // ... (No es necesario cambiar nada más en este archivo)

  // Función que se ejecuta al enviar el formulario (sin cambios)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setStatus('Enviando reporte...');
    // ... (resto del fetch sin cambios)
    const reporte = {
      pcId,
      sala,
      computador,
      tipoProblema,
      descripcion,
      fecha: new Date().toISOString(), 
      estado: 'Abierto'
    };
    
    try {
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

      const result = await response.json();
      console.log('Reporte enviado:', result);
      setStatus(`¡Reporte para el PC ${computador} de la sala ${sala} enviado con éxito!`);
      setDescripcion('');
      setTipoProblema('computador');

    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      setStatus('Error al enviar el reporte. Inténtalo de nuevo.');
    }
  };

  // Si aún no se ha cargado la info del PC, muestra un mensaje (sin cambios)
  if (!pcId && !status) {
    // Este mensaje ahora se mostrará si el ID es inválido.
    // El "LoadingFallback" de page.tsx se mostrará ANTES.
    return <div className="loadingMessage">{status || 'Cargando...'}</div>;
  }
  
  // Return JSX (sin cambios)
  return (
    <main className="main">
      <div className="container">
        <h1 className="title">Reportar Incidencia</h1>

        <div className="infoBox">
          <p className="infoLabel">Estás reportando para:</p>
          <p className="infoData">
            Computador: <span className="infoDataHighlight">{computador}</span>
          </p>
          <p className="infoData">
            Sala: <span className="infoDataHighlight">{sala}</span>
          </p>
          <p className="infoId">ID Completo: {pcId}</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div>
            <label htmlFor="tipo-problema" className="label">
              Tipo de Problema
            </label>
            <select
              id="tipo-problema"
              value={tipoProblema}
              onChange={(e) => setTipoProblema(e.target.value)}
              className="input"
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
            <label htmlFor="descripcion" className="label">
              Descripción Adicional (opcional)
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="input"
              placeholder="Ej: El mouse no enciende, la pantalla se ve azul..."
            />
          </div>

          <button
            type="submit"
            disabled={!pcId || status.includes('Enviando')}
            className="submitButton"
          >
            {status.includes('Enviando') ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </form>

        {status && <p className="statusMessage">{status}</p>}
      </div>
    </main>
  );
}

export default ReporteComponent;