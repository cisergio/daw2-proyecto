"use server";
import { adminFirestore } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Elimina un comentario de forma segura y actualiza el contador.
 * 
 * @param postId ID del post padre.
 * @param commentId ID del comentario a eliminar.
 * @param uid ID del usuario que solicita la eliminación.
 */
export default async function eliminarComment(postId: string, commentId: string, uid: string) {
  try {
    const commentRef = adminFirestore.collection("posts").doc(postId).collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) throw new Error("El comentario no existe.");
    const commentData = commentDoc.data();

    // 1. Verificación de Seguridad
    if (commentData?.creador?.uid !== uid) {
      throw new Error("No tienes permiso para eliminar este comentario.");
    }

    // 2. Borrado del comentario
    await commentRef.delete();

    // 3. Actualizar contador en el post principal
    await adminFirestore.collection("posts").doc(postId).update({
      numComments: FieldValue.increment(-1)
    });

    return { success: true, message: "Comentario eliminado." };
  } catch (error: any) {
    console.error("[DELETE_COMMENT] Error:", error);
    return { success: false, error: error.message || "Error al eliminar el comentario." };
  }
}
