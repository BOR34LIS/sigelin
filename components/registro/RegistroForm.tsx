"use client";

import React, { useState } from "react";
import "./RegistroForm.css";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"; // Removida FaBriefcase
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase/client';

const RegistroForm = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // [CORREGIDO] Estado 'rol' eliminado.
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // [CORREGIDO] Roles disponibles eliminado.

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // ** 1. REGISTRO EN SUPABASE AUTH **
    const { 
      data: { user }, 
      error: authError 
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { 
          nombre_completo: nombre, 
          rol_inicial: 'Alumno' // <-- [CORREGIDO] Nuevo rol por defecto
        } 
      }
    });

    if (authError) {
      setError(`Error de registro: ${authError.message}`);
      setLoading(false);
      return;
    }
    
    if (!authError) {
        alert(`¡Registro exitoso! Revisa tu correo ${email} para verificar la cuenta y poder iniciar sesión.`);
        router.push('/'); 
    }
    
    setLoading(false);
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSignUp}>
        <h1>Registro de Usuario</h1>
        <p className="subtitle">Crea una nueva cuenta en SIGELIN de INACAP.</p>
        
        {error && <div className="error-message">{error}</div>}

        <div className="input-box">
          <input 
            type="text" 
            placeholder="Nombre Completo" 
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-box">
          <input 
            type="email" 
            placeholder="Correo Institucional" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaEnvelope className="icon" />
        </div>

        <div className="input-box">
          <input 
            type="password" 
            placeholder="Contraseña" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>
        
        {/* [ELIMINADO] Selector de Rol */}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Registrando...' : 'Completar Registro'}
        </button>

        <div className="login-register">
          <p>¿Ya tienes una cuenta? <a href="#" onClick={() => router.push('/')}>Iniciar Sesión</a></p>
        </div>
      </form>
    </div>
  );
};

export default RegistroForm;