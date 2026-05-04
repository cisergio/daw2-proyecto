"use server"
import { adminFirestore } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

/**
 * Alterna (toggle) el like de un usuario en un post usando una subcolección.
 * @param idPost ID del post.
 * @param uid UID del usuario que da el like.
 */
export async function darLike(idPost: string | null | undefined, uid: string | null | undefined) {
    if (!idPost || !uid) {
        return { success: false, error: "Se requiere ID de post y UID de usuario" };
    }

    try {
        const postRef = adminFirestore.collection("posts").doc(idPost);
        // Usamos una subcolección dentro del propio post para organizar los likes
        const likeRef = postRef.collection("likes").doc(uid);
        
        // Verificamos si el post existe
        const postDoc = await postRef.get();
        if (!postDoc.exists) {
            return { success: false, error: "El post no existe" };
        }

        // Comprobamos si el usuario ya le dio like consultando la subcolección
        const likeDoc = await likeRef.get();
        const alreadyLiked = likeDoc.exists;

        const batch = adminFirestore.batch();

        if (alreadyLiked) {
            // Si ya tiene like en la subcolección, lo quitamos
            batch.delete(likeRef);
            batch.update(postRef, {
                likes: FieldValue.increment(-1)
            });
        } else {
            // Si no tiene like, lo añadimos a la subcolección
            batch.set(likeRef, {
                uid,
                createdAt: FieldValue.serverTimestamp()
            });
            batch.update(postRef, {
                likes: FieldValue.increment(1)
            });
        }

        await batch.commit();

        // Revalidamos rutas para refrescar el cache
        revalidatePath("/");
        revalidatePath(`/post/${idPost}`);
        
        return { 
            success: true, 
            type: alreadyLiked ? "removed" : "added" 
        };
    } catch (error) {
        console.error("Error en server action darLike:", error);
        return { success: false, error: "Error al procesar el like" };
    }
}

