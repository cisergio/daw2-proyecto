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
                  d="M9.75 3.104v... (resto del SVG omitido por brevedad)..."
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
