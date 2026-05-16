import { PostComment } from "../types";
import { useEffect, useState } from "react";
import { RealTimeAvatar, RealTimeUsername } from "./UserInfo";
import { useAuth } from "../context/AuthProvider";
import CommentActions from "./CommentActions";

export default function CommentItem({ comment, postId }: { comment: PostComment, postId: string }) {
  const { user } = useAuth();

  return (
    <div className="flex space-x-4 animate-slide-up-fade group/comment relative">
      <RealTimeAvatar 
        uid={comment.creador.uid} 
        fallbackPhoto={comment.creador.fotoPerfil} 
        fallbackName={comment.creador.usuario}
        className="w-10 h-10 rounded-xl border border-white/10 shadow-lg"
      />
      <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-4 border border-slate-100 shadow-sm group-hover:border-gold/20 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <RealTimeUsername 
              uid={comment.creador.uid} 
              fallbackName={comment.creador.usuario} 
              className="font-black text-midnight text-sm tracking-tighter"
            />
            <span className="text-[10px] uppercase font-black tracking-widest text-gold-accent opacity-60">
              <ClientDate date={comment.createdAt?.toDate?.()} />
            </span>
          </div>

          {/* MENÚ DE ACCIONES (Tres puntos) */}
          <CommentActions 
            postId={postId} 
            commentId={comment.id} 
            authorId={comment.creador?.uid} 
            currentUserId={user?.uid} 
          />
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">
          {comment.contenido}
        </p>
      </div>
    </div>
  );
}

function ClientDate({ date }: { date: Date | undefined }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (date) {
      setFormattedDate(date.toLocaleDateString());
    }
  }, [date]);

  return <>{formattedDate}</>;
}
