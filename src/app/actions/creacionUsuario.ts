"use server";
import { adminFirestore, auth } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export default async function crearUsuario(
  nombre: string,
  apellidos: string,
  usuario: string,
  email: string,
  password: string
) {
  try {
    // 1. Crear el usuario en Firebase Auth usando el Admin SDK
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: usuario,
    });

    const uid = userRecord.uid;

    // 2. Crear el perfil en Firestore usando el mismo UID como ID del documento
    await adminFirestore.collection("usuarios").doc(uid).set({
      nombre,
      apellidos,
      usuario: usuario.toLowerCase(),
      email,
      creacion: Timestamp.fromDate(new Date()),
      uid: uid // Guardamos el UID también dentro del documento por conveniencia
    });

    return { success: true, message: "Usuario creado exitosamente" };
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
