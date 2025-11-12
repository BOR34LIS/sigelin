"use client";

import React, { useState, useEffect } from "react";
import "./UbicacionesComponent.css";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa"; // <-- Iconos añadidos

// Tipo de dato para las ubicaciones
type Ubicacion = {
  id: number;
  piso: string;
  tipo_sala: string;
  descripcion: string | null;
};
// Sub-componente del Formulario de Añadir / Editar
interface AddFormProps {
  initialData?: Ubicacion;
  onAdd: (newUbicacion: Ubicacion) => void;
  onUpdate: (updatedUbicacion: Ubicacion) => void;
  onCancel: () => void;
}

const AddUbicacionForm: React.FC<AddFormProps> = ({ initialData, onAdd, onUpdate, onCancel }) => {
  // Detectar si estamos en modo edición
  const isEditMode = !!initialData;

  const [id, setId] = useState<number | ''>(initialData?.id || '');
  const [piso, setPiso] = useState(initialData?.piso || '');
  const [tipoSala, setTipoSala] = useState(initialData?.tipo_sala || 'LAB');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        // LÓGICA DE ACTUALIZACIÓN (UPDATE)
        const { data, error: updateError } = await supabase
          .from('ubicaciones')
          .update({
            // No se puede actualizar el ID (PK)
            piso: piso,
            tipo_sala: tipoSala,
            descripcion: descripcion || null,
          })
          .eq('id', id)
          .select()
          .single();
        if (updateError) throw updateError;
        onUpdate(data as Ubicacion); // Llamar al callback de actualización

      } else {
        // LÓGICA DE CREACIÓN (INSERT)
        const { data, error: insertError } = await supabase
          .from('ubicaciones')
          .insert({
            id: Number(id),
            piso: piso,
            tipo_sala: tipoSala,
            descripcion: descripcion || null,
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.message.includes('unique constraint')) {
            throw new Error(`Error: El ID de sala '${id}' ya existe.`);
          }
          throw insertError;
        }
        onAdd(data as Ubicacion); // Llamar al callback de añadir
      }
      onCancel(); // Cerrar el formulario

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form-container">
      <h2>{isEditMode ? 'Editar Ubicación' : 'Añadir Nueva Ubicación'}</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-row">
          <div className="form-group">
            <label>ID (Número de Sala)</label>
            <input
              type="number"
              className="add-form-input"
              value={id}
              onChange={(e) => setId(Number(e.target.value))}
              placeholder="Ej: 408"
              required
              disabled={isEditMode} // No se puede editar el ID (PK)
            />
          </div>
          <div className="form-group">
            <label>Piso (Ej: "Cuarto")</label>
            <input
              type="text"
              className="add-form-input"
              value={piso}
              onChange={(e) => setPiso(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo de Sala (Ej: "LAB")</label>
            <input
              type="text"
              className="add-form-input"
              value={tipoSala}
              onChange={(e) => setTipoSala(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Descripción (Opcional)</label>
          <textarea
            className="add-form-textarea"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-buttons">
          <button type="button" className="add-form-btn cancel" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="add-form-btn save" disabled={loading}>
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};



// Sub-componente del Modal de Confirmación
interface DeleteModalProps {
  ubicacion: Ubicacion;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}
// Componente del Modal de Confirmación de Eliminación
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ ubicacion, onConfirm, onCancel, isDeleting }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Confirmar Eliminación</h2>
      <p>
        ¿Estás seguro de que quieres eliminar la ubicación <strong>{ubicacion.id} ({ubicacion.piso})</strong>?
        <br />
        Esta acción no se puede deshacer.
      </p>
      <div className="modal-buttons">
        <button className="modal-btn cancel" onClick={onCancel} disabled={isDeleting}>
          Cancelar
        </button>
        <button className="modal-btn delete" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  </div>
);


export default function GestionUbicacionesComponent() {
  const router = useRouter();
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState<Ubicacion | null>(null);
  const [isDeleting, setIsDeleting] = useState<Ubicacion | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function checkAdminAndFetchUbicaciones() {
// Verificar si el usuario es admin
      try {
        setLoading(true);
        setError(null);
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
        const { data: ubicacionesData, error: ubicacionesError } = await supabase
          .from('ubicaciones')
          .select('id, piso, tipo_sala, descripcion')
          .order('id', { ascending: true });
        if (ubicacionesError) throw ubicacionesError;
        setUbicaciones(ubicacionesData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndFetchUbicaciones();
  }, []);

  const handleUbicacionAdded = (newUbicacion: Ubicacion) => {
    setUbicaciones(currentList => [...currentList, newUbicacion]);
    setShowAddForm(false);
  };

  const handleUbicacionUpdated = (updatedUbicacion: Ubicacion) => {
    setUbicaciones(currentList =>
      currentList.map(item =>
        item.id === updatedUbicacion.id ? updatedUbicacion : item
      )
    );
    setIsEditing(null); // Cierra el formulario de edición
  };

  const handleConfirmDelete = async () => {
    if (!isDeleting) return;
    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from('ubicaciones')
        .delete()
        .eq('id', isDeleting.id);

      if (error) throw error;

      // Éxito: quitar de la lista local
      setUbicaciones(currentList =>
        currentList.filter(item => item.id !== isDeleting.id)
      );
      setIsDeleting(null); // Cerrar modal

    } catch (err: any) {
      console.error("Error al eliminar:", err.message);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleGoToMenu = () => router.push('/admin');

  if (loading) {
    return <div className="admin-loader">Verificando acceso y cargando ubicaciones...</div>;
  }
  if (error) {
    return <div className="admin-error-message">{error}</div>;
  }

  // Deshabilita los botones de la tabla si un formulario está abierto
  const isFormOpen = showAddForm || isEditing;

  return (
    <div className="gestion-container">
      
      <div className="admin-nav-buttons">
        {!isFormOpen && (
          <button onClick={() => setShowAddForm(true)} className="add-new-btn">
            <FaPlusCircle /> Añadir Ubicación
          </button>
        )}
        <button onClick={handleGoToMenu} className="admin-nav-btn">
          Volver al Menú
        </button>
      </div>
      
      <div className="gestion-header">
        <h1 className="gestion-title">Gestionar Ubicaciones</h1>
      </div>

      {/* Mostrar formulario de AÑADIR */}
      {showAddForm && (
        <AddUbicacionForm 
          onAdd={handleUbicacionAdded}
          onUpdate={() => {}} // No se usa en modo 'add'
          onCancel={() => setShowAddForm(false)} 
        />
      )}
      
      {/* Mostrar formulario de EDITAR */}
      {isEditing && (
        <AddUbicacionForm 
          initialData={isEditing} // Pasamos los datos iniciales
          onAdd={() => {}} // No se usa en modo 'edit'
          onUpdate={handleUbicacionUpdated}
          onCancel={() => setIsEditing(null)} // Cierra el modo edición
        />
      )}
      
      <table className="admin-table">
        <thead>
          <tr>
            <th className="admin-th">ID (Sala)</th>
            <th className="admin-th">Piso</th>
            <th className="admin-th">Tipo Sala</th>
            <th className="admin-th">Descripción</th>
            <th className="admin-th actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.map((ubicacion) => (
            <tr key={ubicacion.id}>
              <td className="admin-td">{ubicacion.id}</td>
              <td className="admin-td">{ubicacion.piso}</td>
              <td className="admin-td">{ubicacion.tipo_sala}</td>
              <td className="admin-td">{ubicacion.descripcion || 'N/A'}</td>
              <td className="admin-td actions-col">
                <button
                  className="action-btn edit"
                  onClick={() => setIsEditing(ubicacion)}
                  disabled={!!isFormOpen} // Deshabilitar si un formulario está abierto
                >
                  <FaEdit />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => setIsDeleting(ubicacion)}
                  disabled={!!isFormOpen}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {ubicaciones.length === 0 && !isFormOpen && <p className="no-results">No hay ubicaciones registradas.</p>}
      
      {/* El Modal (se muestra si 'isDeleting' tiene un objeto) */}
      {isDeleting && (
        <DeleteConfirmationModal
          ubicacion={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleting(null)}
          isDeleting={deleteLoading}
        />
      )}
    </div>
  );
}