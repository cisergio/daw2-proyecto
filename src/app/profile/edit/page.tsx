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
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header Fijo */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => !isSaving && router.back()} 
            disabled={isSaving}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-6 h-6 text-midnight" />
          </button>
          <h1 className="text-xl font-black text-midnight uppercase tracking-tighter">Editar Perfil</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
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
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              {!isSaving && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white flex items-center gap-2 font-bold text-sm">
                    <Camera className="w-5 h-5" />
                    Cambiar Portada
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
            <div className="px-6 -mt-16 md:-mt-20 pb-8 flex flex-col items-center md:items-start">
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
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

          {/* CAMPOS DE TEXTO */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                  <Type className="w-3 h-3" /> Nombre
                </label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)}
                  className="form-input" 
                  placeholder="Tu nombre"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                  <Type className="w-3 h-3" /> Apellidos
                </label>
                <input 
                  type="text" 
                  value={apellidos} 
                  onChange={(e) => setApellidos(e.target.value)}
                  className="form-input" 
                  placeholder="Tus apellidos"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                <AtSign className="w-3 h-3" /> Usuario
              </label>
              <input 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value.toLowerCase())}
                className="form-input" 
                placeholder="usuario_del_club"
                required
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                <FileText className="w-3 h-3" /> Biografía
              </label>
              <textarea 
                value={biografia} 
                onChange={(e) => setBiografia(e.target.value)}
                className="form-input min-h-[120px] py-4" 
                placeholder="Cuéntanos algo sobre ti..."
                maxLength={160}
                disabled={isSaving}
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-black text-slate-300 uppercase">{biografia.length}/160</span>
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="pt-4 pb-10">
            <button 
              type="submit" 
              disabled={isSaving}
              className="form-button !py-5 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              {isSaving ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Save className="w-6 h-6" strokeWidth={3} />
              )}
              <span className="uppercase tracking-[0.2em] font-black">
                {isSaving ? "Guardando Clubber..." : "Guardar Cambios"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
