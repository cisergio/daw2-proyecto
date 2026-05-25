"use client";
/**
 * @fileOverview Página de creación de posts. 
 * Permite a los usuarios escribir texto y adjuntar una imagen con vista previa.
 */

import React, { useState, useRef, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import subirPost from "../actions/subirPost";
import { ArrowLeft, X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreatePostPage() {
  const { user } = useAuth(); // Obtenemos el usuario actual de nuestro contexto de autenticación
  const [content, setContent] = useState(""); // Estado para el texto del post
  const [imageFile, setImageFile] = useState<File | null>(null); // El archivo real
  const [imagePreview, setImagePreview] = useState<string | null>(null); // La URL temporal para la vista previa
  const [isPending, startTransition] = useTransition(); // Para gestionar el estado de carga de la Server Action
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia al input oculto de archivos
  const router = useRouter();

  // EFECTO DE SEGURIDAD: Si el usuario cierra sesión o no existe, lo mandamos al login
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  // Prevenir salida o recarga accidental de la pestaña durante la subida
  useEffect(() => {
    if (!isPending) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Requerido por estándares modernos
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPending]);

  // Interceptar botón de atrás/adelante del navegador
  useEffect(() => {
    if (!isPending) return;

    // Empujamos un estado dummy para interceptar el botón atrás
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Si intentan ir atrás, volvemos a empujar el estado para bloquear el retroceso
      window.history.pushState(null, "", window.location.href);
      toast.warning("Espera a que termine de subirse tu publicación por favor.");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isPending]);

  /**
   * Gestiona la selección de una imagen y genera la vista previa.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validación básica de tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado pesada. El límite son 5MB.");
        return;
      }
      
      setImageFile(file);
      
      // Creamos una URL local para que el usuario vea lo que va a subir
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Limpia la selección de imagen actual.
   */
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * Procesa el envío del formulario al servidor.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones preventivas
    if (!user) {
      toast.error("Necesitas estar conectado para poder publicar.");
      return;
    }

    if (!content.trim() && !imageFile) {
      toast.error("¡No puedes publicar un post vacío! Escribe algo o añade una imagen.");
      return;
    }

    // Usamos startTransition para que React gestione el estado de UI mientras se ejecuta la acción
    startTransition(async () => {
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      // Lanzamos la acción y dejamos que 'toast.promise' maneje los mensajes de carga/éxito/error
      const postPromise = subirPost(formData, user.uid);

      toast.promise(postPromise, {
        loading: "Estamos enviando tu publicación a la nube...",
        success: (res) => {
          if (!res.success) throw new Error(res.error);
          router.push("/"); // Ir a Principal tras el éxito
          return res.message;
        },
        error: (err) => err.message || "Vaya, no hemos podido publicar tu post.",
      });
    });
  };

  // Mientras verificamos si el usuario está cargando, mostramos un estado neutro
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Verificando sesión...</div>
      </div>
    );
  }

  return (
    /* bg-slate-100: Fondo premium para el formulario */
    <main className="form-container">
      <div className="max-w-2xl w-full px-4">
      <div className="card-premium w-full max-w-2xl !rounded-none md:!rounded-[2.5rem]">
        {/* Cabecera con botón de volver */}
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <Link 
            href={isPending ? "#" : "/"} 
            onClick={(e) => {
              if (isPending) {
                e.preventDefault();
              }
            }}
            className={`btn-ghost group ${isPending ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            title={isPending ? "Subiendo publicación..." : "Cancelar e ir a Principal"}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
          </Link>
          <h1 className="form-title !text-2xl !mb-0">Nueva Publicación</h1>
          <div className="w-12"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 md:space-y-10">
          <div className="card-premium !md:rounded-[3rem]">
          <div className="p-8 md:p-16">
            <h1 className="form-title !text-3xl md:!text-5xl">Crear Post</h1>
          </div>
          </div>
          {/* Campo de texto principal */}
          <div className="space-y-2">
            <label className="input-label">Contenido de la publicación</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué tienes en mente hoy?"
              className="!min-h-[200px] md:!min-h-[250px] text-lg md:text-xl"
              maxLength={280}
              disabled={isPending}
            />
          </div>

          {/* Área de previsualización de imagen */}
          {imagePreview && (
            <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group/img p-2">
              <img src={imagePreview as string} alt="Tu foto" className="w-full max-h-[400px] md:max-h-[500px] object-contain mx-auto rounded-[1.3rem] md:rounded-[2.3rem] transition-transform duration-700 group-hover/img:scale-105" />
              <button
                type="button"
                onClick={removeImage}
                disabled={isPending}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 bg-midnight/90 hover:bg-red-600 text-white rounded-xl md:rounded-2xl backdrop-blur-md transition-all active:scale-90 shadow-xl border border-white/10"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          )}

          {/* Barra de herramientas inferior */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="btn-secondary !p-4"
                title="Añadir una imagen a tu post"
              >
                <ImageIcon className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            <button
              type="submit"
              disabled={isPending || (!content.trim() && !imageFile)}
              className="form-button !w-auto px-10"
            >
              {isPending && (
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
              )}
              {isPending ? "Subiendo..." : "Publicar Ahora"}
            </button>
          </div>
        </form>
      </div>

      {/* Contador de caracteres humanizado */}
      <div className="mt-8 md:mt-10 flex items-center gap-4 text-xs">
        <div className={`h-2 w-24 md:w-32 rounded-full bg-slate-200 overflow-hidden shadow-inner`}>
          <div 
            className={`h-full transition-all duration-500 ease-out ${content.length > 250 ? 'bg-red-500' : 'bg-gold'}`} 
            style={{ width: `${(content.length / 280) * 100}%` }}
          ></div>
        </div>
        <span className={`font-black uppercase tracking-wider ${content.length > 250 ? 'text-red-500 scale-110 transition-transform' : 'text-slate-400'}`}>
          {280 - content.length}
        </span>
        </div>
      </div>
    </main>
  );
}
