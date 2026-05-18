"use server";
import { adminFirestore } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Elimina una relación de seguimiento de forma atómica y segura.
 * @param seguidorId UID del usuario que deja de seguir.
 * @param seguidoId UID del usuario al que se deja de seguir.
 */
export async function dejarDeSeguirUsuario(
  seguidorId: string | null | undefined, 
  seguidoId: string | null | undefined
) {
  if (!seguidorId || !seguidoId) {
    return { success: false, error: "IDs de usuario inválidos" };
  }

  try {
    const relacionId = `${seguidorId}_${seguidoId}`;
    const relacionRef = adminFirestore.collection("seguidores").doc(relacionId);
    const seguidorRef = adminFirestore.collection("usuarios").doc(seguidorId);
    const seguidoRef = adminFirestore.collection("usuarios").doc(seguidoId);

    await adminFirestore.runTransaction(async (transaction) => {
      // 1. REALIZAR TODAS LAS LECTURAS (READS) PRIMERO
      const relacionDoc = await transaction.get(relacionRef);
      if (!relacionDoc.exists) {
        throw new Error("No sigues a este usuario");
      }

      const seguidorDoc = await transaction.get(seguidorRef);
      const seguidoDoc = await transaction.get(seguidoRef);

      if (!seguidorDoc.exists || !seguidoDoc.exists) {
        throw new Error("Uno de los usuarios no existe");
      }

      const seguidorData = seguidorDoc.data();
      const seguidoData = seguidoDoc.data();

      // 2. REALIZAR TODAS LAS ESCRITURAS (WRITES) DESPUÉS
      // Eliminar el documento de seguimiento
      transaction.delete(relacionRef);

      // Decrementar contadores en ambos perfiles (asegurando no bajar de 0)
      const seguidosActuales = seguidorData?.seguidos || 0;
      const seguidoresActuales = seguidoData?.seguidores || 0;

      transaction.update(seguidorRef, {
        seguidos: seguidosActuales > 0 ? FieldValue.increment(-1) : 0
      });
      transaction.update(seguidoRef, {
        seguidores: seguidoresActuales > 0 ? FieldValue.increment(-1) : 0
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error en Server Action dejarDeSeguirUsuario:", error);
    return { success: false, error: error.message || "Error al dejar de seguir al usuario" };
  }
}
