"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthProvider";

export default function CommentForm({ onAddComment }: { onAddComment: (content: string) => Promise<void> }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para comentar");
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(content);
      setContent("");
      toast.success("Comentario enviado");
    } catch (error) {
      toast.error("Error al enviar el comentario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-midnight/20 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
      <div className="relative bg-white rounded-[1.5rem] p-1 border border-slate-200 flex items-center gap-2 shadow-inner">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-transparent px-6 py-3.5 text-midnight placeholder:text-slate-400 focus:outline-none font-medium"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="btn-premium !p-3.5 !rounded-[1.2rem] disabled:opacity-50 disabled:grayscale group"
        >
          <Send className={`w-5 h-5 ${submitting ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`} strokeWidth={3} />
        </button>
      </div>
    </form>
  );
}
