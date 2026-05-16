"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthProvider";
import { usePathname } from "next/navigation";
import { useUsuario } from "@/hooks/useUsuarios";
import { logout } from "@/app/actions/logout";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, ChevronDown, LayoutGrid } from "lucide-react";

/**
 * DashboardLayout: Proporciona la estructura base de la aplicación.
 * Incluye el encabezado móvil, la barra lateral/botones de navegación desktop,
 * y gestiona el estado del menú de perfil con un patrón de "Overlay" para máxima compatibilidad.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const uid = user?.uid;
  const { usuario } = useUsuario(uid);

  // Automatizar cierre al cambiar de ruta
  const pathname = usePathname();
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // 1. Cerramos sesión en el servidor (borra las cookies de sesión mediante Server Action)
      await logout();
      // 2. Cerramos sesión en el cliente (Firebase Auth se encarga de limpiar el estado local)
      await signOut(auth);
      
      // Cerramos el menú una vez completada la acción para evitar desequilibrios en el DOM
      setIsMenuOpen(false);
      
      toast.success("Has cerrado sesión satisfactoriamente");
      router.push("/login");
    } catch (err) {
      toast.error("Error al cerrar sesión");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 relative font-sans">
      <div className="flex flex-1 flex-col overflow-y-auto w-full relative">
        {/* ENCABEZADO MÓVIL (Visible solo en pantallas pequeñas) */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 py-3 lg:hidden shadow-sm w-full">
          <div className="flex items-center gap-2">
            <span className="bg-midnight p-2 rounded-xl shadow-lg ring-4 ring-midnight/5">
              <LayoutGrid className="w-5 h-5 text-gold" strokeWidth={3} />
            </span>
            <span className="text-xl font-black text-midnight tracking-tighter uppercase">SocialClub</span>
          </div>

          {/* BOTÓN PERFIL / LOGIN (MÓVIL) - Se muestra solo en dispositivos pequeños */}
          <div className="relative lg:hidden">
            {user ? (
              <>
                {/* Avatar circular con efecto de scale en tap para feedback táctil */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 rounded-full bg-midnight text-gold border border-white/10 flex items-center justify-center font-black shadow-lg overflow-hidden focus:outline-none transition-transform active:scale-90"
                >
                  {usuario?.fotoPerfil ? (
                    <img src={usuario.fotoPerfil} alt={usuario.usuario || "Perfil"} className="w-full h-full object-cover" />
                  ) : (
                    usuario?.usuario?.charAt(0).toUpperCase() || "U"
                  )}
                </button>

                {/* 
                  CAPA DE CIERRE (OVERLAY):
                  Pattern de capa invisible para cerrar el menú al tocar fuera.
                  Es la solución más robusta para móviles (evita interferencias de eventos mousedown/click).
                */}
                {isMenuOpen && (
                  <div 
                    className="fixed inset-0 z-[90] bg-black/5 backdrop-blur-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }} 
                  />
                )}

                {/* 
                  DESPLEGABLE MÓVIL (Premium Midnight Design):
                  - Posicionamiento absoluto respecto al avatar.
                  - onClick stopPropagation: Evita que el clic "atraviese" el menú hacia el overlay.
                */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-64 glass-midnight rounded-[2.5rem] py-3 z-[100] overflow-hidden animate-menu-appear-mobile origin-top-right border-2 border-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-5 border-b border-white/10 mb-2">
                       <p className="text-sm font-extrabold text-white truncate mb-0.5">{usuario?.nombre || usuario?.usuario}</p>
                       <p className="text-[10px] text-gold font-black uppercase tracking-widest">Usuario</p>
                    </div>

                    <div className="px-3 space-y-2">
                      {/* Botón de acceso al perfil con iconografía Lucide */}
                      <button 
                        onClick={() => router.push(`/profile/${user.uid}`)}
                        className="flex items-center gap-4 px-5 py-4 text-sm font-black text-slate-100 hover:bg-gold hover:text-midnight active:scale-95 rounded-2xl transition-all duration-300 w-full text-left uppercase tracking-widest group"
                      >
                        <UserIcon className="w-5 h-5 text-gold group-hover:text-midnight" strokeWidth={3} />
                        Mi Perfil
                      </button>
                      
                      {/* Botón de salida con feedback destructivo (color rojo) */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-5 py-4 text-sm font-black text-red-400 hover:bg-red-500 hover:text-white active:scale-95 rounded-2xl transition-all duration-300 w-full text-left uppercase tracking-widest group"
                      >
                        <LogOut className="w-5 h-5" strokeWidth={3} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className="btn-premium px-5 py-2 !text-[9px]">
                Entrar
              </Link>
            )}
          </div>
        </header>

        {/* BOTÓN FLOTANTE PERFIL / LOGIN (DESKTOP) */}
        <div className="hidden lg:block absolute top-6 right-8 z-50">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border transition-all cursor-pointer group focus:outline-none ${isMenuOpen ? "border-gold ring-4 ring-gold-soft/30" : "border-slate-200"}`}
              >
                <div className="w-10 h-10 rounded-full bg-midnight text-gold flex items-center justify-center font-black text-lg group-hover:bg-gold transition-colors overflow-hidden border border-white/10">
                  {usuario?.fotoPerfil ? (
                    <img src={usuario.fotoPerfil} alt={usuario.usuario || "Perfil"} className="w-full h-full object-cover" />
                  ) : (
                    usuario?.usuario?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-midnight tracking-tight">{"@" + usuario?.usuario}</span>
                  <div className="flex items-center gap-1">
                    <ChevronDown className={`w-3 h-3 text-gold transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} strokeWidth={3} />
                  </div>
                </div>
              </button>

              {/* OVERLAY DESKTOP */}
              {isMenuOpen && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMenuOpen(false)} 
                />
              )}

              {/* DESPLEGABLE DESKTOP */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 mt-3 w-64 glass-midnight rounded-[2rem] py-2 z-50 overflow-hidden animate-menu-appear origin-top-right shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-5 border-b border-white/10 mb-2">
                    <p className="text-gold font-black uppercase tracking-[0.2em] text-[10px] mb-1">Usuario</p>
                    <p className="text-sm font-extrabold text-white truncate">{usuario?.nombre || usuario?.usuario}</p>
                    <p className="text-xs text-slate-400 truncate font-medium">@{usuario?.usuario}</p>
                  </div>
                  
                  <div className="px-3 space-y-1">
                    <Link 
                      href={`/profile/${user.uid}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-200 hover:bg-gold hover:text-midnight rounded-2xl transition-all duration-300 group/item uppercase tracking-widest"
                    >
                      <UserIcon className="w-4 h-4 text-gold group-hover:text-midnight" strokeWidth={3} />
                      Ver mi perfil
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-black text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 w-full text-left group/item uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={3} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-premium"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL: bg-slate-100 para contraste con cards blancas */}
        <main className="flex-1 w-full pt-4 sm:pt-8 bg-slate-100 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
