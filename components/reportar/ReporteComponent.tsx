// components/reportar/ReporteComponent.tsx

"use client";

import React, { useState, useEffect } from 'react';
import './ReporteComponent.css'; 
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation'; // <-- 1. IMPORTAR useRouter


interface ReporteComponentProps {
  pcIdFromUrl: string | undefined;
}

function ReporteComponent({ pcIdFromUrl }: ReporteComponentProps) {
  
  const router = useRouter(); // <-- 2. INICIALIZAR ROUTER
  
  const [pcId, setPcId] = useState('');
  const [sala, setSala] = useState('');
  const [computador, setComputador] = useState('');
  
  const [tipoProblema, setTipoProblema] = useState('computador');
  const [descripcion, setDescripcion] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (Tu lógica de checkAuthAndLoadData sigue igual) ...
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus('Acceso Denegado. Debes iniciar sesión para poder reportar.');
        setLoading(false);
        // Opcional: Redirigir al login si no está autenticado
        router.push('/login'); 
        return;
      }

      const cleanedPcId = pcIdFromUrl ? pcIdFromUrl.trim().toUpperCase() : '';

      if (cleanedPcId.startsWith('LAB') && cleanedPcId.length === 8) {
        const salaParsed = cleanedPcId.substring(3, 6);
        const pcParsed = cleanedPcId.substring(6, 8);

        setPcId(cleanedPcId);
        setSala(salaParsed);
        setComputador(pcParsed);
        setStatus('');
      } else {
        setStatus('ID de equipo no válido o no encontrado.');
      }
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [pcIdFromUrl, router]); // <-- 4. AÑADIR router A LAS DEPENDENCIAS

  // ... (Tu función handleSubmit sigue igual) ...
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setStatus('Enviando reporte...');

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


  // --- 3. NUEVA FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error.message);
      } else {
        // Redirigir al login después de cerrar sesión
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Error inesperado:', err.message);
    }
  };

  // ... (Tu lógica de 'if (loading)' y 'if (!pcId)' sigue igual) ...
  if (loading) {
    return <div className="loadingMessage">Verificando...</div>;
  }

  if (!pcId && status) {
    return <div className="loadingMessage">{status}</div>;
  }
  
  if (!pcId) {
      return <div className="loadingMessage">ID de equipo no válido.</div>;
  }


  return (
    <main className="main">
      
      {/* --- 5. BOTÓN DE CERRAR SESIÓN AÑADIDO --- */}
      <button onClick={handleLogout} className="logoutButton">
        Cerrar Sesión
      </button>

      <div className="container">
        <h1 className="title">Reportar Incidencia</h1>
        {/* ... (el resto de tu formulario JSX) ... */}

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
          {/* ... (tus inputs y selects) ... */}
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