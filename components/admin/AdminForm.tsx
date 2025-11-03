"use client";

import React from "react";
import "./AdminForm.css";
// Usando los iconos de Font Awesome para mantener la coherencia
// Se añaden FaBoxOpen y FaUserPlus para Stock y Registrar
import { FaUsers, FaChartBar, FaSignOutAlt, FaBoxOpen, FaUserPlus } from "react-icons/fa"; 

// Interfaz para las propiedades del NavItem
interface NavItemProps {
    icon: React.ElementType;
    text: string;
    onClick: () => void;
}

// Componente auxiliar para los items de navegación
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


const AdminForm = () => {
    // Función de navegación de ejemplo
    const handleNavigation = (view: string) => {
        // Aquí se implementaría la lógica de enrutamiento (e.g., Next.js Router)
        console.log(`Navegando a la vista: ${view}`);
    };

    return (
        // Reutilizamos la clase "wrapper" para mantener el mismo diseño de tarjeta
        <div className="wrapper">
            <div className="admin-container">
                <h1>Panel de Administración</h1>
                <p className="subtitle">Selecciona una opción para gestionar el sistema.</p>
                
                <div className="nav-items-container">
                    
                    {/* Opción 1: Ver Stock de Repuestos (NUEVA) */}
                    <NavItem 
                        icon={FaBoxOpen} 
                        text="Stock de Repuestos" 
                        onClick={() => handleNavigation('stock')}
                    />

                    {/* Opción 2: Registrar Nuevo Usuario (NUEVA) */}
                    <NavItem 
                        icon={FaUserPlus} 
                        text="Registrar Nuevo Usuario" 
                        onClick={() => handleNavigation('registrar-usuario')}
                    />

                    {/* Opción 3: Ver Reportes */}
                    <NavItem 
                        icon={FaChartBar} 
                        text="Ver Reportes" 
                        onClick={() => handleNavigation('reportes')}
                    />

                    {/* Opción 4: Gestionar Usuarios */}
                    <NavItem 
                        icon={FaUsers} 
                        text="Gestionar Usuarios" 
                        onClick={() => handleNavigation('usuarios')}
                    />
                    
                </div>

                {/* Botón de Cerrar Sesión */}
                <button 
                    type="button" 
                    className="btn logout-btn"
                    onClick={() => handleNavigation('logout')}
                >
                    <FaSignOutAlt className="btn-icon" /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default AdminForm;