"use client";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase/config";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import type { Post } from "../types";

/**
 * Hook para obtener las publicaciones de un usuario específico.
 * @param usuarioId ID del usuario (UID de Firebase Auth).
 * @returns { posts, loading, error }
 */
export function useUserPosts(usuarioId: string | null | undefined) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!usuarioId) {
            setLoading(false);
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const collRef = collection(firestore, "posts");

                // Buscamos posts donde el creador sea el usuarioId
                const q = query(
                    collRef,
                    where("creador.uid", "==", usuarioId),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );

                const querySnapshot = await getDocs(q);
                const postsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                setPosts(postsList);

                if (postsList.length === 0) {
                    console.log("No se encontraron posts para el usuario:", usuarioId);
                }
            } catch (err: any) {
                console.error("Error fetching user posts:", err);
                setError("Error al cargar las publicaciones del usuario.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [usuarioId]);

    return { posts, loading, error };
}

