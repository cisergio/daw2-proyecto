"use client";
import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase/config";

/**
 * Hook para obtener los datos de un usuario específico desde Firestore.
 * @param usuarioID ID del usuario en la colección "usuarios".
 * @returns { usuario, loading, error }
 */
export function useUsuario(usuarioID: string | null | undefined) {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay ID, no intentamos buscar
    if (!usuarioID) {
      if (usuarioID === null || usuarioID === undefined) {
        setLoading(false);
      }
      return;
    }

    const fetchUsuario = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(firestore, "usuarios", usuarioID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Devolvemos los datos limpios junto con el ID del documento
          setUsuario({ id: docSnap.id, ...docSnap.data() });
        } else {
          setUsuario(null);
          setError("No se ha encontrado el usuario");
        }
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message || "Error al obtener los datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [usuarioID]);

  return { usuario, loading, error };
}