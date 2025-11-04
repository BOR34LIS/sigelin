import GestionUsuariosComponent from "@/components/admin/gestionUsuarios/GestionUsuarios";
import React from "react";

export default function GestionUsuariosPage() {
  
  // Esta página de servidor simplemente renderiza
  // el componente de cliente que tiene toda la lógica.
  return (
    <main>
      <GestionUsuariosComponent />
    </main>
  );
}

// Nota: Asegúrate de que la ruta de importación 
// (ej: "@/components/admin/GestionUsuariosComponent") 
// sea correcta según la estructura de tu proyecto.