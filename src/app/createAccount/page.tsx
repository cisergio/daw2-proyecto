"use client";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import crearUsuario from "../actions/creacionUsuario";
import { useRouter } from "next/navigation";

export default function CreateAccount() {
  const [email, setEmail] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSingUp = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const promise = async () => {
        // 1. Crear usuario en la base de datos (Server Action)
        const res = await crearUsuario(nombre, apellidos, usuario, email, password);
        if (!res.success) throw new Error(res.error);
        
        // 3. Cerrar sesión automáticamente (opcional, según tu flujo)
        await signOut(auth);
        
        return "Cuenta creada correctamente. ¡Ya puedes iniciar sesión!";
      };

      toast.promise(promise(), {
        loading: "Creando tu cuenta...",
        success: (msg) => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`); // Redirigir a verificación
          return msg;
        },
        error: (err) => err.message || "No se pudo crear la cuenta",
      });
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
              stroke="url(#gold-gradient)"
              className="w-8 h-8"
            >
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
          </div>
        </div>
        
        <h2 className="form-title !text-3xl lg:!text-4xl">Únete al Club</h2>
        <p className="form-subtitle">Forma parte de la comunidad Juan de Colonia</p>

        <form onSubmit={handleSingUp} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-input-group">
              <label htmlFor="name" className="input-label">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Nombre"
                pattern="^[A-Za-zÀ-ÿñÑ\s]+$"
                title="Dudo que tu nombre tenga esos caracteres"
              />
            </div>

            <div className="form-input-group">
              <label htmlFor="apellidos" className="input-label">
                Apellidos
              </label>
              <input
                id="apellidos"
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
                placeholder="Apellidos"
                pattern="^[A-Za-zÀ-ÿñÑ]+(?:\s[A-Za-zÀ-ÿñÑ]+)+$"
                title="Debes introducir tus dos apellidos separados por un espacio"
              />
            </div>
          </div>

          <div className="form-input-group">
            <label htmlFor="usuario" className="input-label">
              Nombre de Usuario (@)
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              placeholder="p. ej. juan_de_colonia"
              pattern="[a-zA-ZÀ-ÿñÑ0-9._\-]{2,20}"
              title="Letras, números, guiones y puntos. Max 20."
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="email" className="input-label">
              Correo Institucional
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@educa.jcyl.es"
              className="border-gold/30 bg-gold/5"
            />
            <p className="text-[9px] text-slate-400 mt-1 px-1 font-medium">Requerido: @educa.jcyl.es</p>
          </div>

          <div className="form-input-group">
            <label htmlFor="password" className="input-label">
              Contraseña Segura
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              pattern="[\s\S]{6,50}"
              title="Mínimo 6 caracteres"
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit" 
              className="form-button group relative overflow-hidden" 
              disabled={isPending}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando Cuenta...
                  </>
                ) : (
                  "Finalizar Registro"
                )}
              </span>
            </button>

            <div className="text-center">
              <Link href="/login" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-midnight transition-colors">
                ¿Ya tienes cuenta? <span className="text-gold">Inicia Sesión</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
