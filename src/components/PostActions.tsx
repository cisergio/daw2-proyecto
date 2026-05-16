"use client";
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import eliminarPost from "../app/actions/eliminarPost";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  postId: string;
  authorId: string;
  currentUserId?: string;
  onDelete?: () => void; // Callback opcional por si la página necesita hacer algo tras borrar
  isDetailView?: boolean; // Para saber si redirigir al feed tras borrar
}

export default function PostActions({ postId, authorId, currentUserId, onDelete, isDetailView }: PostActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Solo mostramos si el usuario es el autor
  if (currentUserId !== authorId) return null;

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegación si estamos en el feed
    setIsOpen(false);

    if (confirm("¿Estás seguro de eliminar esta publicación definitivamente?")) {
      const toastId = toast.loading("Eliminando publicación...");
      try {
        const res = await eliminarPost(postId, currentUserId!);
        if (res.success) {
          toast.success(res.message, { id: toastId });
          if (onDelete) onDelete();
          if (isDetailView) router.push("/");
        } else {
          toast.error(res.error, { id: toastId });
        }
      } catch (err) {
        toast.error("Error al intentar eliminar", { id: toastId });
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="btn-ghost !p-3 hover:bg-slate-100 rounded-xl transition-all"
        title="Opciones"
      >
        <MoreHorizontal className="w-6 h-6 text-slate-400 group-hover:text-midnight transition-colors" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Publicación
          </button>
          <div className="px-4 py-2 border-t border-slate-50 mt-1">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">
              Acción Irreversible
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
