"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { auth } from "../../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";

export default function ResetPassword() {
  const [email, setEmail] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, introduce tu correo electrónico.");
      return;
    }

    startTransition(async () => {
      const promise = sendPasswordResetEmail(auth, email);

      toast.promise(promise, {
        loading: "Enviando correo de recuperación...",
        success: "¡Correo enviado! Revisa tu bandeja de entrada.",
        error: "No se pudo enviar el correo. Revisa que la dirección sea correcta.",
      });
    });
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
            <button 
              type="submit" 
              disabled={isPending}
              className="form-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Enviando..." : "Enviar Correo de Recuperación"}
            </button>
          </div>
        </form>


        <div className="mt-6 text-sm">
          <Link href="/login" className="form-link">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
