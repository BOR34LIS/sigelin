"use client";

import React, { useState, useEffect } from "react";
import "./UsuarioForm.css"; // Usamos los mismos estilos para mantener el diseño
import { FaUserTag, FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Define los tipos de datos
interface UserData {
  id: string;
  nombre_completo: string;
  rol: string;
  email: string;
}

// Roles disponibles (incluyendo el nuevo rol 'Administrador')
const rolesDisponibles = [
    "Administrador", 
    "Director de Carrera", 
    "Coordinador", 
    "Técnico de Laboratorio", 
    "Personal Administrativo",
    "Alumno"
];

// Asume que este componente recibe el ID del usuario a editar como prop
const UsuarioEditForm = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [newRol, setNewRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // SIMULACIÓN: Cargar datos del usuario
  useEffect(() => {
    // En producción, aquí harías una llamada a Supabase desde el cliente para obtener los datos
    // Usaremos datos simulados por ahora:
    if (userId) {
        setUserData({
            id: userId,
            nombre_completo: "Juan López (Simulado)",
            rol: "Coordinador",
            email: "jlopez@inacap.cl"
        });
        setNewRol("Coordinador");
        setLoading(false);
    }
  }, [userId]);


  const handleUpdateRol = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!userData) {
        setError("Error: No se encontraron datos del usuario.");
        setLoading(false);
        return;
    }

    // LLAMADA CLAVE: Se llama a la API Route Handler del servidor para actualizar el rol.
    // Esto es necesario para usar la Service Role Key y saltar la RLS de forma segura.
    try {
        const response = await fetch('/api/admin/update-rol', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id, newRol: newRol }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || "Fallo la actualización del rol.");
        }

        setUserData(prev => ({ ...prev!, rol: newRol })); // Actualiza el estado local
        setSuccess(`Rol de ${userData.nombre_completo} actualizado a ${newRol} exitosamente.`);
        
    } catch (err: any) {
        setError(err.message || "Error desconocido al actualizar el rol.");
    } finally {
        setLoading(false);
    }
  };


  if (loading) return <div className="full-wrapper"><p className="subtitle">Cargando datos del usuario...</p></div>;
  if (error) return <div className="full-wrapper"><p className="subtitle" style={{color: '#e74c3c'}}>{error}</p></div>;
  if (!userData) return <div className="full-wrapper"><p className="subtitle">Usuario no encontrado.</p></div>;

  return (
    <div className="full-wrapper">
      <div className="wrapper user-management-card" style={{width: '500px'}}>
        <h1>Editar Rol de Usuario</h1>
        <p className="subtitle">Asigna permisos y roles a **{userData.nombre_completo}**.</p>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleUpdateRol}>
            
            {/* Display de Email */}
            <div className="input-box">
                <input type="text" value={userData.email} readOnly disabled />
                <FaEnvelope className="icon" />
            </div>

            {/* Selector de Rol */}
            <div className="select-box">
                <select 
                    required
                    value={newRol}
                    onChange={(e) => setNewRol(e.target.value)}
                >
                    {rolesDisponibles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
                <FaUserTag className="icon" />
            </div>

            <button type="submit" className="btn" disabled={loading || newRol === userData.rol}>
                {loading ? 'Guardando...' : 'Actualizar Rol'}
            </button>
            <button 
                type="button" 
                className="btn" 
                onClick={() => router.push('/usuarios')} 
                style={{backgroundColor: '#6c757d', marginTop: '10px'}}
            >
                Cancelar
            </button>
        </form>
      </div>
    </div>
  );
};

export default UsuarioEditForm;