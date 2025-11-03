"use client";

import React from "react";
import "./UsuarioForm.css"; // Importa los estilos CSS (nombre corregido)
// Íconos para las acciones de la tabla
import { FaEdit, FaTrashAlt } from "react-icons/fa";

// Definición de tipos de datos de ejemplo (basado en usuarios responsables de SIGELIN)
interface User {
  id: number;
  nombre: string;
  rol: string; // Director, Coordinador, Técnico, Administrativo
  email: string;
}

// Datos simulados (Ejemplos de usuarios responsables en la institución)
const mockUsers: User[] = [
  { id: 1, nombre: "Ana Pérez", rol: "Directora de Carrera", email: "aperez@inacap.cl" },
  { id: 2, nombre: "Juan López", rol: "Coordinador", email: "jlopez@inacap.cl" },
  { id: 3, nombre: "María Soto", rol: "Técnico de Laboratorio", email: "msoto@inacap.cl" },
  { id: 4, nombre: "Carlos Gómez", rol: "Personal Administrativo", email: "cgomez@inacap.cl" },
];

const UsuarioForm = () => { // Nombre del componente corregido
  const handleAction = (action: string, user: User) => {
    console.log(`${action} usuario: ${user.nombre} (ID: ${user.id})`);
  };

  return (
    <div className="full-wrapper">
      <div className="wrapper user-management-card">
        <h1>Gestión de Usuarios</h1>
        <p className="subtitle">Visualiza y administra los usuarios asignados a los equipos de INACAP.</p>

        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td data-label="Nombre">{user.nombre}</td>
                  <td data-label="Rol">{user.rol}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Acciones" className="actions-cell">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleAction('Editar', user)}
                      title="Editar Usuario"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleAction('Eliminar', user)}
                      title="Eliminar Usuario"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsuarioForm; // Exportación corregida