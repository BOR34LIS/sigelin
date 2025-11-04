"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import './GestionReportes.css'; // Crearemos este archivo CSS

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Tipos de datos para los tickets
type Ticket = {
  id: number;
  equipo_id: string; // LAB40821
  usuario_reporte_id: string | null; // UUID del usuario que reportó
  titulo_problema: string;
  descripcion_problema: string | null;
  estado: 'Abierto' | 'En diagnóstico' | 'Esperando repuesto' | 'Resuelto' | 'Cerrado';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  created_at: string;
};

// Listas de opciones para los selects
const ESTADOS_PERMITIDOS = ['Abierto', 'En diagnóstico', 'Esperando repuesto', 'Resuelto', 'Cerrado'];
const PRIORIDADES_PERMITIDAS = ['Baja', 'Media', 'Alta', 'Urgente'];

export default function GestionReportesComponent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  
  const [allTickets, setAllTickets] = useState<Ticket[]>([]); // Lista maestra original
  const [ticketChanges, setTicketChanges] = useState<Record<number, {estado?: string, prioridad?: string}>>({}); // Cambios locales
  const [searchTerm, setSearchTerm] = useState(''); // Para buscar por equipo_id

  const filteredTickets = useMemo(() => {
    if (!searchTerm) return allTickets;
    return allTickets.filter(ticket =>
      ticket.equipo_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.titulo_problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.descripcion_problema?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTickets, searchTerm]);

  useEffect(() => {
    async function checkAdminAndFetchTickets() {
      try {
        // 1. Verificar si el usuario es admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.rol !== 'administrador') {
          setError("Acceso Denegado. No tienes permisos de administrador.");
          setLoading(false);
          return;
        }

        // 2. Si es admin, cargar TODOS los tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets_reparacion')
          .select('*')
          .order('created_at', { ascending: false }); // Mostrar los más recientes primero

        if (ticketsError) throw ticketsError;

        setAllTickets(ticketsData || []);
        setTicketChanges({}); // Resetear cambios al cargar
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchTickets();
  }, [router]);

  // Manejar cambios en el estado/prioridad localmente
  const handleTicketChange = (ticketId: number, field: 'estado' | 'prioridad', value: string) => {
    setTicketChanges(prevChanges => ({
      ...prevChanges,
      [ticketId]: {
        ...prevChanges[ticketId],
        [field]: value,
      },
    }));
    setSaveStatus(null);
  };

  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const updatesToPerform: { id: number, estado?: string, prioridad?: string }[] = [];

    // Identificar cambios comparando con el estado original
    for (const ticket of allTickets) {
      const currentChanges = ticketChanges[ticket.id];
      if (currentChanges) {
        let hasChanged = false;
        const update: { id: number, estado?: string, prioridad?: string } = { id: ticket.id };

        if (currentChanges.estado && currentChanges.estado !== ticket.estado) {
          update.estado = currentChanges.estado;
          hasChanged = true;
        }
        if (currentChanges.prioridad && currentChanges.prioridad !== ticket.prioridad) {
          update.prioridad = currentChanges.prioridad;
          hasChanged = true;
        }

        if (hasChanged) {
          updatesToPerform.push(update);
        }
      }
    }

    if (updatesToPerform.length === 0) {
      setSaveStatus({ type: 'success', msg: 'No había cambios que guardar.' });
      setIsSaving(false);
      return;
    }

    try {
      for (const update of updatesToPerform) {
        const { error } = await supabase
          .from('tickets_reparacion')
          .update(update) // Envía solo los campos que cambiaron para este ticket
          .eq('id', update.id);

        if (error) {
          throw error;
        }
      }

      // Éxito: Actualizar la lista "maestra" (allTickets) para reflejar los cambios guardados
      setAllTickets(prevTickets =>
        prevTickets.map(ticket => {
          const changedTicketData = ticketChanges[ticket.id];
          if (changedTicketData) {
            return {
              ...ticket,
              estado: (changedTicketData.estado || ticket.estado) as Ticket['estado'],
              prioridad: (changedTicketData.prioridad || ticket.prioridad) as Ticket['prioridad'],
            };
          }
          return ticket;
        })
      );
      setTicketChanges({}); // Limpiar cambios locales después de guardar
      setSaveStatus({ type: 'success', msg: `¡${updatesToPerform.length} reportes actualizados!` });
    } catch (err: any) {
      setSaveStatus({ type: 'error', msg: `Error al guardar: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return <div className="admin-loader">Verificando acceso y cargando reportes...</div>;
  }

  if (error) {
    return <div className="admin-error-message">{error}</div>;
  }

  return (
    <div className="gestion-container">
      <div className="admin-nav-buttons">
        <button onClick={() => router.push('/admin')} className="admin-nav-btn">
          Volver al Menú
        </button>
      </div>

      <h1 className="gestion-title">Gestionar Reportes</h1>
      
      <input
        type="text"
        placeholder="Buscar por ID de equipo o título de problema..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="save-container">
        <button
          className="admin-save-btn"
          onClick={handleSaveAllChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        {saveStatus && (
          <span className={`save-status ${saveStatus.type}`}>
            {saveStatus.msg}
          </span>
        )}
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th className="admin-th">ID Ticket</th>
            <th className="admin-th">ID Equipo</th>
            <th className="admin-th">Problema</th>
            <th className="admin-th">Descripción</th>
            <th className="admin-th">Estado</th>
            <th className="admin-th">Prioridad</th>
            <th className="admin-th">Fecha Creación</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="admin-td">{ticket.id}</td>
              <td className="admin-td">{ticket.equipo_id}</td>
              <td className="admin-td">{ticket.titulo_problema}</td>
              <td className="admin-td">{ticket.descripcion_problema || 'N/A'}</td>
              <td className="admin-td">
                <select
                  className="status-select"
                  value={ticketChanges[ticket.id]?.estado || ticket.estado}
                  onChange={(e) => handleTicketChange(ticket.id, 'estado', e.target.value)}
                  disabled={isSaving}
                >
                  {ESTADOS_PERMITIDOS.map(estado => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </td>
              <td className="admin-td">
                <select
                  className="priority-select"
                  value={ticketChanges[ticket.id]?.prioridad || ticket.prioridad}
                  onChange={(e) => handleTicketChange(ticket.id, 'prioridad', e.target.value)}
                  disabled={isSaving}
                >
                  {PRIORIDADES_PERMITIDAS.map(prioridad => (
                    <option key={prioridad} value={prioridad}>
                      {prioridad}
                    </option>
                  ))}
                </select>
              </td>
              <td className="admin-td">
                {new Date(ticket.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredTickets.length === 0 && <p className="no-results">No se encontraron reportes.</p>}
    </div>
  );
}