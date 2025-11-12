"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./equiposComponent.css";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaPlusCircle } from "react-icons/fa";

// --- Definición de Tipos ---
type Equipo = {
  id: string;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string; // Este es el que vamos a editar
  ubicacion_id: number;
};
type Ubicacion = {
  id: number;
  piso: string;
  tipo_sala: string;
};

// --- Datos Prefabricados (Formulario) ---
// ... (El objeto PREFAB_DATA y TIPOS_DE_EQUIPO no cambian) ...
const PREFAB_DATA: Record<string, { marca: string; modelo: string }[]> = {
  'Torre': [
    { marca: 'Dell', modelo: 'Dell Optiplex 3070' },
    { marca: 'HP', modelo: 'HP ProDesk 400 G5' },
    { marca: 'Lenovo', modelo: 'Lenovo ThinkCentre M720' },
  ],
  'All-in-One': [
    { marca: 'HP', modelo: 'HP All-in-One 22' },
    { marca: 'Lenovo', modelo: 'Lenovo IdeaCentre AIO 3' },
  ],
  'Notebook': [
    { marca: 'HP', modelo: 'HP Pavilion 15' },
    { marca: 'Dell', modelo: 'Dell Latitude 5400' },
    { marca: 'Lenovo', modelo: 'Lenovo ThinkPad E14' },
  ],
  'Tablet': [
    { marca: 'Samsung', modelo: 'Samsung Galaxy Tab A7' },
    { marca: 'Lenovo', modelo: 'Lenovo Tab M10' },
  ],
  'iPad': [
    { marca: 'Apple', modelo: 'iPad 9ª generación' },
    { marca: 'Apple', modelo: 'iPad Air 4' },
  ]
};
const TIPOS_DE_EQUIPO = Object.keys(PREFAB_DATA);

// --- Lista de Estados Permitidos (de tu solicitud) ---
const ESTADOS_PERMITIDOS = ['Activo', 'En reparación', 'Dado de baja'];

// --- Sub-componente del Formulario de Alta (Sin Cambios) ---
interface AddFormProps {
  ubicaciones: Ubicacion[];
  onAdd: (newEquipo: Equipo) => void;
  onCancel: () => void;
}
const AddEquipoForm: React.FC<AddFormProps> = ({ ubicaciones, onAdd, onCancel }) => {
  // ... (El código de AddEquipoForm de la respuesta anterior va aquí, sin cambios) ...
  const [numeroEquipo, setNumeroEquipo] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [ubicacionId, setUbicacionId] = useState(ubicaciones[0]?.id || '');
  const [estado, setEstado] = useState('Activo');
  const [tipoEquipo, setTipoEquipo] = useState(TIPOS_DE_EQUIPO[0]);
  const [modelosDisponibles, setModelosDisponibles] = useState(PREFAB_DATA[TIPOS_DE_EQUIPO[0]]);
  const [selectedModelo, setSelectedModelo] = useState(PREFAB_DATA[TIPOS_DE_EQUIPO[0]][0].modelo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const modelos = PREFAB_DATA[tipoEquipo];
    setModelosDisponibles(modelos);
    setSelectedModelo(modelos[0].modelo);
  }, [tipoEquipo]);

  useEffect(() => {
    const selectedUbicacion = ubicaciones.find(u => u.id === Number(ubicacionId));
    if (selectedUbicacion && numeroEquipo) {
      const numeroFormateado = numeroEquipo.padStart(2, '0');
      const newId = `${selectedUbicacion.tipo_sala}${selectedUbicacion.id}${numeroFormateado}`;
      setGeneratedId(newId.toUpperCase());
    } else {
      setGeneratedId('');
    }
  }, [ubicacionId, numeroEquipo, ubicaciones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!generatedId) {
      setError("Faltan datos para generar el ID (revisa la sala y el número).");
      setLoading(false);
      return;
    }
    try {
      const marca = modelosDisponibles.find(m => m.modelo === selectedModelo)?.marca || '';
      const { data, error: insertError } = await supabase
        .from('equipos')
        .insert({
          id: generatedId,
          tipo_equipo: tipoEquipo,
          marca: marca,
          modelo: selectedModelo,
          numero_serie: numeroSerie.toUpperCase(),
          estado: estado,
          ubicacion_id: Number(ubicacionId),
        })
        .select()
        .single();
      if (insertError) {
        if (insertError.message.includes('unique constraint')) {
          throw new Error(`Error: El ID de equipo '${generatedId}' o el N° de Serie ya existen.`);
        }
        throw insertError;
      }
      onAdd(data as Equipo);
      onCancel();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form-container">
      <h2>Añadir Nuevo Equipo</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-row">
          <div className="form-group">
            <label>Ubicación (Sala)</label>
            <select
              className="add-form-input"
              value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} required
            >
              <option value="" disabled>Selecciona una sala</option>
              {ubicaciones.map(u => (
                <option key={u.id} value={u.id}>
                  ID: {u.id} (Piso: {u.piso}, Tipo: {u.tipo_sala})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Número de Equipo</label>
            <input
              type="number" className="add-form-input"
              value={numeroEquipo} onChange={(e) => setNumeroEquipo(e.target.value)}
              placeholder="Ej: 32" required min="1"
            />
          </div>
          <div className="form-group">
            <label>ID de Equipo (Generado)</label>
            <input
              type="text" className="add-form-input"
              value={generatedId}
              disabled
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Número de Serie</label>
            <input
              type="text" className="add-form-input"
              value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)}
              placeholder="SN-XXX" required
            />
          </div>
          <div className="form-group">
            <label>Tipo de Equipo</label>
            <select
              className="add-form-input"
              value={tipoEquipo} onChange={(e) => setTipoEquipo(e.target.value)}
            >
              {TIPOS_DE_EQUIPO.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Modelo (y Marca)</label>
            <select
              className="add-form-input"
              value={selectedModelo} onChange={(e) => setSelectedModelo(e.target.value)}
            >
              {modelosDisponibles.map(item => (
                <option key={item.modelo} value={item.modelo}>
                  {item.marca} - {item.modelo}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
           <div className="form-group">
            <label>Estado Inicial</label>
            <select
              className="add-form-input"
              value={estado} onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADOS_PERMITIDOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group form-buttons-container">
            {error && <p className="form-error">{error}</p>}
            <div className="form-buttons">
              <button type="button" className="add-form-btn cancel" onClick={onCancel}>Cancelar</button>
              <button type="submit" className="add-form-btn save" disabled={loading || !generatedId}>
                {loading ? 'Guardando...' : 'Guardar Equipo'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
// --- Fin del Sub-componente Formulario ---


// --- Componente Principal (Actualizado) ---
export default function GestionEquiposComponent() {
  const router = useRouter();
  const [equipos, setEquipos] = useState<Equipo[]>([]); // Lista maestra
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // --- NUEVOS ESTADOS PARA EDICIÓN ---
  const [editedEstados, setEditedEstados] = useState<Record<string, string>>({}); // { "LAB40801": "En reparación" }
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  useEffect(() => {
    async function checkAdminAndFetchData() {
      try {
        setLoading(true);
        setError(null);
        // 1. Verificar Admin (sin cambios)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { throw new Error("No has iniciado sesión."); }
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        if (profileError || profile?.rol !== 'administrador') {
          throw new Error("Acceso Denegado. Esta página es solo para administradores.");
        }
        
        // 2. Cargar datos (sin cambios)
        const [ubicacionesRes, equiposRes] = await Promise.all([
          supabase.from('ubicaciones').select('id, piso, tipo_sala'),
          supabase.from('equipos').select('*').order('id', { ascending: true })
        ]);

        if (ubicacionesRes.error) throw ubicacionesRes.error;
        if (equiposRes.error) throw equiposRes.error;

        const equiposData = equiposRes.data || [];
        setUbicaciones(ubicacionesRes.data || []);
        setEquipos(equiposData);

        // --- NUEVO: Inicializar el estado de 'editedEstados' ---
        const initialEstados: Record<string, string> = {};
        for (const eq of equiposData) {
          initialEstados[eq.id] = eq.estado;
        }
        setEditedEstados(initialEstados);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndFetchData();
  }, []);

  // --- NUEVO: Handler para cambiar el estado local ---
  const handleEstadoChange = (equipoId: string, newEstado: string) => {
    setEditedEstados(prev => ({ ...prev, [equipoId]: newEstado }));
    setSaveStatus(null); // Borrar mensajes de guardado
  };

  // --- NUEVO: Handler para guardar todos los cambios ---
  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    // 1. Encontrar qué estados realmente cambiaron
    const updates: { id: string, estado: string }[] = [];
    for (const eq of equipos) {
      const originalEstado = eq.estado;
      const newEstado = editedEstados[eq.id];
      if (originalEstado !== newEstado) {
        updates.push({ id: eq.id, estado: newEstado });
      }
    }

    if (updates.length === 0) {
      setSaveStatus({ type: 'success', msg: 'No había cambios que guardar.' });
      setIsSaving(false);
      return;
    }

    // 2. Enviar los cambios como updates individuales (más seguro para RLS)
    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('equipos')
          .update({ estado: update.estado }) // Solo actualiza el estado
          .eq('id', update.id);
        if (error) throw error;
      }

      // 3. Éxito: Actualizar la lista "maestra" (equipos)
      setEquipos(prevEquipos =>
        prevEquipos.map(eq => ({
          ...eq,
          estado: editedEstados[eq.id] || eq.estado,
        }))
      );
      
      setSaveStatus({ type: 'success', msg: '¡Estados guardados con éxito!' });
    } catch (err: any) {
      setSaveStatus({ type: 'error', msg: `Error al guardar: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Actualizado: handleEquipoAdded ---
  const handleEquipoAdded = (newEquipo: Equipo) => {
    // Añadir a la lista maestra
    setEquipos(currentList => 
      [...currentList, newEquipo].sort((a, b) => a.id.localeCompare(b.id))
    );
    // Añadir al estado de edición
    setEditedEstados(prev => ({ ...prev, [newEquipo.id]: newEquipo.estado }));
  };
  
  const handleGoToMenu = () => router.push('/admin');

  // --- Renderizado (con estados de carga/error) ---
  if (loading) {
    return <div className="admin-loader">Verificando acceso y cargando datos...</div>;
  }
  if (error) {
    return <div className="admin-error-message">{error}</div>;
  }
  if (ubicaciones.length === 0 && !showAddForm) {
    return (
      <div className="admin-error-message">
        Error: No se encontraron ubicaciones. Por favor, añade una ubicación antes de añadir un equipo.
        <button onClick={handleGoToMenu} className="admin-nav-btn" style={{marginTop: '1rem'}}>
          Volver al Menú
        </button>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      
      <div className="admin-nav-buttons">
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="add-new-btn">
            <FaPlusCircle /> Añadir Equipo
          </button>
        )}
        <button onClick={handleGoToMenu} className="admin-nav-btn">
          Volver al Menú
        </button>
      </div>
      
      <div className="gestion-header">
        <h1 className="gestion-title">Gestionar Equipos</h1>
      </div>

      {showAddForm && (
        <AddEquipoForm 
          ubicaciones={ubicaciones}
          onAdd={handleEquipoAdded} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}
      
      {/* --- ¡NUEVO! Contenedor del botón de Guardar --- */}
      <div className="save-container">
        <button
          className="admin-save-btn"
          onClick={handleSaveAllChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios de Estado'}
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
            <th className="admin-th">ID (QR)</th>
            <th className="admin-th">Tipo</th>
            <th className="admin-th">Marca</th>
            <th className="admin-th">Modelo</th>
            <th className="admin-th">N° Serie</th>
            <th className="admin-th">Estado</th>
            <th className="admin-th">Ubicación ID</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((equipo) => (
            <tr key={equipo.id}>
              <td className="admin-td">{equipo.id}</td>
              <td className="admin-td">{equipo.tipo_equipo}</td>
              <td className="admin-td">{equipo.marca}</td>
              <td className="admin-td">{equipo.modelo}</td>
              <td className="admin-td">{equipo.numero_serie}</td>
              
              {/* --- ¡COLUMNA ACTUALIZADA! --- */}
              <td className="admin-td">
                <select
                  className="status-select"
                  value={editedEstados[equipo.id] || equipo.estado}
                  onChange={(e) => handleEstadoChange(equipo.id, e.target.value)}
                  disabled={isSaving}
                >
                  {ESTADOS_PERMITIDOS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>

              <td className="admin-td">{equipo.ubicacion_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {equipos.length === 0 && !showAddForm && <p className="no-results">No hay equipos registrados.</p>}
    </div>
  );
}