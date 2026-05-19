"use client";
import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { verificacionCodigo, enviarCorreoConfirmacion } from "../actions/verificationActions";
import Link from "next/link";

function VerifyEmailContent() {
  const [code, setCode] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isResending, startResending] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("El código debe tener 6 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await verificacionCodigo(email, code.toUpperCase());
      if (res.success) {
        toast.success(res.message);
        router.push("/login");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleResend = () => {
    startResending(async () => {
      const res = await enviarCorreoConfirmacion(email);
      if (res.success) {
        toast.success("Código reenviado. Revisa tu bandeja de entrada.");
      } else {
        toast.error("No se pudo reenviar el código.");
      }
    });
  };

  return (
    <div className="form-container bg-slate-50/50">
      <div className="form-card shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border-none">
        <div className="form-header flex justify-center mb-8">
          <div className="bg-midnight p-4 rounded-3xl shadow-xl shadow-midnight/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="url(#gold-gradient-verify)"
              className="w-8 h-8"
            >
              <defs>
                <linearGradient id="gold-gradient-verify" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>
        </div>

        <h2 className="form-title">Verifica tu Correo</h2>
        <p className="form-subtitle">Hemos enviado un código a {email}</p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="form-input-group">
            <label htmlFor="code" className="input-label text-center">
              Código de 6 dígitos
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="Ej: A1B2C3"
              className="text-center text-2xl font-black tracking-[0.5em] uppercase placeholder:tracking-normal placeholder:text-sm placeholder:font-medium"
              maxLength={6}
            />
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              className="form-button"
              disabled={isPending}
            >
              {isPending ? "Verificando..." : "Verificar Código"}
            </button>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-gold transition-colors disabled:opacity-50"
              >
                {isResending ? "Reenviando..." : "¿No has recibido nada? Reenviar"}
              </button>

              <Link
                href="/createAccount"
                className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-midnight transition-colors"
              >
                Volver al registro
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
