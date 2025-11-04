"use client";

import React, { useState, useEffect } from "react"; // <-- 1. IMPORTAR useEffect
import "./AdminForm.css";
import { useRouter } from 'next/navigation';
import { FaUsers, FaChartBar, FaSignOutAlt, FaBoxOpen, FaUserPlus, FaSpinner } from "react-icons/fa"; // <-- 2. Añadir FaSpinner
import { supabase } from '@/lib/supabase/client';
// --- Inicializar el cliente público de Supabase ---


// --- Componente NavItem (sin cambios) ---
interface NavItemProps {
    icon: React.ElementType;
    text: string;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, text, onClick }) => (
  <div 
    className="nav-item"
    onClick={onClick}
    tabIndex={0}
  >
    <div className="item-content">
      <Icon className="nav-icon" /> 
      <span className="nav-text">{text}</span>
    </div>
  </div>
);
// --- Fin de NavItem ---


const AdminForm = () => {
    const router = useRouter();
    
    // --- 3. ESTADOS PARA MANEJAR LA AUTORIZACIÓN ---
    const [isLoading, setIsLoading] = useState(true); // Empezamos cargando
    const [isAuthorized, setIsAuthorized] = useState(false); // No autorizado por defecto
    const [logoutLoading, setLogoutLoading] = useState(false); // Estado de carga para el logout

    // --- 4. useEffect PARA VERIFICAR EL ROL DE ADMIN ---
    useEffect(() => {
      const checkAdminAccess = async () => {
        // Primero, obtenemos el usuario actual
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Si no hay usuario, redirigir al login
          router.push('/login');
          return;
        }

        // Si hay usuario, buscamos su perfil para verificar el rol
        const { data: profile, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          console.error("Error al verificar el perfil:", error);
          // Si no hay perfil o hay error, no autorizar y parar de cargar
          setIsLoading(false);
          return;
        }

        // Comprobamos el rol
        if (profile.rol === 'administrador') {
          setIsAuthorized(true); // ¡Acceso permitido!
        }
        
        // Terminamos de cargar (si no es admin, isAuthorized seguirá en false)
        setIsLoading(false);
      };

      checkAdminAccess();
    }, [router]); // Se ejecuta una vez al cargar


    // --- Función para manejar el Logout (sin cambios, solo renombré el estado de carga) ---
    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error al cerrar sesión:", error.message);
            }
            router.push('/login');
        } catch (err) {
            console.error("Error inesperado:", err);
        } finally {
            setLogoutLoading(false);
        }
    };


    // --- 5. RENDERIZADO CONDICIONAL ---

    // ESTADO DE CARGA
    if (isLoading) {
      return (
        // Reutilizamos el 'wrapper' para mantener el fondo
        <div className="wrapper">
          <div className="admin-container" style={{ textAlign: 'center' }}>
            <h1>Verificando acceso...</h1>
            <FaSpinner className="nav-icon" style={{ fontSize: '2rem', marginTop: '1rem' }} />
          </div>
        </div>
      );
    }

    // ESTADO DE ACCESO DENEGADO
    if (!isAuthorized) {
      return (
        <div className="wrapper">
          <div className="admin-container" style={{ textAlign: 'center' }}>
            <h1>Acceso Denegado</h1>
            <p className="subtitle" style={{ color: '#ff7b7b' }}>
              No tienes permisos de administrador para ver esta página.
            </p>
            <button 
                type="button" 
                className="btn logout-btn"
                style={{ marginTop: '2rem' }}
                onClick={handleLogout}
                disabled={logoutLoading}
            >
              <FaSignOutAlt className="btn-icon" /> 
              {logoutLoading ? 'Saliendo...' : 'Volver al Login'}
            </button>
          </div>
        </div>
      );
    }

    // ESTADO AUTORIZADO (Muestra el panel de admin)
    return (
        <div className="wrapper">
            <div className="admin-container">
                <h1>Panel de Administración</h1>
                <p className="subtitle">Selecciona una opción para gestionar el sistema.</p>
                
                <div className="nav-items-container">
                    
                    <NavItem 
                        icon={FaBoxOpen} 
                        text="Stock de Repuestos" 
                        onClick={() => router.push('/admin/inventario')}
                    />

                    <NavItem 
                        icon={FaChartBar} 
                        text="Ver Reportes" 
                        onClick={() => router.push('/admin/reportes')}
                    />

                    <NavItem 
                        icon={FaUsers} 
                        text="Gestionar Usuarios" 
                        onClick={() => router.push('/admin/usuarios')}
                    />
                    
                </div>

                <button 
                    type="button" 
                    className="btn logout-btn"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                >
                    <FaSignOutAlt className="btn-icon" /> 
                    {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
            </div>
        </div>
    );
};

export default AdminForm;