"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthProvider";
import { usePathname } from "next/navigation";
import { useUsuario } from "@/hooks/useUsuarios";
import { logout } from "@/app/actions/logout";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Verificamos si estamos en EL PERFIL PROPIO
  // El pathname será /profile/[uid] gracias a nuestra refactorización anterior
  const isMyProfilePage = user?.uid && pathname === `/profile/${user.uid}`;
  
  const uid = user?.uid;
  const { usuario } = useUsuario(uid);

  const handleLogout = async () => {
    try {
      // 1. Cerramos sesión en el servidor (borra cookies)
      await logout();
      // 2. Cerramos sesión en el cliente (Firebase Auth)
      await signOut(auth);
      
      toast.success("Has cerrado sesión satisfactoriamente");
      router.push("/login");
    } catch (err) {
      toast.error("Error al cerrar sesión");
      console.error(err);
    }
  };
  // Extraemos la primera letra del email para usarla de foto de perfil temporal
  const inicial = usuario?.usuario ? usuario.usuario.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <div className="flex flex-1 flex-col overflow-y-auto w-full relative">
        {/* ENCABEZADO MÓVIL (Visible solo en pantallas pequeñas) */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden shadow-sm w-full">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            </span>
            <span className="text-lg font-semibold text-gray-800">SocialClub</span>
          </div>

          {/* BOTÓN PERFIL / LOGIN (MÓVIL) */}
          <div>
            {user ? (
              isMyProfilePage ? (
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                </button>
              ) : (
                <Link href="/profile">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-sm overflow-hidden">
                    {usuario?.fotoPerfil ? (
                      <img src={usuario.fotoPerfil} alt={usuario.usuario || "Perfil"} className="w-full h-full object-cover" />
                    ) : (
                      usuario?.usuario?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                </Link>
              )
            ) : (
              <Link href="/login" className="text-sm font-semibold text-blue-600 border border-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 transition">
                Entrar
              </Link>
            )}
          </div>
        </header>

        {/* BOTÓN FLOTANTE PERFIL / LOGIN (DESKTOP) */}
        <div className="hidden lg:block absolute top-6 right-8 z-50">
          {user ? (
            isMyProfilePage ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-red-100 hover:bg-red-50 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg group-hover:bg-red-600 group-hover:text-white transition-colors overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-red-600">Cerrar Sesión</span>
                  <span className="text-xs text-red-400">@{usuario?.usuario}</span>
                </div>
              </button>
            ) : (
              <Link
                href="/profile"
                className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-gray-200 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden">
                  {usuario?.fotoPerfil ? (
                    <img src={usuario.fotoPerfil} alt={usuario.usuario || "Perfil"} className="w-full h-full object-cover" />
                  ) : (
                    usuario?.usuario?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{"@" + usuario?.usuario}</span>
                  <span className="text-xs text-gray-500">Ver perfil</span>
                </div>
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 w-full pt-4 sm:pt-8 bg-gray-100 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
