"use server";
/**
 * @fileOverview Acción del servidor para gestionar la subida de publicaciones.
 * Maneja tanto la persistencia en Firestore como el almacenamiento de archivos en Cloud Storage.
 */

import { adminFirestore, adminStorage } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Crea una nueva publicación en la red social.
 * 
 * @param formData - Datos del formulario (incluye 'content' y opcionalmente 'image').
 * @param uid - El ID único del usuario que está publicando.
 * @returns Un objeto con el estado de la operación y un mensaje para el usuario.
 */
export default async function subirPost(formData: FormData, uid: string) {
  // Extraemos los datos del formulario de forma segura
  const imagen = formData.get("image") as File | null;
  const content = formData.get("content") as string;
  const bucket = adminStorage.bucket();
  let publicUrl = "";

  try {
    /**
     * PASO 1: Obtener la identidad del "creador"
     * No confiamos solo en lo que mande el cliente. Buscamos el perfil real 
     * en nuestra base de datos para asegurar que el nombre y la foto son correctos.
     */
    const userDoc = await adminFirestore.collection("usuarios").doc(uid).get();
    if (!userDoc.exists) {
      throw new Error("Lo sentimos, no hemos podido encontrar tu perfil de usuario.");
    }
    const userData = userDoc.data();

    // Preparamos el objeto del creador con datos por defecto por si falta alguno
    const creador = {
      fotoPerfil: userData?.fotoPerfil || "",
      nombre: userData?.nombre || "Usuario",
      usuario: userData?.usuario || "anónimo",
      uid: uid
    };

    /**
     * PASO 2: Gestión de archivos adjuntos
     * Si el usuario ha seleccionado una imagen, la procesamos y la subimos a Storage.
     */
    if (imagen && imagen.size > 0) {
      // Convertimos el archivo a un Buffer que Node.js pueda manejar
      const arrayBuffer = await imagen.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Creamos una ruta organizada: posts / ID_USUARIO / timestamp_nombre.ext
      const safeFileName = imagen.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
      const filePath = `posts/${uid}/${Date.now()}_${safeFileName}`;
      const fileRef = bucket.file(filePath);

      // Guardamos el archivo y lo marcamos como público para poder mostrarlo con una URL directa
      await fileRef.save(buffer, {
        metadata: { contentType: imagen.type },
        public: true,
      });

      // Construimos la URL pública de acceso a la imagen
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }

    /**
     * PASO 3: Guardar el post en Firestore
     * Finalmente, inyectamos todos los datos en la colección "posts".
     */
    await adminFirestore.collection("posts").add({
      adjunto: publicUrl,
      contenido: content || "",
      creador: creador,
      createdAt: Timestamp.now(),
      likes: 0,
    });

    return { success: true, message: "¡Tu publicación ya está en el feed! 🚀" };
  } catch (error: any) {
    console.error("Error crítico al subir post:", error);
    return {
      success: false,
      error: "Vaya, algo ha salido mal al publicar. Por favor, inténtalo de nuevo en unos momentos."
    };
  }
}