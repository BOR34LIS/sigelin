// app/admin/inventario/page.tsx

import InventarioComponent from "@/components/admin/inventario/InventarioComponent";
import React from "react";

export default function InventarioPage() {
  
  // Esta página de servidor simplemente renderiza
  // el componente de cliente que tiene toda la lógica.
  return (
    <main>
      <InventarioComponent />
    </main>
  );
}

// Nota: Asegúrate de que la ruta de importación 
// (ej: "@/components/admin/InventarioComponent") 
// sea correcta según la estructura de tu proyecto.