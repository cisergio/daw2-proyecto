"use server";
import { adminFirestore, adminStorage } from "@/firebase/admin";

/**
 * Elimina una publicación de forma segura.
 * 1. Verifica la autoría.
 * 2. Borra la imagen de Storage si existe.
 * 3. Borra el post de Firestore.
 * 
 * @param postId ID del post a eliminar.
 * @param uid ID del usuario que solicita la eliminación.
 */
export default async function eliminarPost(postId: string, uid: string) {
  try {
    const postRef = adminFirestore.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) throw new Error("El post no existe.");
    const postData = postDoc.data();

    // 1. Verificación de Seguridad
    if (postData?.creador?.uid !== uid) {
      throw new Error("No tienes permiso para eliminar esta publicación.");
    }

    // 2. Borrado de Imagen en Storage
    if (postData?.adjunto) {
      try {
        // Extraer el path del archivo de la URL
        // URL format: https://storage.googleapis.com/BUCKET_NAME/PATH_TO_FILE
        const urlParts = postData.adjunto.split("/");
        const filePath = urlParts.slice(4).join("/"); // Salta protocolo, host y bucket
        
        const bucket = adminStorage.bucket();
        await bucket.file(filePath).delete();
        console.log(`[DELETE_POST] Imagen eliminada: ${filePath}`);
      } catch (storageErr) {
        console.error("[DELETE_POST] Error al borrar imagen de Storage:", storageErr);
        // Continuamos aunque falle el borrado de imagen para no bloquear el borrado del post
      }
    }

    // 3. Borrado de Comentarios (Subcolección)
    const commentsSnapshot = await postRef.collection("comments").get();
    if (!commentsSnapshot.empty) {
      const batch = adminFirestore.batch();
      commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`[DELETE_POST] Comentarios eliminados para post ${postId}`);
    }

    // 4. Borrado del Post
    await postRef.delete();

    return { success: true, message: "Publicación eliminada correctamente." };
  } catch (error: any) {
    console.error("[DELETE_POST] Error:", error);
    return { success: false, error: error.message || "Error al eliminar la publicación." };
  }
}
