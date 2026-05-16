"use client";

import React from "react";
import { useUsuario } from "@/hooks/useUsuarios";
import { User as UserIcon } from "lucide-react";

interface UserInfoProps {
  uid: string;
  fallbackName?: string;
  fallbackPhoto?: string;
  className?: string;
}

/**
 * Muestra el avatar de un usuario en tiempo real.
 */
export function RealTimeAvatar({ uid, fallbackPhoto, fallbackName, className = "w-10 h-10" }: UserInfoProps) {
  const { usuario, loading } = useUsuario(uid);
  
  // Mientras carga o si hay error, usamos los datos de respaldo (denormalizados)
  const photo = usuario?.fotoPerfil || fallbackPhoto;
  const name = usuario?.usuario || fallbackName || "U";

  return (
    <div className={`${className} rounded-full bg-midnight flex items-center justify-center text-gold font-black overflow-hidden shrink-0 border border-white/10 shadow-sm`}>
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

/**
 * Muestra el nombre de usuario (@usuario) en tiempo real.
 */
export function RealTimeUsername({ uid, fallbackName, className = "" }: UserInfoProps) {
  const { usuario } = useUsuario(uid);
  
  const name = usuario?.usuario || fallbackName || "anónimo";

  return (
    <span className={className}>
      @{name}
    </span>
  );
}
