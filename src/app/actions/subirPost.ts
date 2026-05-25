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

  console.log(`[subirPost] 🚀 Iniciando subida de post para el usuario UID: "${uid}"`);
  console.log(`[subirPost] 📝 Contenido del texto recibido (longitud: ${content?.length || 0} caracteres)`);
  if (imagen) {
    console.log(`[subirPost] 📸 Imagen detectada: Nombre: "${imagen.name}", Tamaño: ${imagen.size} bytes, Tipo: "${imagen.type}"`);
  } else {
    console.log(`[subirPost] 📸 No se ha adjuntado ninguna imagen`);
  }

  try {
    /**
     * PASO 1: Obtener la identidad del "creador"
     * No confiamos solo en lo que mande el cliente. Buscamos el perfil real 
     * en nuestra base de datos para asegurar que el nombre y la foto son correctos.
     */
    console.log(`[subirPost] 🔍 Consultando en Firestore el documento del usuario: "usuarios/${uid}"`);
    const userDoc = await adminFirestore.collection("usuarios").doc(uid).get();
    if (!userDoc.exists) {
      console.warn(`[subirPost] ⚠️ No se encontró el usuario en la base de datos para el UID: "${uid}"`);
      throw new Error("Lo sentimos, no hemos podido encontrar tu perfil de usuario.");
    }
    const userData = userDoc.data();
    console.log(`[subirPost] ✅ Usuario encontrado. Nombre: "${userData?.nombre}", Usuario: "${userData?.usuario}"`);

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
      console.log(`[subirPost] 📂 Procesando archivo adjunto para subir a Cloud Storage...`);
      // Convertimos el archivo a un Buffer que Node.js pueda manejar
      const arrayBuffer = await imagen.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Creamos una ruta organizada: posts / ID_USUARIO / timestamp_nombre.ext
      const safeFileName = imagen.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
      const filePath = `posts/${uid}/${Date.now()}_${safeFileName}`;
      console.log(`[subirPost] 💾 Destino en Storage: "${filePath}"`);
      const fileRef = bucket.file(filePath);

      // Guardamos el archivo y lo marcamos como público para poder mostrarlo con una URL directa
      console.log(`[subirPost] ⏳ Subiendo archivo al bucket "${bucket.name}"...`);
      await fileRef.save(buffer, {
        metadata: { contentType: imagen.type },
        public: true,
      });
      console.log(`[subirPost] ✅ Archivo guardado correctamente en Cloud Storage.`);

      // Construimos la URL pública de acceso a la imagen
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      console.log(`[subirPost] 🔗 URL pública generada: "${publicUrl}"`);
    }

    /**
     * PASO 3: Guardar el post en Firestore
     * Finalmente, inyectamos todos los datos en la colección "posts".
     */
    console.log(`[subirPost] 📝 Intentando guardar el documento del post en Firestore...`);
    const postData = {
      adjunto: publicUrl,
      contenido: content || "",
      creador: creador,
      createdAt: Timestamp.now(),
      likes: 0,
    };
    const newPostRef = await adminFirestore.collection("posts").add(postData);
    console.log(`[subirPost] 🎉 Post guardado con éxito. ID del nuevo documento: "${newPostRef.id}"`);

    return { success: true, message: "¡Tu publicación ya está en el feed! 🚀" };
  } catch (error: any) {
    console.error("❌ Error crítico en subirPost:", error);
    if (error instanceof Error) {
      console.error(`  - Mensaje: ${error.message}`);
      console.error(`  - Stack: ${error.stack}`);
    } else {
      console.error("  - Detalles adicionales:", JSON.stringify(error));
    }
    return {
      success: false,
      error: error.message || "Vaya, algo ha salido mal al publicar. Por favor, inténtalo de nuevo en unos momentos."
    };
  }
}