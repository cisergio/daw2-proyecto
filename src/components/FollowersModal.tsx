"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/config";
import { X, UserPlus, UserCheck } from "lucide-react";
import { RealTimeAvatar, RealTimeUsername } from "./UserInfo";
import Link from "next/link";
import { useAuth } from "../context/AuthProvider";
import { useEsSeguidor } from "../hooks/useEsSeguidor";
import { seguirUsuario } from "../app/actions/seguirUsuario";
import { dejarDeSeguirUsuario } from "../app/actions/dejarDeSeguirUsuario";
import { toast } from "sonner";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string; // UID del perfil del cual cargaremos la lista
  type: "seguidores" | "seguidos"; // Dirección del listado
}

interface UserListItem {
  uid: string;
  nombre: string;
  usuario: string;
  fotoPerfil: string;
}

export default function FollowersModal({ isOpen, onClose, uid, type }: FollowersModalProps) {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const segRef = collection(firestore, "seguidores");
        // Consulta según el tipo de listado
        const q = type === "seguidores" 
          ? query(segRef, where("seguidoId", "==", uid))
          : query(segRef, where("seguidorId", "==", uid));

        const querySnap = await getDocs(q);
        
        // Obtener perfiles de usuarios de forma paralela y eficiente
        const profilesPromises = querySnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const targetUid = type === "seguidores" ? data.seguidorId : data.seguidoId;
          
          const userDocRef = doc(firestore, "usuarios", targetUid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return {
              uid: targetUid,
              nombre: `${userData.nombre || ""} ${userData.apellidos || ""}`.trim(),
              usuario: userData.usuario || "usuario",
              fotoPerfil: userData.fotoPerfil || "",
            };
          }
          return null;
        });

        const profiles = await Promise.all(profilesPromises);
        setUsersList(profiles.filter((p): p is UserListItem => p !== null));
      } catch (err) {
        console.error("Error al cargar lista de usuarios:", err);
        toast.error("No se pudo cargar la lista");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, uid, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscurecido con Blur Premium */}
      <div className="fixed inset-0 bg-midnight/60 backdrop-blur-md" onClick={onClose} />

      {/* Tarjeta del Modal (Estética SocialClub) */}
      <div className="bg-white rounded-[2rem] max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 relative z-10 animate-menu-appear-mobile">
        {/* Header del Modal */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-midnight tracking-tighter capitalize">
              {type === "seguidores" ? "Seguidores" : "Personas seguidas"}
            </h3>
            <p className="text-[10px] text-gold font-black uppercase tracking-widest mt-0.5">
              {usersList.length} {usersList.length === 1 ? "usuario" : "usuarios"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 hover:bg-gold-soft hover:text-gold text-slate-400 rounded-2xl transition-all"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Cuerpo del Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando...</p>
            </div>
          ) : usersList.length > 0 ? (
            usersList.map((item) => (
              <div key={item.uid} className="flex items-center justify-between group">
                <Link 
                  href={`/profile/${item.uid}`} 
                  onClick={onClose}
                  className="flex items-center gap-4 flex-1 mr-4 focus:outline-none"
                >
                  <RealTimeAvatar 
                    uid={item.uid} 
                    fallbackPhoto={item.fotoPerfil} 
                    fallbackName={item.usuario} 
                    className="w-12 h-12 rounded-xl border border-slate-100 group-hover:scale-105 transition-transform"
                  />
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-midnight truncate text-sm leading-tight group-hover:text-gold transition-colors">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      @{item.usuario}
                    </p>
                  </div>
                </Link>

                {/* Botón rápido Seguir/Dejar de seguir para otros usuarios en la lista */}
                {user && user.uid !== item.uid && (
                  <QuickFollowButton myUid={user.uid} targetUid={item.uid} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                No hay usuarios aquí
              </p>
              <p className="text-xs text-gold-accent opacity-50 mt-1">
                La lista está vacía actualmente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponente de botón rápido de seguimiento dentro del modal
function QuickFollowButton({ myUid, targetUid }: { myUid: string; targetUid: string }) {
  const { esSeguidor, loading } = useEsSeguidor(myUid, targetUid);
  const [actionLoading, setActionLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (actionLoading) return;

    setActionLoading(true);
    if (esSeguidor) {
      const res = await dejarDeSeguirUsuario(myUid, targetUid);
      if (res.success) {
        toast.success("Has dejado de seguir a este usuario");
      } else {
        toast.error(res.error || "Ocurrió un error");
      }
    } else {
      const res = await seguirUsuario(myUid, targetUid);
      if (res.success) {
        toast.success("Ahora sigues a este usuario");
      } else {
        toast.error(res.error || "Ocurrió un error");
      }
    }
    setActionLoading(false);
  };

  if (loading) {
    return <div className="w-10 h-10 rounded-xl bg-slate-50 animate-pulse" />;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={actionLoading}
      className={`p-3 rounded-xl transition-all ${
        esSeguidor 
          ? "bg-midnight/10 text-midnight hover:bg-red-50 hover:text-red-500" 
          : "bg-midnight text-gold hover:bg-gold hover:text-midnight"
      }`}
      title={esSeguidor ? "Dejar de seguir" : "Seguir"}
    >
      {esSeguidor ? (
        <UserCheck className="w-4 h-4" strokeWidth={2.5} />
      ) : (
        <UserPlus className="w-4 h-4" strokeWidth={2.5} />
      )}
    </button>
  );
}
