"use client";
import { useParams, useRouter } from "next/navigation";
import { usePostId } from "../../../hooks/usePost";
import Link from "next/link";
import { useState, useEffect } from "react";
import { darLike } from "../../actions/darLike";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthProvider";

export default function SinglePostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { post, loading, error } = usePostId(id as string);
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!post || liking) return;

    if (!user) {
      toast.info("Inicia sesión para dar like");
      router.push("/login");
      return;
    }
    
    setLiking(true);
    const result = await darLike(post.id, user.uid);
    
    if (result?.success) {
      const isAdded = result.type === "added";
      
      // Como usePostId usa onSnapshot, el count se actualizará solo.
      // Pero para la UI visual, podemos manejar el estado localmente si fuera necesario,
      // aunque aquí el objeto 'post' se actualizará desde Firestore.
      // Sin embargo, Firestore no tiene el campo 'likedByMe', así que lo manejamos localmente o lo inferimos.
      
      if (isAdded) {
        toast.success("¡Te gusta esta publicación!");
      } else {
        toast.success("Has quitado tu like");
      }
    } else {
      toast.error(result?.error || "Error al procesar el like");
    }
    setLiking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-6 aspect-video bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Vaya!</h1>
          <p className="text-gray-600 mb-8">{error || "No pudimos encontrar la publicación que buscas."}</p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 w-full"
          >
            Volver al Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-2xl mx-auto">
        {/* Back Button - Premium Glass Style */}
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center group"
        >
          <div className="p-2.5 mr-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300 group-active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
          <span className="font-bold text-gray-500 group-hover:text-gray-900 transition-colors tracking-tight">Volver al Feed</span>
        </button>

        {/* Post Article - Ultra Clean Card */}
        <article className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-gray-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 p-[3px] shadow-lg group-hover:rotate-6 transition-transform duration-500">
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    {post.creador?.fotoPerfil ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={post.creador.fotoPerfil} 
                        alt={post.creador.usuario} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                        {post.creador?.usuario?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              
              <div>
                <Link href={`/profile/${post.creador?.uid}`} className="font-extrabold text-gray-900 text-xl tracking-tight hover:text-blue-600 hover:underline transition-colors">
                  @{post.creador?.usuario || "anónimo"}
                </Link>
                <div className="flex items-center text-gray-400 text-sm font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 opacity-60">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 13.29a.75.75 0 101.06 1.06l2.72-2.72a.75.75 0 00.17-.32V6.75z" clipRule="evenodd" />
                  </svg>
                  <ClientDate date={post.createdAt?.toDate?.()} />
                </div>
              </div>
            </div>
            
            <button className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-8 md:p-10">
            <p className="text-gray-800 text-2xl md:text-3xl leading-[1.4] tracking-tight whitespace-pre-wrap font-medium mb-10 selection:bg-blue-100">
              {post.contenido}
            </p>
            
            {post.adjunto && (
              <div className="rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100/50 shadow-2xl shadow-blue-900/5 group relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */ }
                <img 
                  src={post.adjunto} 
                  alt="Post media" 
                  className="w-full h-auto max-h-[700px] object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                />
              </div>
            )}
          </div>

          {/* Premium Action Bar */}
          <div className="px-8 md:px-10 py-8 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-2.5 px-6 py-3.5 bg-white border rounded-2xl shadow-sm transition-all duration-300 group active:scale-95 ${
                  liking ? "opacity-50 cursor-not-allowed" : 
                  post.likedByMe ? "text-red-500 border-red-100 shadow-red-500/10" : "text-gray-600 border-gray-100 hover:text-red-500 hover:border-red-100 hover:shadow-red-500/10"
                }`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill={post.likedByMe ? "currentColor" : "none"} 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className={`w-6 h-6 transition-all ${post.likedByMe ? "fill-red-500" : "group-hover:fill-red-500/10"}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className={`font-bold text-lg tabular-nums ${post.likedByMe ? "text-red-600" : ""}`}>
                  {post.likes || 0}
                </span>
              </button>
              
              <button className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all duration-300 active:scale-95 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-12 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125l-.625.625a.75.75 0 01-1.28-.53V3.75a.75.75 0 01.75-.75h14.25a.75.75 0 01.75.75v12a.75.75 0 01-.75.75h-7.5l-3.375 3.375z" />
                </svg>
                <span className="font-bold">Responder</span>
              </button>
            </div>

            <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-blue-500/5 transition-all duration-300 active:scale-90 group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-10.628a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 10.628a2.25 2.25 0 100 4.5 2.25 2.25 0 000 4.5z" />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

// Componente pequeño para fechas
function ClientDate({ date }: { date: Date | undefined }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (date) {
      setFormattedDate(date.toLocaleDateString("es-ES", {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
  }, [date]);

  return <>{formattedDate}</>;
}
