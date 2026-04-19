"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Feed() {
  const { posts, loading, hasMore, getInitialPosts, getMorePosts } = usePost();
  const { user } = useAuth();
  const router = useRouter();

  const handleCreatePost = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/create-post");
    }
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

  return (
    // Usa un contenedor de fondo gris claro de Tailwind para el diseño tipo feed
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Feed</h1>
        
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
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200"
            >
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
                  <h3 className="font-semibold text-gray-800">
                    @{post.creador?.usuario || "anónimo"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    <ClientDate date={post.createdAt?.toDate?.()} />
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 whitespace-pre-wrap">{post.contenido}</p>
              
              {post.adjunto && (
                <div className="mt-4 rounded-xl overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={post.adjunto} 
                    alt="Imagen adjunta" 
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              )}
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
