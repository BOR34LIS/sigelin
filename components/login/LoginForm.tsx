"use client";

import React, { useState } from "react";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from '@/lib/supabase/client';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // estados para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // redirección a la página de registro
  const handleSignUpRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/registro');
  };

  // 3. función para manejar el envío del formulario
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // para que no recargue la página
    setError('');
    setLoading(true);

    try {
      // llamamos a supabase para iniciar sesión
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.user) {
        // si el inicio de sesión es exitoso, redirigir al usuario
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl){
          router.push(redirectUrl);
        } else {
          router.push('/reportar'); // redirigir a reportar, aunque va a dar error porque no tiene id
        }
      }

    } catch (err: any) {
      // manejo de errores
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
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