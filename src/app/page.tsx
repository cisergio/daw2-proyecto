"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LikeButton from "../components/LikeButton";
import { RealTimeAvatar, RealTimeUsername } from "../components/UserInfo";
import { ArrowUp, Plus, MessageCircle } from "lucide-react";
import PostActions from "../components/PostActions";
import { toast } from "sonner";

export default function Feed() {
  const {
    posts,
    loading,
    hasMore,
    getInitialPosts,
    getMorePosts,
    pendingPosts,
    showNewPosts
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

  return (
    /* bg-slate-100: Proporciona contraste premium con las cards blancas */
    <div className="min-h-screen bg-slate-100 py-6 md:py-12 px-4 font-sans">
      <div className="max-w-xl mx-auto space-y-6 md:space-y-8">
        <h1 className="text-3xl md:text-5xl font-black text-midnight mb-6 md:mb-10 text-center tracking-tighter">SocialClub</h1>

        {/* NOTIFICACIÓN DE POSTS NUEVOS (Estilo Twitter Premium) */}
        {pendingPosts.length > 0 && (
          <div className="notification-badge-float animate-slide-down-fade">
            <button
              onClick={handleUpdateFeed}
              className="bg-midnight/90 backdrop-blur-md text-gold-light px-6 py-3 rounded-full shadow-2xl hover:bg-gold hover:text-midnight transition-all hover:scale-105 active:scale-95 font-bold flex items-center gap-3 border border-white/10 ring-4 ring-midnight/5"
            >
              <ArrowUp className="w-5 h-5 animate-bounce" />
              <span>Ver {pendingPosts.length} {pendingPosts.length === 1 ? "publicación nueva" : "publicaciones nuevas"}</span>
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
              className="card-premium hover:border-gold/30 group cursor-pointer relative"
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <div className="block p-6 md:p-10 h-full w-full">
                <div className="flex items-center space-x-5 mb-6">
                  {/* Avatar circular */}
                  {/* Avatar circular en tiempo real */}
                  <RealTimeAvatar
                    uid={post.creador?.uid}
                    fallbackPhoto={post.creador?.fotoPerfil}
                    fallbackName={post.creador?.usuario}
                    className="w-14 h-14 rounded-2xl border border-white/10 shadow-xl transition-transform group-hover:rotate-3 group-hover:scale-110"
                  />
                  <div>
                    <Link
                      href={`/profile/${post.creador?.uid}`}
                      className="font-black text-midnight hover:text-gold hover:underline transition-colors relative z-10 text-xl tracking-tighter"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RealTimeUsername
                        uid={post.creador?.uid}
                        fallbackName={post.creador?.usuario}
                      />
                    </Link>
                    <p className="text-gold-accent mt-0.5">
                      <ClientDate date={post.createdAt?.toDate?.()} />
                    </p>
                  </div>
                </div>

                {/* MENÚ DE ACCIONES (Tres puntos) */}
                <div className="absolute top-6 right-6 z-20">
                  <PostActions
                    postId={post.id}
                    authorId={post.creador?.uid}
                    currentUserId={user?.uid}
                  />
                </div>

                <p className="text-slate-700 text-xl leading-relaxed whitespace-pre-wrap mb-8 group-hover:text-midnight transition-colors">
                  {post.contenido}
                </p>

                {post.adjunto && (
                  <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={post.adjunto}
                        alt="Imagen adjunta"
                        className="w-full h-auto max-h-[25rem] md:max-h-[30rem] object-contain rounded-[1.3rem] md:rounded-[1.8rem] transition-transform duration-1000 group-hover:scale-[1.02]"
                      />}
                  </div>
                )}

                {/* Action Bar */}
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <LikeButton postId={post.id} initialLikes={post.likes} />

                    <div className="flex items-center space-x-2 text-slate-400 font-bold">
                      <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
                      <span className="text-sm">{post.numComments || 0}</span>
                    </div>
                  </div>

                  <div className="text-gold font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    Leer más →
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de carga (Spinner) que se muestra durante la peticion */}
        {loading && (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold shadow-sm"></div>
          </div>
        )}

        {/* Texto amigable cuando no hay más posts que cargar */}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-slate-400 py-16 font-black uppercase tracking-[0.3em] text-[10px]">
            Fin de la transmisión
          </p>
        )}

        {/* Mensaje de vacío si no existe ningún post */}
        {!loading && posts.length === 0 && (
          <p className="text-center text-slate-400 py-20 font-black uppercase tracking-widest text-xs">
            ¡Aún no hay publicaciones en el feed!
          </p>
        )}
      </div>

      {/* Botón flotante para crear post */}
      {/* 
          BOTÓN FLOTANTE:
          Posicionado estratégicamente para pulgar derecho en móvil (bottom-24)
          y alineado a la derecha en PC (bottom-10 md:right-10) para evitar estiramientos no deseados.
      */}
      <button
        onClick={handleCreatePost}
        className="btn-premium fixed bottom-24 right-6 md:bottom-10 md:right-10 px-5 py-5 md:px-6 md:py-6 !rounded-2xl md:!rounded-[2rem] z-40 group hover:scale-110 shadow-2xl"
        aria-label="Crear nueva publicación"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-4 transition-all duration-700 font-black whitespace-nowrap text-lg tracking-tighter">
          NUEVO POST
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
