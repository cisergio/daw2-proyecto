"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";
import { useUsuario } from "../../../hooks/useUsuarios";
import { useUserPosts } from "../../../hooks/usePost";
import { darLike } from "../../actions/darLike";
import { toast } from "sonner";

export default function UserProfilePage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  // Cargamos los datos del usuario especificado en la URL
  const { usuario: userData, loading: loadingUser, error: errorUser } = useUsuario(uid as string);
  const { posts, loading: loadingPosts, error: errorPosts, updatePost } = useUserPosts(uid as string);

  const isMyProfile = user?.uid === uid;

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info("Inicia sesión para dar like");
      router.push("/login");
      return;
    }

    const result = await darLike(postId, user.uid);
    if (result?.success) {
      const isAdded = result.type === "added";
      
      updatePost(postId, {
        likes: isAdded 
          ? (posts.find(p => p.id === postId)?.likes || 0) + 1 
          : Math.max(0, (posts.find(p => p.id === postId)?.likes || 0) - 1),
        likedByMe: isAdded
      });

      if (isAdded) {
        toast.success("¡Te gusta este post!");
      } else {
        toast.success("Has quitado tu like");
      }
    } else {
      toast.error(result?.error || "Error al procesar el like");
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (errorUser && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-2">Usuario no encontrado</h1>
          <p className="text-gray-600 mb-6">{errorUser}</p>
          <Link href="/" className="text-blue-600 hover:underline font-medium">Volver al Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Portada */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        {userData?.fotoPortada && (
          <img 
            src={userData.fotoPortada} 
            alt="Portada" 
            className="w-full h-full object-cover opacity-60"
          />
        )}
      </div>

      {/* Info de Perfil */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between space-y-4 md:space-y-0">
              {/* Foto de Perfil */}
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-8 border-white bg-blue-100 flex items-center justify-center overflow-hidden shadow-lg">
                  {userData?.fotoPerfil ? (
                    <img 
                      src={userData.fotoPerfil} 
                      alt={userData?.usuario} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-blue-600">
                      {userData?.nombre?.[0]?.toUpperCase() || userData?.usuario?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-3">
                {isMyProfile ? (
                  <>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                      Editar Perfil
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                      <SettingsIcon className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <button className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md hover:shadow-lg active:scale-95">
                    Seguir
                  </button>
                )}
              </div>
            </div>

            {/* Texto y Bio */}
            <div className="mt-8 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                {userData?.nombre} {userData?.apellidos}
              </h1>
              <p className="text-lg text-gray-500 font-medium tracking-tight">
                @{userData?.usuario || userData?.uaurio || "usuario"}
              </p>
              
              {userData?.biografia && (
                <p className="mt-4 text-gray-700 max-w-2xl leading-relaxed">
                  {userData.biografia}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Se unió <LocalClientDate timestamp={userData?.creacion} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-8">
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">{posts.length}</div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Posts</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {userData?.seguidores || 0}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Seguidores</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {userData?.seguidos || 0}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">Seguidos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listado de Posts */}
        <div className="mt-12 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              Publicaciones
              <span className="ml-3 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm rounded-full">{posts.length}</span>
            </h2>
          </div>

          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer active:scale-[0.99] relative overflow-hidden">
                  <Link href={`/post/${post.id}`} className="block p-6 h-full w-full">
                    <p className="text-gray-800 line-clamp-3 mb-4 group-hover:text-black transition-colors">{post.contenido}</p>
                    {post.adjunto && (
                      <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                        <img src={post.adjunto} alt="Post content" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                      <button 
                        onClick={(e) => handleLike(e, post.id)}
                        className={`flex items-center space-x-1.5 transition-colors group/like ${
                          post.likedByMe ? "text-red-500" : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <HeartIcon className={`w-4 h-4 transition-all group-active/like:scale-90 ${
                          post.likedByMe ? "fill-red-500" : ""
                        }`} /> 
                        <span className={`font-bold ${post.likedByMe ? "text-red-600" : ""}`}>
                          {post.likes || 0}
                        </span>
                      </button>
                      <span className="group-hover:text-gray-600 transition-colors"><LocalClientDate timestamp={post.createdAt} /></span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">No hay publicaciones aún</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes Icono internos
function SettingsIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function CalendarIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function HeartIcon({ className }: { className: string }) { return <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>; }

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
