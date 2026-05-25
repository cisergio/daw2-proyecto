"use client";
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import eliminarComment from "../app/actions/eliminarComment";
import { toast } from "sonner";

interface CommentActionsProps {
  postId: string;
  commentId: string;
  authorId: string;
  currentUserId?: string;
}

export default function CommentActions({ postId, commentId, authorId, currentUserId }: CommentActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = async () => {
    setIsOpen(false);
    if (confirm("¿Eliminar comentario?")) {
      const toastId = toast.loading("Eliminando...");
      try {
        const res = await eliminarComment(postId, commentId, currentUserId!);
        if (res.success) {
          toast.success(res.message, { id: toastId });
        } else {
          toast.error(res.error, { id: toastId });
        }
      } catch (err) {
        toast.error("Error al eliminar", { id: toastId });
      }
    }
  };

  // Solo mostramos si el usuario es el autor (Movido aquí para evitar violación de reglas de hooks de React)
  if (currentUserId !== authorId) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-slate-200 rounded-md transition-all"
        title="Opciones"
      >
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in duration-150 origin-top-right">
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 flex items-center gap-2 text-red-500 hover:bg-red-50 transition-colors font-bold text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
