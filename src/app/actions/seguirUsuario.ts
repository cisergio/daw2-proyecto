"use server";
import { adminFirestore } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Establece una relación de seguimiento de forma atómica y segura.
 * @param seguidorId UID del usuario que decide seguir.
 * @param seguidoId UID del usuario que va a ser seguido.
 */
export async function seguirUsuario(
  seguidorId: string | null | undefined, 
  seguidoId: string | null | undefined
) {
  if (!seguidorId || !seguidoId) {
    return { success: false, error: "IDs de usuario inválidos" };
  }

  if (seguidorId === seguidoId) {
    return { success: false, error: "No puedes seguirte a ti mismo" };
  }

  try {
    const relacionId = `${seguidorId}_${seguidoId}`;
    const relacionRef = adminFirestore.collection("seguidores").doc(relacionId);
    const seguidorRef = adminFirestore.collection("usuarios").doc(seguidorId);
    const seguidoRef = adminFirestore.collection("usuarios").doc(seguidoId);

    const result = await adminFirestore.runTransaction(async (transaction) => {
      // 1. Verificar si la relación ya existe
      const relacionDoc = await transaction.get(relacionRef);
      if (relacionDoc.exists) {
        throw new Error("Ya sigues a este usuario");
      }

      // 2. Verificar existencia de ambos usuarios
      const seguidorDoc = await transaction.get(seguidorRef);
      const seguidoDoc = await transaction.get(seguidoRef);

      if (!seguidorDoc.exists || !seguidoDoc.exists) {
        throw new Error("Uno de los usuarios no existe");
      }

      // 3. Crear el documento de seguimiento
      transaction.set(relacionRef, {
        seguidorId,
        seguidoId,
        creadoEn: FieldValue.serverTimestamp(),
      });

      // 4. Incrementar contadores en ambos perfiles
      transaction.update(seguidorRef, {
        seguidos: FieldValue.increment(1)
      });
      transaction.update(seguidoRef, {
        seguidores: FieldValue.increment(1)
      });

    });

    return { success: true };
  } catch (error: any) {
    console.error("Error en Server Action seguirUsuario:", error);
    return { success: false, error: error.message || "Error al seguir al usuario" };
  }
}
