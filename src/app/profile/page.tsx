"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthProvider";

/**
 * Esta página redirige automáticamente al perfil específico del usuario autenticado.
 * Ejemplo: /profile -> /profile/[mi-id]
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Si no está cargando y no hay usuario, mandamos a login
    // Si hay usuario, mandamos a su ruta dinámica
    if (user === null) {
      router.push("/login");
    } else if (user?.uid) {
      router.push(`/profile/${user.uid}`);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold shadow-sm"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Cargando tu perfil...</p>
      </div>
    </div>
  );
}
