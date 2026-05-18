"use client";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/config";

/**
 * Hook reactivo para verificar si existe una relación de seguimiento en tiempo real.
 * @param seguidorId UID del usuario potencial seguidor (usuario logueado).
 * @param seguidoId UID del usuario visitado.
 */
export function useEsSeguidor(
  seguidorId: string | null | undefined, 
  seguidoId: string | null | undefined
) {
  const [esSeguidor, setEsSeguidor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!seguidorId || !seguidoId) {
      setEsSeguidor(false);
      setLoading(false);
      return;
    }

    const relacionId = `${seguidorId}_${seguidoId}`;
    const docRef = doc(firestore, "seguidores", relacionId);

    // Escucha en tiempo real del documento de seguimiento
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        setEsSeguidor(docSnap.exists());
        setLoading(false);
      },
      (error) => {
        console.error("Error escuchando seguimiento:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [seguidorId, seguidoId]);

  return { esSeguidor, loading };
}
