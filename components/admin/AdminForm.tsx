"use client";

import React, { useState } from "react";
import "./AdminForm.css";
import { useRouter } from 'next/navigation';
import { FaUsers, FaChartBar, FaSignOutAlt, FaBoxOpen, FaUserPlus } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js'; // <-- 1. Importar Supabase

// --- 2. Inicializar el cliente público de Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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
    const router = useRouter(); // Router para navegación
    const [loading, setLoading] = useState(false); // Estado de carga para el logout

    // --- 3. Función para manejar el Logout ---
    const handleLogout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error al cerrar sesión:", error.message);
            }
            router.push('/login'); // Redirigir al login
        } catch (err) {
            console.error("Error inesperado:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <div className="admin-container">
                <h1>Panel de Administración</h1>
                <p className="subtitle">Selecciona una opción para gestionar el sistema.</p>
                
                <div className="nav-items-container">
                    
                    {/* --- 4. onClick actualizado para navegar --- */}
                    <NavItem 
                        icon={FaBoxOpen} 
                        text="Stock de Repuestos" 
                        onClick={() => router.push('/admin/inventario')}
                    />

                    <NavItem 
                        icon={FaChartBar} 
                        text="Ver Reportes" 
                        onClick={() => router.push('/admin/reportes')} // (Asegúrate que esta ruta exista)
                    />

                    <NavItem 
                        icon={FaUsers} 
                        text="Gestionar Usuarios" 
                        onClick={() => router.push('/admin/usuarios')} // (Asegúrate que esta ruta exista)
                    />
                    
                </div>

                {/* --- 5. Botón de Logout conectado y con estado de carga --- */}
                <button 
                    type="button" 
                    className="btn logout-btn"
                    onClick={handleLogout}
                    disabled={loading} // Deshabilitar mientras carga
                >
                    <FaSignOutAlt className="btn-icon" /> 
                    {loading ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
            </div>
        </div>
    );
};

export default AdminForm;