// components/login/LoginForm.tsx

"use client";

import React, { useState } from "react";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

// 1. INICIALIZA EL CLIENTE PÚBLICO DE SUPABASE
//    (Asegúrate de que estas variables estén en .env.local y Vercel)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const LoginForm = () => {
  const router = useRouter();

  // 2. ESTADOS PARA MANEJAR EL FORMULARIO
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirigir a registro (esto ya lo tenías y estaba bien)
  const handleSignUpRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/registro');
  };

  // 3. FUNCIÓN DE LOGIN
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previene que la página se recargue
    setError('');
    setLoading(true);

    try {
      // 4. LLAMADA A SUPABASE AUTH PARA INICIAR SESIÓN
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.user) {
        // ¡Éxito! Redirigir al usuario a la página principal o a reportar
        router.push('/reportar');
      }

    } catch (err: any) {
      // 5. MANEJO DE ERRORES
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      {/* 6. CONECTAR EL FORMULARIO AL HANDLER */}
      <form onSubmit={handleLogin}>
        <h1>Login</h1>

        {/* Mensaje de error */}
        {error && <p style={{ color: '#ff7b7b', textAlign: 'center' }}>{error}</p>}

        <div className="input-box">
          <input 
            type="email" 
            placeholder="Ingresa tu correo" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-box">
          <input 
            type="password" 
            placeholder="Ingresa tu contraseña" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <div className="remember-forgot">
          <label>
            <input type="checkbox" />Recuérdame
          </label>
          <a href="#">Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>

        <div className="login-register">
          <p>¿No tienes una cuenta? <a href="#" onClick={handleSignUpRedirect}>Regístrate</a></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;