"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthProvider";
import { useUsuario } from "../../hooks/useUsuarios";
import { useUserPosts } from "../../hooks/usePosts";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { usuario: userData, loading: loadingUser, error: errorUser } = useUsuario(user?.uid);
  const { posts, loading: loadingPosts, error: errorPosts } = useUserPosts(user?.uid);

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
          <h1 className="text-xl font-bold text-red-600 mb-2">Error de Perfil</h1>
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
                      {userData?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-blue-600 transition opacity-0 group-hover:opacity-100 border border-gray-200">
                  <EditIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Acciones */}
              <div className="flex space-x-3">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                  Editar Perfil
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                  <SettingsIcon className="w-6 h-6" />
                </button>
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
                <div className="flex items-center">
                  <EmailIcon className="w-4 h-4 mr-2" />
                  {user?.email}
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
            <div className="flex space-x-2">
              <button className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><GridIcon /></button>
              <button className="p-2 bg-gray-200 rounded-lg text-gray-400"><ListIcon /></button>
            </div>
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
                <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <p className="text-gray-800 line-clamp-3 mb-4">{post.contenido}</p>
                  {post.adjunto && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                      <img src={post.adjunto} alt="Post content" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" /> {post.likes || 0}
                    </span>
                    <span><LocalClientDate timestamp={post.createdAt} /></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PostIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No hay publicaciones aún</h3>
              <p className="text-gray-500 mt-2">Cuando publiques algo nuevo, aparecerá en esta sección.</p>
              <Link href="/" className="mt-6 inline-block text-blue-600 font-semibold hover:underline">Ir al feed para crear una</Link>
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para crear post (igual que en el feed) */}
      <button
        onClick={() => router.push("/create-post")}
        className="fixed bottom-8 left-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 z-40 group"
        aria-label="Crear nueva publicación"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-semibold whitespace-nowrap">
          Nueva Publicación
        </span>
      </button>
    </div>
  );
}

// Componentes Icono internos
function EditIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>; }
function SettingsIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function CalendarIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function EmailIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function HeartIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>; }
function GridIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>; }
function ListIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>; }
function PostIcon({ className }: { className: string }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4v4h4" /></svg>; }

// Helper para fechas local
function LocalClientDate({ timestamp }: { timestamp: any }) {
  const [formatted, setFormatted] = useState("");
  React.useEffect(() => {
    if (timestamp?.toDate) {
      setFormatted(timestamp.toDate().toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' }));
    } else if (timestamp instanceof Date) {
      setFormatted(timestamp.toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' }));
    }
  }, [timestamp]);
  return <>{formatted || "---"}</>;
}
