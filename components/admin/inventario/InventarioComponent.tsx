"use client";

import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import './InventarioComponent.css';
import { useRouter } from 'next/navigation'; // <-- 1. IMPORTAR useRouter

// CREA EL CLIENTE PÚBLICO
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// DEFINIMOS EL TIPO DE DATO
type Repuesto = {
  id: number;
  nombre: string;
  descripcion: string;
  sku: string;
  cantidad_stock: number;
  stock_minimo: number;
  created_at: string;
};

export default function InventarioComponent() {
  const router = useRouter(); // <-- 2. INICIALIZAR ROUTER
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... (Tu lógica de checkUserAndFetchData sigue igual) ...
    async function checkUserAndFetchData() {
      try {
        setLoading(true);
        setError(null);

        // --- PASO A: Verificar el rol del usuario ---
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No has iniciado sesión. Serás redirigido.");
        }

        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          throw new Error("No se pudo encontrar tu perfil de usuario.");
        }

        if (profile.rol !== 'administrador') {
          throw new Error("Acceso Denegado. Esta página es solo para administradores.");
        }

        // --- PASO B: Si es admin, cargar el inventario ---
        const { data: repuestosData, error: repuestosError } = await supabase
          .from('repuestos')
          .select('*')
          .order('nombre', { ascending: true });

        if (repuestosError) {
          throw new Error(repuestosError.message);
        }

        setRepuestos(repuestosData || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkUserAndFetchData();
  }, []); // El router no es necesario como dependencia aquí

  // --- 3. NUEVAS FUNCIONES PARA LOS BOTONES ---

  const handleGoToMenu = () => {
    router.push('/admin'); // Redirige al menú de admin
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login'); // Redirige al login
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err.message);
    }
  };


  // --- Renderizado del componente ---

  if (loading) {
    return <div className="loader">Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="inventario-container">
      
      {/* --- 4. BOTONES AÑADIDOS --- */}
      <div className="admin-nav-buttons">
        <button onClick={handleGoToMenu} className="admin-nav-btn">
          Volver al Menú
        </button>
        <button onClick={handleLogout} className="admin-nav-btn logout">
          Cerrar Sesión
        </button>
      </div>
      
      <h1 className="inventario-title">Inventario de Repuestos</h1>
      
      <table className="inventario-table">
        {/* ... (El resto de tu tabla sigue igual) ... */}
        <thead>
          <tr>
            <th className="inventario-th">Nombre</th>
            <th className="inventario-th">SKU</th>
            <th className="inventario-th">Stock Actual</th>
            <th className="inventario-th">Stock Mínimo</th>
            <th className="inventario-th">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {repuestos.map((repuesto) => (
            <tr key={repuesto.id}>
              <td className="inventario-td">{repuesto.nombre}</td>
              <td className="inventario-td">{repuesto.sku}</td>
              <td className="inventario-td">{repuesto.cantidad_stock}</td>
              <td className={`inventario-td ${
                repuesto.cantidad_stock <= repuesto.stock_minimo ? 'stock-bajo' : ''
              }`}>
                {repuesto.stock_minimo}
              </td>
              <td className="inventario-td">{repuesto.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {repuestos.length === 0 && <p>No hay repuestos en el inventario.</p>}
    </div>
  );
}