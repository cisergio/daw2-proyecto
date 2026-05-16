"use client";
import { useState, useTransition } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const toastId = toast.loading("Iniciando sesión...");
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("¡Bienvenido de nuevo!", { id: toastId });
        router.push("/");
      } catch (error: any) {
        toast.error("Credenciales incorrectas. Verifica tu email y contraseña.", { id: toastId });
        console.error("Error de autenticación:", error.code, error.message);
      }
    });
  };

  return (
    <div className="form-container">
      <div className="max-w-md w-full mx-auto">
        <div className="form-card">
          <div className="flex justify-center mb-10">
            <span className="bg-midnight p-5 rounded-2xl shadow-2xl ring-8 ring-midnight/5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                className="w-8 h-8"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
          </div>
          <h2 className="form-title">
            SocialClub
          </h2>
          <p className="form-subtitle">
            Acceso de Usuarios
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="input-label"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="input-label"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-right">
                <Link
                  href="/createAccount"
                  className="text-gold-accent hover:text-midnight transition-colors"
                >
                  ¿No tienes una cuenta?
                </Link>
              </div>

              <div className="text-right">
                <Link
                  href="/reset-password"
                  className="text-gold-accent hover:text-midnight transition-colors"
                >
                  ¿Has olvidado tu contraseña?
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="form-button"
              >
                {isPending ? "Validando..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <Link 
              href="/" 
              className="btn-ghost flex items-center justify-center gap-2 !text-[9px] font-black uppercase tracking-widest transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Ir a Principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
