"use server";
/**
 * @fileOverview Acción del servidor para editar el perfil del usuario.
 * Maneja la actualización de datos en Firestore y la sincronización masiva en posts y comentarios.
 */

import { adminFirestore, adminStorage } from "@/firebase/admin";

export default async function editarPerfil(formData: FormData, uid: string) {
  console.log(`[EDIT_PROFILE] Iniciando para UID: ${uid}`);
  
  try {
    const bucket = adminStorage.bucket();
    
    const nombre = formData.get("nombre") as string;
    const apellidos = formData.get("apellidos") as string;
    const usuario = formData.get("usuario") as string;
    const biografia = formData.get("biografia") as string;
    
    const fotoPerfilFile = formData.get("fotoPerfil") as File | null;
    const fotoPortadaFile = formData.get("fotoPortada") as File | null;

    // 0. Obtener datos actuales
    const userDocRef = adminFirestore.collection("usuarios").doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error("Usuario no encontrado");
    const currentData = userDoc.data();

    const updateData: any = {
      nombre,
      apellidos,
      usuario: usuario.toLowerCase(),
      biografia: biografia || "",
    };

    // Procesar Foto de Perfil
    if (fotoPerfilFile && fotoPerfilFile.size > 0) {
      const arrayBuffer = await fotoPerfilFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `perfiles/${uid}/avatar_${Date.now()}_${fotoPerfilFile.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const fileRef = bucket.file(fileName);

      await fileRef.save(buffer, {
        metadata: { contentType: fotoPerfilFile.type },
        public: true,
      });

      updateData.fotoPerfil = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // Procesar Foto de Portada
    if (fotoPortadaFile && fotoPortadaFile.size > 0) {
      const arrayBuffer = await fotoPortadaFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `perfiles/${uid}/portada_${Date.now()}_${fotoPortadaFile.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const fileRef = bucket.file(fileName);

      await fileRef.save(buffer, {
        metadata: { contentType: fotoPortadaFile.type },
        public: true,
      });

      updateData.fotoPortada = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // 1. Actualizar el documento principal del usuario
    await userDocRef.update(updateData);

    /**
     * 2. DESNORMALIZACIÓN (Consistencia de Datos)
     * Actualizamos de forma asíncrona todos los posts y comentarios del usuario.
     * Nota: No usamos await para que el usuario reciba la respuesta de éxito rápido,
     * pero en server actions de Next.js es más seguro esperar si queremos garantizar el éxito.
     */
    
    // Sincronizar Posts
    const postsSnapshot = await adminFirestore.collection("posts").where("creador.uid", "==", uid).get();
    if (!postsSnapshot.empty) {
      const batch = adminFirestore.batch();
      postsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          "creador.nombre": updateData.nombre,
          "creador.usuario": updateData.usuario,
          "creador.fotoPerfil": updateData.fotoPerfil || currentData?.fotoPerfil || ""
        });
      });
      await batch.commit();
    }

    // Sincronizar Comentarios (Uso de collectionGroup)
    // Nota: Esto requiere un índice de collectionGroup en Firestore.
    try {
      const commentsSnapshot = await adminFirestore.collectionGroup("comments").where("creador.uid", "==", uid).get();
      if (!commentsSnapshot.empty) {
        const batch = adminFirestore.batch();
        commentsSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            "creador.nombre": updateData.nombre,
            "creador.usuario": updateData.usuario,
            "creador.fotoPerfil": updateData.fotoPerfil || currentData?.fotoPerfil || ""
          });
        });
        await batch.commit();
      }
    } catch (commentErr) {
      console.warn("[EDIT_PROFILE] No se pudieron sincronizar comentarios antiguos (posible falta de índice):", commentErr);
    }

    return { success: true, message: "¡Perfil y datos históricos actualizados! ✨" };

  } catch (error: any) {
    console.error("[EDIT_PROFILE] Error crítico:", error);
    return {
      success: false,
      error: error.message || "Hubo un problema al guardar los cambios."
    };
  }
}
