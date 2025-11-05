"use client";

import React, { useState } from "react";
import "./RegistroForm.css";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";

const RegistroForm = () => {
  const router = useRouter();

  // inicializamos los estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  // logica para el envío del registro
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // llamamos a la api de registro
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          nombre_completo: nombre,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al registrar la cuenta.");
      }

      // exitoo
      setSuccess(result.message);
      setLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Registro de Usuario</h1>

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
            placeholder="Ingresa tu correo"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaEnvelope className="icon" />
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

        <div className="input-box">
          <input
            type="password"
            placeholder="Confirma tu contraseña"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        {error && (
          <p
            style={{
              color: "#ff7b7b",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            style={{
              color: "#7bff7b",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {success}
          </p>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <div className="login-register">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <a href="#" onClick={handleLoginRedirect}>
              Inicia Sesión
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegistroForm;
