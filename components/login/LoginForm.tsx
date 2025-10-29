import React from "react";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = () => {
  return (
    <div className="wrapper">
      <form action="">
        <h1>login</h1>
        <div className="input-box">
          <input type="text" placeholder="Ingresa tu correo" required />
          <FaUser className="icon" />
        </div>

        <div className="input-box">
          <input type="password" placeholder="Ingresa tu contraseña" required />
          <FaLock className="icon" />
        </div>

        <div className="remember-forgot">
          <label>
            <input type="checkbox" />Recuérdame
          </label>
          <a href="#">Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" className="btn">Iniciar Sesión</button>

        <div className="login-register">
          <p>¿No tienes una cuenta? <a href="#">Regístrate</a></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
