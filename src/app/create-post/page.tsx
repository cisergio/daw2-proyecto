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
          router.push("/"); // Volvemos al feed tras el éxito
          return res.message;
        },
        error: (err) => err.message || "Vaya, no hemos podido publicar tu post.",
      });
    });
  };

  // Mientras verificamos si el usuario está cargando, mostramos un estado neutro
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-gray-400 font-medium">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cabecera con botón de volver */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <Link 
            href="/" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Cancelar y volver al feed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">¿Qué quieres contar?</h1>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo de texto principal */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¡Cuéntanos algo interesante!"
            className="w-full min-h-[160px] text-lg text-gray-800 placeholder-gray-400 border-none focus:ring-0 resize-none"
            maxLength={280}
            disabled={isPending}
          />

          {/* Área de previsualización de imagen */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
              <img src={imagePreview} alt="Tu foto" className="w-full max-h-[450px] object-contain mx-auto" />
              <button
                type="button"
                onClick={removeImage}
                disabled={isPending}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Barra de herramientas inferior */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-all active:scale-95"
                title="Añadir una imagen a tu post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={isPending || (!content.trim() && !imageFile)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isPending ? "Publicando..." : "Publicar Ahora"}
            </button>
          </div>
        </form>
      </div>

      {/* Contador de caracteres humanizado */}
      <div className="mt-8 flex items-center gap-2 text-sm">
        <div className={`h-1 w-24 rounded-full bg-gray-200 overflow-hidden`}>
          <div 
            className={`h-full transition-all duration-300 ${content.length > 250 ? 'bg-red-400' : 'bg-blue-400'}`} 
            style={{ width: `${(content.length / 280) * 100}%` }}
          ></div>
        </div>
        <span className={`${content.length > 250 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
          {280 - content.length} caracteres restantes
        </span>
      </div>
    </div>
  );
}
