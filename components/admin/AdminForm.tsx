"use client";

import React, { useState, useEffect } from "react";
import "./AdminForm.css";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaBoxOpen,
  FaUserPlus,
  FaSpinner,
  FaLaptop,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase/client";

// componente para cada ítem de navegación
interface NavItemProps {
  icon: React.ElementType;
  text: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, text, onClick }) => (
  <div className="nav-item" onClick={onClick} tabIndex={0}>
    <div className="item-content">
      <Icon className="nav-icon" />
      <span className="nav-text">{text}</span>
    </div>
  </div>
);

const AdminForm = () => {
  const router = useRouter();

  // para manejar estados de carga y autorización
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // verificamos el acceso de administrador al cargar el componente
  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // si no hay usuario, redirigir al login
        router.push("/login");
        return;
      }

      // si hay usuario, buscamos su perfil para verificar el rol
      const { data: profile, error } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Error al verificar el perfil:", error);
        // si no hay perfil o hay error, no autorizar y parar de cargar
        setIsLoading(false);
        return;
      }

      // comprobamos el rol
      if (profile.rol === "administrador") {
        setIsAuthorized(true);
      }

      // terminamos de cargar (si no es admin, isAuthorized seguirá en false)
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  // handler para el logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
      }
      router.push("/login");
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setLogoutLoading(false);
    }
  };

  // estado de carga inicial
  if (isLoading) {
    return (
      <div className="wrapper">
        <div className="admin-container" style={{ textAlign: "center" }}>
          <h1>Verificando acceso...</h1>
          <FaSpinner
            className="nav-icon"
            style={{ fontSize: "2rem", marginTop: "1rem" }}
          />
        </div>
      </div>
    );
  }

  // acceso denegado
  if (!isAuthorized) {
    return (
      <div className="wrapper">
        <div className="admin-container" style={{ textAlign: "center" }}>
          <h1>Acceso Denegado</h1>
          <p className="subtitle" style={{ color: "#ff7b7b" }}>
            No tienes permisos de administrador para ver esta página.
          </p>
          <button
            type="button"
            className="btn logout-btn"
            style={{ marginTop: "2rem" }}
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            <FaSignOutAlt className="btn-icon" />
            {logoutLoading ? "Saliendo..." : "Volver al Login"}
          </button>
        </div>
      </div>
    );
  }

  // estado autorizado (muestra el panel de administración)
  return (
    <div className="wrapper">
      <div className="admin-container">
        <h1>Panel de Administración</h1>
        <p className="subtitle">
          Selecciona una opción para gestionar el sistema.
        </p>

        <div className="nav-items-container">
          <NavItem
            icon={FaBoxOpen}
            text="Stock de Repuestos"
            onClick={() => router.push("/admin/inventario")}
          />

          <NavItem
            icon={FaChartBar}
            text="Ver Reportes"
            onClick={() => router.push("/admin/reportes")}
          />

          <NavItem
            icon={FaUsers}
            text="Gestionar Usuarios"
            onClick={() => router.push("/admin/usuarios")}
          />

          <NavItem
            icon={FaLaptop}
            text="Gestionar Equipos"
            onClick={() => router.push("/admin/equipos")}
          />

          <NavItem
            icon={FaMapMarkerAlt}
            text="Gestionar Ubicaciones"
            onClick={() => router.push("/admin/ubicaciones")}
          />
        </div>

        <button
          type="button"
          className="btn logout-btn"
          onClick={handleLogout}
          disabled={logoutLoading}
        >
          <FaSignOutAlt className="btn-icon" />
          {logoutLoading ? "Cerrando..." : "Cerrar Sesión"}
        </button>
      </div>
    </div>
  );
};

export default AdminForm;