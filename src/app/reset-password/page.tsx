"use client";
import React, { useState } from "react";
import Link from "next/link";
import { auth } from "../../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState<string>("");
  const [enviado, setEnviado] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviado(false);

    if (!email) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
    } catch (error: any) {
      console.error("Error al enviar el correo", error);
      setError(
        "No se pudo enviar el correo. Revisa que la dirección sea correcta."
      );
    }
  };

  return (
    <div className="form-container">
      <div className="form-card text-center">
        <h2 className="form-title mb-2">¿Olvidaste tu contraseña?</h2>
        <p className="form-subtitle">
          Introduce tu email para recuperar tu cuenta.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="form-input-group">
            <label htmlFor="email" className="sr-only">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <button type="submit" className="form-button">
              Enviar Correo de Recuperación
            </button>
          </div>
        </form>

        {enviado && (
          <div className="form-success mt-4 text-left">
            <p className="font-semibold">¡Correo enviado!</p>
            <p className="text-sm">
              Revisa tu bandeja de entrada (y spam) para continuar.
            </p>
          </div>
        )}

        {error && (
          <div className="form-error mt-4 text-left">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 text-sm">
          <Link href="/login" className="form-link">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
