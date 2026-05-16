"use client";
import { PostComment } from "../types";
import CommentItem from "./CommentItem";

export default function CommentList({ comments, loading, postId }: { comments: PostComment[], loading: boolean, postId: string }) {
  if (loading) {
    return (
      <div className="space-y-6 mt-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
            <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
          No hay comentarios aún. ¡Sé el primero!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}
