"use server";
import { adminFirestore, auth } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { enviarCorreoConfirmacion } from "./verificationActions";

export default async function crearUsuario(
  nombre: string,
  apellidos: string,
  usuario: string,
  email: string,
  password: string
) {
  try {
    const normalizedUsuario = usuario.toLowerCase().trim();
    if (!normalizedUsuario || normalizedUsuario.includes(" ")) {
      return { success: false, error: "El nombre de usuario no puede contener espacios." };
    }

    // Comprobar si el nombre de usuario ya existe
    const usernameQuery = await adminFirestore
      .collection("usuarios")
      .where("usuario", "==", normalizedUsuario)
      .limit(1)
      .get();

    if (!usernameQuery.empty) {
      return { success: false, error: "El nombre de usuario ya está registrado por otra persona." };
    }
    if(!email.endsWith("@educa.jcyl.es")){
      return{success: false, error: "El email introducido no es válido, solo correos de la junta (@educa.jcyl.es)"}
    }
    
    // 1. Crear el usuario en Firebase Auth usando el Admin SDK
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: normalizedUsuario,
    });

    const uid = userRecord.uid;

    // 2. Crear el perfil en Firestore usando el mismo UID como ID del documento
    await adminFirestore.collection("usuarios").doc(uid).set({
      nombre,
      apellidos,
      usuario: usuario.toLowerCase(),
      email,
      creacion: Timestamp.fromDate(new Date()),
      uid: uid, // Guardamos el UID también dentro del documento por conveniencia
      fotoPerfil: "",
      seguidores: 0,
      seguidos: 0,
      emailVerificado:false
    });

    // 3. Enviar correo de confirmación con código
    const confirmacion = await enviarCorreoConfirmacion(email);
    if (!confirmacion.success) {
      console.warn("Correo no enviado, pero usuario creado:", confirmacion.error);
    }

    return { success: true, message: "Usuario creado. Por favor, verifica tu correo." };
  } catch (error: any) {
    console.error("Error en registro Admin SDK:", error.message);

    // Mapeo de errores comunes de Firebase Auth
    let friendlyMessage = "No se pudo crear la cuenta";
    if (error.code === 'auth/email-already-exists') {
      friendlyMessage = "Este correo electrónico ya está registrado.";
    } else if (error.code === 'auth/invalid-password') {
      friendlyMessage = "La contraseña debe tener al menos 6 caracteres.";
    }

    return { success: false, error: friendlyMessage };
  }
}
