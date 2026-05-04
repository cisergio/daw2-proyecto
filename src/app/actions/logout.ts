"use server";
import { cookies } from "next/headers";
import { auth } from "@/firebase/admin";

/**
 * Server Action para cerrar la sesión del usuario.
 * Borra la cookie de sesión de Firebase si existe.
 */
export async function logout() {
  try {
    // 1. Obtenemos la cookie de sesión
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (sessionCookie) {
      // 2. Opcional: Revocamos los tokens en Firebase Admin para mayor seguridad
      try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie);
        await auth.revokeRefreshTokens(decodedToken.sub);
      } catch (e) {
        // Si el token ya expiró o es inválido, simplemente seguimos
        console.log("Token ya no es válido, procediendo a borrar cookie.");
      }

      // 3. Borramos la cookie del navegador
      cookieStore.set("__session", "", {
        maxAge: 0,
        path: "/",
      });
    }

    return { success: true, message: "Sesión cerrada correctamente" };
  } catch (error: any) {
    console.error("Error en logout Server Action:", error);
    return { success: false, error: "Error al cerrar sesión" };
  }
}
