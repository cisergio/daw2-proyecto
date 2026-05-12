"use client";
import { useParams, useRouter } from "next/navigation";
import { usePostId } from "../../../hooks/usePost";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthProvider";
import LikeButton from "../../../components/LikeButton";
import { ArrowLeft, MoreHorizontal, MessageCircle, Share2, AlertCircle } from "lucide-react";

export default function SinglePostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { post, loading, error } = usePostId(id as string);
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-pulse">
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full"></div>
            <div className="space-y-3">
              <div className="h-5 w-40 bg-slate-100 rounded-xl"></div>
              <div className="h-3 w-24 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-full bg-slate-100 rounded-xl"></div>
            <div className="h-5 w-full bg-slate-100 rounded-xl"></div>
            <div className="h-5 w-3/4 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="mt-10 aspect-video bg-slate-50 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="form-container text-center">
        <div className="form-card">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-midnight mb-3 tracking-tighter">¡Vaya!</h1>
          <p className="form-subtitle">{error || "No pudimos encontrar la publicación que buscas."}</p>
          <Link 
            href="/" 
            className="btn-premium mt-10 w-full"
          >
            Volver al Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    /* bg-slate-100: Consistente con el resto de la app para el contraste de cards */
    <main className="min-h-screen bg-slate-100 py-6 md:py-12 px-4 selection:bg-gold-soft selection:text-midnight font-sans">
      {/* max-w-3xl: Layout responsivo que se expande en pantallas grandes */}
      <div className="max-w-3xl mx-auto">
        {/* Back Button - Premium Style */}
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center group"
        >
          <div className="btn-ghost !p-3.5 mr-4 !rounded-2xl bg-white shadow-sm border border-slate-200/50 group-hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 group-hover:text-midnight transition-colors" strokeWidth={3} />
          </div>
          <span className="text-gold-accent opacity-60 group-hover:opacity-100 group-hover:text-midnight transition-all">Volver</span>
        </button>

        {/* Post Article - Ultra Clean Card */}
        <article className="card-premium">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-midnight p-[4px] shadow-2xl transition-transform duration-700 group-hover:rotate-12">
                  <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                    {post.creador?.fotoPerfil ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={post.creador.fotoPerfil} 
                        alt={post.creador.usuario} 
                        className="w-full h-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-midnight flex items-center justify-center text-gold font-black text-3xl">
                        {post.creador?.usuario?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Link href={`/profile/${post.creador?.uid}`} className="font-black text-midnight text-xl md:text-2xl tracking-tighter hover:text-gold hover:underline transition-colors block leading-none mb-1">
                  @{post.creador?.usuario || "anónimo"}
                </Link>
                <div className="text-gold-accent opacity-60">
                  <ClientDate date={post.createdAt?.toDate?.()} />
                </div>
              </div>
            </div>
            
            <button className="btn-ghost !p-4">
              <MoreHorizontal className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-8 md:p-12">
            <p className="text-slate-800 text-2xl md:text-4xl leading-[1.3] tracking-tighter whitespace-pre-wrap font-medium mb-8 md:mb-12 selection:bg-gold-soft">
              {post.contenido}
            </p>
            
            {post.adjunto && (
              <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-midnight/5 group relative p-1 mt-6">
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */ }
                <img 
                  src={post.adjunto} 
                  alt="Post media" 
                  className="w-full h-auto max-h-[800px] object-contain rounded-[1.8rem] md:rounded-[2.3rem] transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Premium Action Bar */}
          <div className="px-8 md:px-12 py-8 md:py-10 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
            <div className="flex items-center gap-4 md:gap-5">
              <LikeButton postId={post.id} initialLikes={post.likes} />
              
              <button className="btn-premium px-6 md:px-10 py-5">
                <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform mr-2 md:mr-3" strokeWidth={3} />
                <span>Responder</span>
              </button>
            </div>

            <button className="btn-ghost !p-5 !shadow-xl !shadow-slate-200/20 bg-white">
              <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={3} />
            </button>
          </div>
        </article>
      </div>
    </main>
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
