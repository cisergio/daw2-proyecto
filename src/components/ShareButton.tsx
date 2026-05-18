"use client";
import React, { useState, useEffect } from "react";
import { Share2, X, Copy, Check, MessageSquare, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  postId: string;
  className?: string;
  iconClassName?: string;
}

export default function ShareButton({ postId, className = "", iconClassName = "" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Construir la URL del post en el cliente de forma segura
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/post/${postId}`);
    }
  }, [postId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("¡Enlace copiado al portapapeles! 📋");
      setTimeout(() => setCopied(false), 2000); // Reset del estado copiado tras 2 segs
    } catch (err) {
      toast.error("No se pudo copiar el enlace automáticamente");
    }
  };

  // Compartir nativo del sistema (ideal para móviles)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SocialClub",
          text: "Mira esta publicación increíble en SocialClub 🥂",
          url: shareUrl,
        });
        toast.success("¡Compartido con éxito!");
      } catch (err) {
        console.log("Compartido nativo cancelado o con error", err);
      }
    } else {
      toast.error("Tu navegador no soporta el compartido nativo");
    }
  };

  // Enlaces de compartir en redes sociales
  const textMsg = encodeURIComponent("Mira esta publicación increíble en SocialClub 🥂");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${textMsg}%20${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${textMsg}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${textMsg}`;

  return (
    <>
      {/* Botón principal */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`btn-ghost !p-3 hover:bg-slate-100 rounded-xl transition-all group/share ${className}`}
        title="Compartir"
      >
        <Share2 className={`w-5 h-5 text-slate-400 group-hover/share:text-gold transition-colors ${iconClassName}`} strokeWidth={2.5} />
      </button>

      {/* Ventana Emergente Premium */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Fondo desenfocado premium */}
          <div 
            className="fixed inset-0 bg-midnight/60 backdrop-blur-md" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Tarjeta del Popup */}
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-8 shadow-2xl border border-slate-100 relative z-10 animate-menu-appear-mobile">
            {/* Header del Popup */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-midnight tracking-tighter">Compartir</h3>
                <p className="text-[10px] text-gold font-black uppercase tracking-widest mt-0.5">Difunde el SocialClub</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-3 bg-slate-50 hover:bg-gold-soft hover:text-gold text-slate-400 rounded-2xl transition-all"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {/* Input para la URL y botón Copiar */}
            <div className="space-y-4">
              <label className="text-xs text-gold-accent font-black uppercase tracking-wider opacity-60">Enlace de la publicación</label>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="bg-transparent border-none text-xs text-slate-600 font-medium px-3 flex-1 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`p-3 rounded-xl transition-all ${
                    copied 
                      ? "bg-emerald-50 text-emerald-500" 
                      : "bg-midnight text-gold hover:bg-gold hover:text-midnight"
                  }`}
                  title="Copiar enlace"
                >
                  {copied ? <Check className="w-4 h-4 animate-bounce" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {/* Botones de Redes Sociales */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-xs text-gold-accent font-black uppercase tracking-wider opacity-60 mb-4 text-center">Compartir en redes</p>
              
              <div className="grid grid-cols-4 gap-4">
                {/* WhatsApp */}
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group/social focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-500 flex items-center justify-center transition-all duration-300 shadow-sm">
                    <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover/social:text-emerald-600 transition-colors">WhatsApp</span>
                </a>

                {/* Telegram */}
                <a 
                  href={telegramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group/social focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-500 flex items-center justify-center transition-all duration-300 shadow-sm">
                    <Send className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover/social:text-sky-600 transition-colors">Telegram</span>
                </a>

                {/* Twitter / X */}
                <a 
                  href={twitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group/social focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-midnight hover:text-white text-midnight flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-100">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover/social:text-midnight transition-colors">Twitter / X</span>
                </a>

                {/* Compartido del Sistema Móvil */}
                <button 
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-2 group/social focus:outline-none cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold-soft hover:bg-gold hover:text-midnight text-gold flex items-center justify-center transition-all duration-300 shadow-sm">
                    <Smartphone className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover/social:text-gold transition-colors">Sistema</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
