"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";
import { useUsuario } from "../../../hooks/useUsuarios";
import { useUserPosts } from "../../../hooks/usePost";
import { toast } from "sonner";
import LikeButton from "../../../components/LikeButton";
import { RealTimeAvatar, RealTimeUsername } from "../../../components/UserInfo";
import { ArrowLeft, Settings, Calendar, MessageCircle } from "lucide-react";

export default function UserProfilePage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  // Cargamos los datos del usuario especificado en la URL
  const { usuario: userData, loading: loadingUser, error: errorUser } = useUsuario(uid as string);
  const { posts, loading: loadingPosts, error: errorPosts } = useUserPosts(uid as string);

  const isMyProfile = user?.uid === uid;

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-40 h-40 bg-slate-200 rounded-full mb-6"></div>
          <div className="h-6 w-64 bg-slate-200 rounded-2xl mb-3"></div>
          <div className="h-4 w-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (errorUser && !userData) {
    return (
      <div className="form-container text-center">
        <div className="form-card">
          <h1 className="text-2xl font-black text-red-600 mb-3 tracking-tight">Usuario no encontrado</h1>
          <p className="form-subtitle">{errorUser}</p>
          <Link href="/" className="btn-premium inline-flex mt-6">Ir a Principal</Link>
        </div>
      </div>
    );
  }

  return (
    /* bg-slate-100: Consistencia premium en toda la app */
    <main className="min-h-screen bg-slate-100 pb-20 font-sans">
      {/* Header / Portada */}
      <div className="h-64 md:h-80 bg-midnight relative overflow-hidden">
        {/* Botón Volver */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 md:top-8 md:left-8 z-30 flex items-center group"
        >
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-gold group-hover:border-gold transition-all duration-500 shadow-2xl">
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-midnight transition-colors" strokeWidth={3} />
          </div>
          <span className="ml-4 text-white font-black tracking-tighter opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">IR A PRINCIPAL</span>
        </Link>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-midnight/80"></div>
        {userData?.fotoPortada ? (
          <img 
            src={userData.fotoPortada} 
            alt="Portada" 
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent"></div>
        )}
      </div>

      {/* Info de Perfil */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="card-premium">
          {/* Header Responsivo: Se adapta de columna en móvil a fila en desktop */}
          <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10">
            {/* Foto de Perfil */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] md:border-[10px] border-white bg-midnight flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {userData?.fotoPerfil ? (
                    <img 
                      src={userData.fotoPerfil} 
                      alt={userData?.usuario} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-black text-gold tracking-tighter">
                      {userData?.nombre?.[0]?.toUpperCase() || userData?.usuario?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {/* Acciones */}
              <div className="flex space-x-4">
                {isMyProfile ? (
                  <>
                    <Link href="/profile/edit" className="btn-premium">
                      Editar Perfil
                    </Link>
                    <button className="btn-ghost !p-4">
                      <Settings className="w-6 h-6" strokeWidth={2} />
                    </button>
                  </>
                ) : (
                  <button className="btn-premium px-10 py-4 !text-xs">
                    Seguir Usuario
                  </button>
                )}
              </div>
            </div>

            {/* Texto y Bio */}
            <div className="mt-8 md:mt-10 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black text-midnight tracking-tighter leading-none mb-2 px-4 md:px-0">
                {userData?.nombre} {userData?.apellidos}
              </h1>
              <p className="text-xl text-gold font-black tracking-tight mb-6">
                @{userData?.usuario || "usuario"}
              </p>
              
              {userData?.biografia && (
                <p className="mt-6 text-slate-600 max-w-2xl leading-relaxed text-lg font-medium italic">
                  "{userData.biografia}"
                </p>
              )}

              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-8">
                <div className="flex items-center text-gold-accent">
                  <Calendar className="w-4 h-4 mr-2.5 text-gold" strokeWidth={2} />
                  Se unió <span className="ml-1.5 text-slate-600"><LocalClientDate timestamp={userData?.creacion} /></span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 md:mt-12 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-8 md:pt-10">
              <div className="text-center group cursor-pointer px-2">
                <div className="text-xl md:text-3xl font-black text-midnight group-hover:text-gold transition-colors tracking-tighter">{posts.length}</div>
                <div className="text-[10px] md:text-xs text-gold-accent mt-1 opacity-60">Posts</div>
              </div>
              <div className="text-center group cursor-pointer px-2">
                <div className="text-xl md:text-3xl font-black text-midnight group-hover:text-gold transition-colors tracking-tighter">
                  {userData?.seguidores || 0}
                </div>
                <div className="text-[10px] md:text-xs text-gold-accent mt-1 opacity-60">Seguidores</div>
              </div>
              <div className="text-center group cursor-pointer px-2">
                <div className="text-xl md:text-3xl font-black text-midnight group-hover:text-gold transition-colors tracking-tighter">
                  {userData?.seguidos || 0}
                </div>
                <div className="text-[10px] md:text-xs text-gold-accent mt-1 opacity-60">Seguidos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listado de Posts */}
        <div className="mt-20 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl md:text-3xl font-black text-midnight tracking-tighter flex items-center">
              Publicaciones
              <span className="ml-4 md:ml-5 px-3 md:px-4 py-1 bg-gold-soft text-gold text-[10px] md:text-xs font-black rounded-full shadow-sm ring-1 ring-gold/10 tabular-nums">{posts.length}</span>
            </h2>
          </div>

          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm"></div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div key={post.id} className="card-premium hover:border-gold/30 group cursor-pointer relative flex flex-col">
                  <Link href={`/post/${post.id}`} className="block p-6 md:p-8 h-full w-full">
                    <div className="flex items-center space-x-3 mb-4">
                      <RealTimeAvatar 
                        uid={uid as string} 
                        fallbackPhoto={userData?.fotoPerfil} 
                        fallbackName={userData?.usuario}
                        className="w-10 h-10 border border-white/10"
                      />
                      <RealTimeUsername 
                        uid={uid as string} 
                        fallbackName={userData?.usuario} 
                        className="font-bold text-midnight text-sm"
                      />
                    </div>
                    <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed line-clamp-4 mb-6 md:mb-8 group-hover:text-midnight transition-colors">{post.contenido}</p>
                    {post.adjunto && (
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-8 bg-slate-50 border border-slate-100 p-1">
                        <img src={post.adjunto} alt="Post content" className="w-full h-full object-cover rounded-[1.25rem] group-hover:scale-105 transition duration-1000" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                      <div className="flex items-center space-x-4">
                        <LikeButton postId={post.id} initialLikes={post.likes} />
                        <div className="flex items-center space-x-1.5 text-slate-400 font-bold">
                          <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
                          <span className="text-xs">{post.numComments || 0}</span>
                        </div>
                      </div>
                      <span className="text-gold-accent opacity-50 group-hover:opacity-100 transition-opacity"><LocalClientDate timestamp={post.createdAt} /></span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-premium p-20 text-center border-4 border-dashed border-slate-100 bg-transparent flex flex-col items-center justify-center">
              <h3 className="text-2xl font-black text-midnight tracking-tighter mb-3">No hay publicaciones aún</h3>
              <p className="text-gold-accent opacity-40">Este usuario está siendo discreto</p>
            </div>
          )}
        </div>
    </main>
  );
}


// Helper para fechas local
function LocalClientDate({ timestamp }: { timestamp: any }) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    if (timestamp?.toDate) {
      setFormatted(timestamp.toDate().toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' }));
    } else if (timestamp instanceof Date) {
      setFormatted(timestamp.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' }));
    }
  }, [timestamp]);
  return <>{formatted || "---"}</>;
}
