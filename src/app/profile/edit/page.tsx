"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useUsuario } from "@/hooks/useUsuarios";
import editarPerfil from "@/app/actions/editarPerfil";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  User,
  Type,
  AtSign,
  FileText,
  Save,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const { user } = useAuth();
  const { usuario: initialData, loading: loadingData } = useUsuario(user?.uid);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [usuario, setUsuario] = useState("");
  const [biografia, setBiografia] = useState("");

  // Image State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    // IMPORTANTE: Si estamos guardando (isSaving), NO reseteamos los campos
    if (initialData && !isSaving) {
      setNombre(initialData.nombre || "");
      setApellidos(initialData.apellidos || "");
      setUsuario(initialData.usuario || "");
      setBiografia(initialData.biografia || "");
      setAvatarPreview(initialData.fotoPerfil || null);
      setBannerPreview(initialData.fotoPortada || null);
    }
  }, [initialData, isSaving]);

  // Security: Send to login if no sessions
  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado pesada (máx 5MB)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(reader.result as string);
        } else {
          setBannerFile(file);
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving) return;

    setIsSaving(true);
    const toastId = toast.loading("Actualizando tu perfil en el Club...");

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("apellidos", apellidos);
      formData.append("usuario", usuario);
      formData.append("biografia", biografia);

      if (avatarFile) formData.append("fotoPerfil", avatarFile);
      if (bannerFile) formData.append("fotoPortada", bannerFile);

      const res = await editarPerfil(formData, user.uid);

      if (res && res.success) {
        toast.success(res.message, { id: toastId });
        // Navegación inmediata
        router.push(`/profile/${user.uid}`);
      } else {
        toast.error(res?.error || "Error inesperado al guardar.", { id: toastId });
        setIsSaving(false);
      }
    } catch (err: any) {
      console.error("Error en handleSubmit:", err);
      toast.error("Error crítico al guardar. Revisa tu conexión.", { id: toastId });
      setIsSaving(false);
    }
  };

  if (loadingData || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-20 font-sans">
      {/* Header Fijo - Premium & Spacious */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50 py-5 md:py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => !isSaving && router.back()}
            disabled={isSaving}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200/50 shadow-sm flex items-center justify-center"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-midnight" strokeWidth={3} />
          </button>

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black text-midnight uppercase tracking-tighter leading-none">Editar Perfil</h1>
            <p className="text-[9px] text-gold font-black uppercase tracking-widest mt-1">Ajustes del Usuario</p>
          </div>

          <div className="w-11"></div> {/* Balanceador flex */}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECCIÓN ESTÉTICA (PORTADA Y AVATAR) */}
          <div className="card-premium !p-0 overflow-hidden relative">
            {/* Banner Preview */}
            <div
              className={`h-48 md:h-64 bg-midnight relative group ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isSaving && bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <img src={bannerPreview} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold/30">
                  <ImageIcon className="w-12 h-12 animate-pulse" />
                </div>
              )}
              {!isSaving && (
                <div className="absolute inset-0 bg-midnight/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                  <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-white flex items-center gap-2 font-bold text-sm shadow-xl">
                    <Camera className="w-5 h-5 text-gold" strokeWidth={2.5} />
                    <span>Cambiar Portada</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleImageChange(e, 'banner')}
                className="hidden"
                accept="image/*"
                disabled={isSaving}
              />
            </div>

            {/* Avatar Preview */}
            <div className="px-8 -mt-16 md:-mt-20 pb-8 flex flex-col items-center md:items-start">
              <div
                className={`relative group ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !isSaving && avatarInputRef.current?.click()}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-midnight shadow-2xl relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold text-4xl font-black">
                      {nombre?.charAt(0) || user.email?.charAt(0)}
                    </div>
                  )}
                  {!isSaving && (
                    <div className="absolute inset-0 bg-midnight/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                      <Camera className="w-8 h-8 text-gold" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={(e) => handleImageChange(e, 'avatar')}
                  className="hidden"
                  accept="image/*"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* CAMPOS DE TEXTO - DENTRO DE CARD PREMIUM */}
          <div className="card-premium p-8 md:p-12 space-y-8">
            <div className="border-b border-slate-50 pb-4 mb-6">
              <h2 className="text-lg font-black text-midnight tracking-tighter uppercase leading-none">Información Personal</h2>
              <p className="text-[9px] text-gold font-black uppercase tracking-widest mt-1">Detalles públicos de tu perfil</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <Type className="w-3.5 h-3.5 text-gold" strokeWidth={2.5} /> Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <Type className="w-3.5 h-3.5 text-gold" strokeWidth={2.5} /> Apellidos
                </label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Tus apellidos"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                <AtSign className="w-3.5 h-3.5 text-gold" strokeWidth={2.5} /> Nombre de Usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toLowerCase())}
                placeholder="usuario"
                required
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                <FileText className="w-3.5 h-3.5 text-gold" strokeWidth={2.5} /> Biografía o Descripción
              </label>
              <textarea
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                className="min-h-[120px] py-4"
                placeholder="Cuéntanos algo sobre ti..."
                maxLength={160}
                disabled={isSaving}
              />
              <div className="flex justify-end">
                <span className={`text-[10px] font-black uppercase tracking-wider ${biografia.length >= 140 ? 'text-gold' : 'text-slate-300'}`}>
                  {biografia.length}/160
                </span>
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR - ESTILO PREMIUM */}
          <div className="pt-4 pb-10">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-premium w-full !py-5 flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:shadow-gold/10"
            >
              {isSaving ? (
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              ) : (
                <Save className="w-5 h-5 text-gold" strokeWidth={3} />
              )}
              <span className="uppercase tracking-[0.2em] font-black text-xs">
                {isSaving ? "Guardando Clubber..." : "Guardar Cambios"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
