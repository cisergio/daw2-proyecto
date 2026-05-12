"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useLikeStatus } from "../hooks/usePost";
import { darLike } from "../app/actions/darLike";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { isLiked, loading: loadingStatus } = useLikeStatus(postId, user?.uid);
  
  // Estado local para el contador para que la respuesta sea instantánea
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  // Sincronizar el contador si initialLikes cambia (ej: por revalidación del feed)
  useEffect(() => {
    setLikesCount(initialLikes);
  }, [initialLikes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Inicia sesión para dar like");
      router.push("/login");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);

    // Optimistic UI para el contador
    const previouslyLiked = isLiked;
    setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);

    const result = await darLike(postId, user.uid);
    
    if (result?.success) {
      if (result.type === "added") {
        toast.success("¡Te gusta este post!");
      } else {
        toast.success("Has quitado tu like");
      }
    } else {
      // Revertir en caso de error
      setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
      toast.error(result?.error || "Error al procesar el like");
    }

    setIsLiking(false);
  };

  return (
    <button 
      onClick={handleLike}
      disabled={isLiking || loadingStatus}
      className={`flex items-center space-x-3 transition-all group/like relative z-10 font-black ${
        isLiked ? "text-red-500 scale-105" : "text-slate-400 hover:text-red-500"
      }`}
    >
      <div className={`p-3 rounded-xl transition-all ${
        isLiked ? "bg-red-50 shadow-sm" : "group-hover/like:bg-red-50"
      }`}>
        <Heart 
          className={`w-6 h-6 transition-all group-active/like:scale-75 ${isLiking ? "opacity-50" : ""}`}
          fill={isLiked ? "currentColor" : "none"}
          strokeWidth={2.5}
        />
      </div>
      <span className="text-base tabular-nums">
        {Math.max(0, likesCount)}
      </span>
    </button>
  );
}
