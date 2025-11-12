"use client";

import React, { useState, useEffect } from "react";
import './InventarioComponent.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaPlusCircle } from "react-icons/fa";
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
interface AddFormProps {
  onAdd: (newRepuesto: Repuesto) => void; // Callback para actualizar la UI
  onCancel: () => void;
}

const AddRepuestoForm: React.FC<AddFormProps> = ({ onAdd, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadStock, setCantidadStock] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Insertamos en la base de datos (permitido por RLS)
      const { data, error: insertError } = await supabase
        .from('repuestos')
        .insert({
          nombre,
          sku,
          descripcion,
          cantidad_stock: cantidadStock,
          stock_minimo: stockMinimo
        })
        .select() // Pedimos que nos devuelva la fila insertada
        .single(); // Esperamos solo una

      if (insertError) throw insertError;

      // 2. Éxito: llamamos al callback 'onAdd' con el nuevo repuesto
      onAdd(data as Repuesto);
      onCancel(); // Cerramos el formulario

    } catch (err: any) {
      setError(err.message.includes('repuestos_sku_key') ? 'Error: Ese SKU ya existe.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-form-container">
      <h2>Añadir Nuevo Repuesto</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del Repuesto</label>
            <input
              type="text"
              className="add-form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>SKU (Código Único)</label>
            <input
              type="text"
              className="add-form-input"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Descripción (Opcional)</label>
          <textarea
            className="add-form-textarea"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Stock Inicial</label>
            <input
              type="number"
              className="add-form-input"
              value={cantidadStock}
              onChange={(e) => setCantidadStock(parseInt(e.target.value, 10))}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Stock Mínimo</label>
            <input
              type="number"
              className="add-form-input"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(parseInt(e.target.value, 10))}
              min="0"
              required
            />
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-buttons">
          <button type="button" className="add-form-btn cancel" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="add-form-btn save" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Repuesto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function InventarioComponent() {
  const router = useRouter();
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [updatingStockId, setUpdatingStockId] = useState<number | null>(null); // Para el spinner del botón +/-

  useEffect(() => {
    async function checkUserAndFetchData() {
      try {
        setLoading(true);
        setError(null);

        // verificamos si el usuario es admin
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

        // si es admin, obtenemos los repuestos
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
  }, []);

  const handleAjustarStock = async (repuestoId: number, amount: number) => {
    // No permitir que el stock baje de 0
    const currentStock = repuestos.find(r => r.id === repuestoId)?.cantidad_stock || 0;
    if (currentStock + amount < 0) return;
    setUpdatingStockId(repuestoId);
    try {
      // Llamamos a la función de la base de datos que creamos
      const { error: rpcError } = await supabase.rpc('ajustar_stock', {
        p_id: repuestoId,
        p_amount: amount
      });

      if (rpcError) throw rpcError;

      // Éxito: Actualizamos el estado local
      setRepuestos(currentList =>
        currentList.map(repuesto =>
          repuesto.id === repuestoId
            ? { ...repuesto, cantidad_stock: repuesto.cantidad_stock + amount }
            : repuesto
        )
      );

    } catch (err: any) {
      console.error("Error al ajustar stock:", err.message);
      // Aquí podríamos mostrar un toast/alerta
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleRepuestoAdded = (newRepuesto: Repuesto) => {
    // Añadimos el nuevo repuesto al inicio de la lista y la re-ordenamos
    setRepuestos(currentList => 
      [...currentList, newRepuesto].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  };

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

  if (loading) {
    return <div className="loader">Cargando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="inventario-container">
      

      <div className="admin-nav-buttons">
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="add-new-btn">
            <FaPlusCircle /> Añadir Repuesto
          </button>
        )}
        <button onClick={handleGoToMenu} className="admin-nav-btn">
          Volver al Menú
        </button>
        <button onClick={handleLogout} className="admin-nav-btn logout">
          Cerrar Sesión
        </button>
      </div>
      
      <div className="inventario-header">
        <h1 className="inventario-title">Inventario de Repuestos</h1>
      </div>

      {showAddForm && (
        <AddRepuestoForm 
          onAdd={handleRepuestoAdded} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}
      
      <table className="inventario-table">
        <thead>
          <tr>
            <th className="inventario-th">Nombre</th>
            <th className="inventario-th">SKU</th>
            <th className="inventario-th">Stock Mínimo</th>
            <th className="inventario-th stock-col">Stock Actual</th>
            <th className="inventario-th adjust-col">Ajustar Stock</th>
            <th className="inventario-th desc-col">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {repuestos.map((repuesto) => (
            <tr key={repuesto.id}>
              <td className="inventario-td">{repuesto.nombre}</td>
              <td className="inventario-td">{repuesto.sku}</td>
              <td className={`inventario-td ${
                repuesto.cantidad_stock <= repuesto.stock_minimo ? 'stock-bajo-minimo' : ''
              }`}>
                {repuesto.stock_minimo}
              </td>
              <td className="inventario-td stock-col">
                {repuesto.cantidad_stock}
              </td>
              <td className="inventario-td adjust-col">
                <div className="stock-adjust-cell">
                  <button 
                    className="stock-btn minus" 
                    onClick={() => handleAjustarStock(repuesto.id, -1)}
                    disabled={updatingStockId === repuesto.id || repuesto.cantidad_stock <= 0}
                  >
                    -
                  </button>
                  <span className="stock-btn-separator"></span>
                  <button 
                    className="stock-btn plus" 
                    onClick={() => handleAjustarStock(repuesto.id, 1)}
                    disabled={updatingStockId === repuesto.id}
                  >
                    +
                  </button>
                  {updatingStockId === repuesto.id && <div className="stock-spinner"></div>}
                </div>
              </td>
              <td className="inventario-td desc-col">{repuesto.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {repuestos.length === 0 && <p>No hay repuestos en el inventario.</p>}
    </div>
  );
}