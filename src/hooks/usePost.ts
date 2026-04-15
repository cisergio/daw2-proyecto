"use client";
import { useState, useCallback } from "react";
import { firestore as bd } from "../firebase/config";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,  
  QueryDocumentSnapshot 
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { Post } from "../types";

export function usePost() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 1. Conseguir los primeros 10 posts
  const getInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsRef = collection(bd, "posts");
      // Asumimos que el campo de fecha se llama "createdAt" (cámbialo si se llama "fecha" u otra cosa)
      const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
      
      const snapshot = await getDocs(q);
      const postArray: Post[] = [];
      
      snapshot.forEach((doc) => {
        postArray.push({ id: doc.id, ...doc.data() } as Post);
      });

      setPosts(postArray);

      // Guardamos el último documento para la siguiente partición
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      // Si nos devolvieron menos de 10, es que ya no hay más en la base de datos
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error cargando los posts iniciales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Cargar los siguientes 10 posts
  const getMorePosts = useCallback(async () => {
    // Si ya estamos cargando o no hay más posts, no hacemos nada
    if (loading || !hasMore || !lastVisible) return;

    setLoading(true);
    try {
      const postsRef = collection(bd, "posts");
      const q = query(
        postsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible), // Empezar DESPUÉS del último post actual
        limit(10)
      );

      const snapshot = await getDocs(q);
      const postArray: Post[] = [];

      snapshot.forEach((doc) => {
        postArray.push({ id: doc.id, ...doc.data() } as Post);
      });

      // Añadimos los nuevos posts al array que ya teníamos (concatenamos)
      setPosts((prevPosts) => [...prevPosts, ...postArray]);

      // Guardamos el último documento de esta nueva tanda
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error cargando más posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastVisible]);

  return {
    posts,
    loading,
    hasMore,
    getInitialPosts,
    getMorePosts
  };
}
