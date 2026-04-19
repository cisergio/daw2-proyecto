"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Página de perfil</h1>
        {user && (
          <p className="text-gray-600 mb-4 font-medium">
            Sesión iniciada como: <span className="text-blue-600">{user.email}</span>
          </p>
        )}
        <p className="text-gray-600 mb-8">
          Esta página está actualmente en desarrollo. Pronto podrás gestionar aquí todos tus datos y preferencias.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Volver al Feed
        </Link>
      </div>
    </div>
  );
}
