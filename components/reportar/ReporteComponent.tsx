"use client";

import React, { useState, useEffect } from "react";
import "./ReporteComponent.css";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ReporteComponentProps {
  pcIdFromUrl: string | undefined;
}

function ReporteComponent({ pcIdFromUrl }: ReporteComponentProps) {
  const router = useRouter();
  // estados para el formulario y la autenticación
  const [pcId, setPcId] = useState("");
  const [sala, setSala] = useState("");
  const [computador, setComputador] = useState("");

  const [tipoProblema, setTipoProblema] = useState("computador");
  const [descripcion, setDescripcion] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // aca verificamos si hay usuario, si no hay, redirigimos al login con callback para que la url se guarde
      if (!user) {
        const callbackUrl = window.location.pathname + window.location.search;
        const redirectUrl = `/login?redirect=${encodeURIComponent(
          callbackUrl
        )}`;
        router.push(redirectUrl);
        return;
      }

      const cleanedPcId = pcIdFromUrl ? pcIdFromUrl.trim().toUpperCase() : "";

      if (cleanedPcId.startsWith("LAB") && cleanedPcId.length === 8) {
        const salaParsed = cleanedPcId.substring(3, 6);
        const pcParsed = cleanedPcId.substring(6, 8);

        setPcId(cleanedPcId);
        setSala(salaParsed);
        setComputador(pcParsed);
        setStatus("");
      } else {
        setStatus("ID de equipo no válido o no encontrado.");
      }
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [pcIdFromUrl, router]);
  // lógica para el envío del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Enviando reporte...");
    const {data: { user }} = await supabase.auth.getUser();
    if (!user) {
      setStatus("No autenticado. Por favor, inicia sesión de nuevo.");
      return;
    }
    const reporte = {
      pcId,
      sala,
      computador,
      tipoProblema,
      descripcion,
      fecha: new Date().toISOString(),
      estado: "Abierto",
    };

    try {
      const response = await fetch("/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reporte),
      });

      if (!response.ok) {
        throw new Error("Falló la respuesta del servidor");
      }

      const result = await response.json();
      console.log("Reporte enviado:", result);
      setStatus(
        `¡Reporte para el PC ${computador} de la sala ${sala} enviado con éxito!`
      );
      setDescripcion("");
      setTipoProblema("computador");
    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      setStatus("Error al enviar el reporte. Inténtalo de nuevo.");
    }
  };

  // función para cerrar sesión
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
      } else {
        // redirigimos al login después de cerrar sesión
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Error inesperado:", err.message);
    }
  };

  if (loading) {
    return <div className="loadingMessage">Verificando...</div>;
  }

  if (!pcId && status) {
    return <div className="loadingMessage">{status}</div>;
  }

  if (!pcId) {
    return <div className="loadingMessage">ID de equipo no válido.</div>;
  }

  return (
    <main className="main">
      <button onClick={handleLogout} className="logoutButton">
        Cerrar Sesión
      </button>

      <div className="container">
        <h1 className="title">Reportar Incidencia</h1>
        <div className="infoBox">
          <p className="infoLabel">Estás reportando para:</p>
          <p className="infoData">
            Computador: <span className="infoDataHighlight">{computador}</span>
          </p>
          <p className="infoData">
            Sala: <span className="infoDataHighlight">{sala}</span>
          </p>
          <p className="infoId">ID Completo: {pcId}</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div>
            <label htmlFor="tipo-problema" className="label">
              Tipo de Problema
            </label>
            <select
              id="tipo-problema"
              value={tipoProblema}
              onChange={(e) => setTipoProblema(e.target.value)}
              className="input"
              required
            >
              <option value="computador">
                Problema con el Computador (CPU)
              </option>
              <option value="monitor">Problema con el Monitor</option>
              <option value="teclado">Problema con el Teclado</option>
              <option value="mouse">Problema con el Mouse</option>
              <option value="software">Problema de Software / Sistema</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="descripcion" className="label">
              Descripción Adicional (opcional)
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="input"
              placeholder="Ej: El mouse no enciende, la pantalla se ve azul..."
            />
          </div>

          <button
            type="submit"
            disabled={!pcId || status.includes("Enviando")}
            className="submitButton"
          >
            {status.includes("Enviando") ? "Enviando..." : "Enviar Reporte"}
          </button>
        </form>

        {status && <p className="statusMessage">{status}</p>}
      </div>
    </main>
  );
}

export default ReporteComponent;
