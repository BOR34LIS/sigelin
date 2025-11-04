"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import './GestionUsuarios.css';

// Definimos el tipo de dato para un perfil de usuario
type UserProfile = {
  id: string; // UUID
  nombre_completo: string;
  email: string;
  rol: 'administrador' | 'tecnico' | 'coordinador' | 'Alumno';
};

// Lista de roles permitidos por tu BD
const ROLES_PERMITIDOS = ['administrador', 'tecnico', 'coordinador', 'alumno'];

export default function GestionUsuariosComponent() {
  const router = useRouter();

  // Estados de la UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Estado para el botón de guardar
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  
  // Estados de los datos
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]); // Lista maestra original
  const [userRoles, setUserRoles] = useState<Record<string, string>>({}); // Estado para los roles editados
  const [searchTerm, setSearchTerm] = useState('');

  // Lista filtrada (sin cambios en la lógica de filtro)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;
    return allUsers.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  // Hook de carga inicial y verificación de admin
  useEffect(() => {
    async function checkAdminAndFetchUsers() {
      try {
        // ... (Verificación de admin igual que antes) ...
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

        // Si es admin, cargar TODOS los usuarios
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select('id, nombre_completo, email, rol');

        if (usersError) throw usersError;

        setAllUsers(usersData || []);
        
        // --- ¡NUEVO! ---
        // Inicializar el estado de 'userRoles' con los roles actuales
        const initialRoles: Record<string, string> = {};
        if (usersData) {
          for (const user of usersData) {
            initialRoles[user.id] = user.rol;
          }
        }
        setUserRoles(initialRoles);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchUsers();
  }, [router]);

  // --- ¡LÓGICA ACTUALIZADA! ---
  // Esta función AHORA solo actualiza el estado local
  const handleRoleChange = (userId: string, newRole: string) => {
    setUserRoles(prevRoles => ({
      ...prevRoles,
      [userId]: newRole,
    }));
    setSaveStatus(null); // Ocultar mensaje de éxito/error si se hace un nuevo cambio
  };

  // components/admin/GestionUsuarios.tsx

// ... (todo tu código anterior: imports, useState, useEffect, etc.) ...

  // --- ¡NUEVA FUNCIÓN! ---
  // Esta función se llama al presionar el botón "Guardar Cambios"
  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    // 1. Encontrar qué roles realmente cambiaron (esta lógica no cambia)
    const updates: { id: string, rol: string }[] = [];
    for (const user of allUsers) {
      const originalRole = user.rol;
      const newRole = userRoles[user.id];
      if (originalRole !== newRole) {
        updates.push({ id: user.id, rol: newRole });
      }
    }

    // 2. Si no hay cambios, no hacer nada (esta lógica no cambia)
    if (updates.length === 0) {
      setSaveStatus({ type: 'success', msg: 'No había cambios que guardar.' });
      setIsSaving(false);
      return;
    }

    // --- 3. ¡LÓGICA DE GUARDADO ACTUALIZADA! ---
    // En lugar de 'upsert', iteramos y usamos 'update' para cada cambio.
    // Esto coincide perfectamente con nuestra política RLS de UPDATE.
    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('usuarios')
          .update({ rol: update.rol }) // Solo actualiza el rol
          .eq('id', update.id);        // Donde el ID coincida

        // Si cualquier actualización falla, nos detenemos y reportamos el error
        if (error) {
          throw error;
        }
      }

      // 4. Éxito: Actualizar la lista "maestra" (allUsers)
      setAllUsers(prevUsers =>
        prevUsers.map(user => {
          const newRole = userRoles[user.id];
          return user.rol !== newRole ? { ...user, rol: newRole as UserProfile['rol'] } : user;
        })
      );

      setSaveStatus({ type: 'success', msg: '¡Cambios guardados con éxito!' });
    } catch (err: any) {
      setSaveStatus({ type: 'error', msg: `Error al guardar: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

// ... (todo tu código posterior: el return, el JSX, etc.) ...

  // --- Renderizado ---

  if (loading) {
    return <div className="admin-loader">Verificando acceso y cargando usuarios...</div>;
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

      <h1 className="gestion-title">Gestionar Usuarios</h1>
      
      <input
        type="text"
        placeholder="Buscar por correo electrónico..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* --- ¡NUEVO! Botón de Guardar y Mensaje de Estado --- */}
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
            <th className="admin-th">Nombre Completo</th>
            <th className="admin-th">Correo Electrónico</th>
            <th className="admin-th">Rol</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="admin-td">{user.nombre_completo}</td>
              <td className="admin-td">{user.email}</td>
              <td className="admin-td">
                {/* El valor ahora viene del estado 'userRoles'.
                  'user.rol' se muestra la primera vez.
                  'userRoles[user.id]' muestra el valor editado.
                */}
                <select
                  className="role-select"
                  value={userRoles[user.id] || user.rol} // Leer desde el estado local
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={isSaving}
                >
                  {ROLES_PERMITIDOS.map(rol => (
                    <option key={rol} value={rol}>
                      {rol.charAt(0).toUpperCase() + rol.slice(1)} 
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredUsers.length === 0 && <p className="no-results">No se encontraron usuarios.</p>}
    </div>
  );
}