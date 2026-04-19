"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Extraemos la primera letra del email para usarla de foto de perfil temporal
  const inicial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

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
              <Link href="/profile">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-sm">
                  {inicial}
                </div>
              </Link>
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
            <Link 
              href="/profile" 
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-gray-200 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {inicial}
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-semibold text-gray-800">{user.email?.split("@")[0]}</span>
                 <span className="text-xs text-gray-500">Ver perfil</span>
              </div>
            </Link>
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
