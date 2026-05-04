"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { darLike } from "./actions/darLike";
import { toast } from "sonner";

export default function Feed() {
  const { 
    posts, 
    loading, 
    hasMore, 
    getInitialPosts, 
    getMorePosts, 
    pendingPosts, 
    showNewPosts,
    updatePost
  } = usePost();
  const { user } = useAuth();
  const router = useRouter();

  const handleCreatePost = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/create-post");
    }
  };

  const handleUpdateFeed = () => {
    showNewPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // Referencia para guardar la instancia de la API de IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // 1. Cargar posts iniciales al montar la pantalla
  useEffect(() => {
    getInitialPosts();
  }, [getInitialPosts]);

  // 2. Definir una referencia con callback para el ÚLTIMO post renderizado
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Si estamos cargando datos, no disparamos nuevas peticiones
      if (loading) return;

      // Si había un observador prevío vigilando, lo desconectamos
      if (observerRef.current) observerRef.current.disconnect();

      // Creamos un nuevo observador
      observerRef.current = new IntersectionObserver((entries) => {
        // isIntersecting es true cuando el elemento entra en la pantalla del usuario
        if (entries[0].isIntersecting && hasMore) {
          getMorePosts(); // Al detectar fondo, pedimos más
        }
      });

      // Si existe el nodo (último post) le decimos al observador que lo vigile
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, getMorePosts]
  );

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
      
      // Actualizamos el estado local inmediatamente
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

  return (
    // Usa un contenedor de fondo gris claro de Tailwind para el diseño tipo feed
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Feed</h1>
        
        {/* NOTIFICACIÓN DE POSTS NUEVOS (Estilo Twitter Premium) */}
        {pendingPosts.length > 0 && (
          <div className="notification-badge-float animate-slide-down-fade">
            <button
              onClick={handleUpdateFeed}
              className="bg-blue-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 font-semibold flex items-center gap-2 border border-white/20 ring-4 ring-blue-600/10"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-5 h-5 animate-bounce"
              >
                <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
              </svg>
              <span>Mostrar {pendingPosts.length} {pendingPosts.length === 1 ? "publicación nueva" : "publicaciones nuevas"}</span>
            </button>
          </div>
        )}
        
        {/* Recorremos todos los posts */}
        {posts.map((post, index) => {
          // Detectamos si el post actual es el MISMO último del array
          const isLastElement = posts.length === index + 1;
          
          return (
            <div 
              key={post.id} 
              // ¡Aquí es donde atamos la función observadora al DOM si es el último!
              ref={isLastElement ? lastPostElementRef : null}
              // Tarjeta blanca y limpia al estilo de las clases de index.css
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.99] group cursor-pointer relative overflow-hidden"
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <div className="block p-5 h-full w-full">
                <div className="flex items-center space-x-3 mb-3">
                  {/* Avatar circular */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden shrink-0">
                    {post.creador?.fotoPerfil ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={post.creador.fotoPerfil} 
                        alt={post.creador.usuario || "Usuario"} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      post.creador ? post.creador.usuario.charAt(0).toUpperCase() : "?"
                    )}
                  </div>
                  <div>
                    <Link 
                      href={`/profile/${post.creador?.uid}`} 
                      className="font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{post.creador?.usuario || "anónimo"}
                    </Link>
                    <p className="text-xs text-gray-500">
                      <ClientDate date={post.createdAt?.toDate?.()} />
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap mb-4 group-hover:text-gray-900 transition-colors">
                  {post.contenido}
                </p>
                
                {post.adjunto && (
                  <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={post.adjunto} 
                      alt="Imagen adjunta" 
                      className="w-full h-auto max-h-96 object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </div>
                )}
                
                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <button 
                    onClick={(e) => handleLike(e, post.id)}
                    className={`flex items-center space-x-2 transition-colors group/like relative z-10 ${
                      post.likedByMe ? "text-red-500" : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${
                      post.likedByMe ? "bg-red-50" : "group-hover/like:bg-red-50"
                    }`}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill={post.likedByMe ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className={`w-5 h-5 transition-all group-active:scale-90 ${
                          post.likedByMe ? "scale-110" : ""
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                    <span className={`font-bold text-sm ${post.likedByMe ? "text-red-600" : ""}`}>
                      {post.likes || 0}
                    </span>
                  </button>
                  
                  <div className="text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Leer más →
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Indicador de carga (Spinner) que se muestra durante la peticion */}
        {loading && (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Texto amigable cuando no hay más posts que cargar */}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-gray-500 py-6 font-medium">
            No hay más publicaciones.
          </p>
        )}

        {/* Mensaje de vacío si no existe ningún post */}
        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-500 py-6 font-medium">
            ¡Aún no hay publicaciones en el feed!
          </p>
        )}
      </div>

      {/* Botón flotante para crear post */}
      <button
        onClick={handleCreatePost}
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

// Componente pequeño para evitar errores de hidratación con fechas
function ClientDate({ date }: { date: Date | undefined }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (date) {
      setFormattedDate(date.toLocaleDateString());
    }
  }, [date]);

  return <>{formattedDate}</>;
}
