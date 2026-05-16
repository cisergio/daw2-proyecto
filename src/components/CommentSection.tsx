"use client";
import { useComments } from "../hooks/usePost";
import { useAuth } from "../context/AuthProvider";
import { useUsuario } from "../hooks/useUsuarios";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { MessageSquareText } from "lucide-react";

export default function CommentSection({ postId }: { postId: string }) {
  const { comments, loading, addComment } = useComments(postId);
  const { user } = useAuth();
  const { usuario: fullUser } = useUsuario(user?.uid);

  const handleAddComment = async (content: string) => {
    if (!fullUser) return;
    await addComment(fullUser, content);
  };

  return (
    <section className="mt-12 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
            <MessageSquareText className="w-6 h-6 text-gold" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-midnight tracking-tighter leading-none">Comentarios</h3>
            <p className="text-gold-accent text-sm font-bold opacity-60 uppercase tracking-widest mt-1">
              {comments.length} {comments.length === 1 ? "Interacción" : "Interacciones"}
            </p>
          </div>
        </div>
      </header>

      {user ? (
        <CommentForm onAddComment={handleAddComment} />
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[1.5rem] p-6 text-center">
          <p className="text-slate-500 font-medium">
            Inicia sesión para participar en la conversación
          </p>
        </div>
      )}

      <CommentList comments={comments} loading={loading} postId={postId} />
    </section>
  );
}
