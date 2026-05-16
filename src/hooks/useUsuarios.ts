"use client";
import { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { firestore } from "../firebase/config";

// Cache global para compartir listeners entre múltiples componentes
const userCache: { [uid: string]: { 
  data: any, 
  loading: boolean, 
  error: string | null,
  listeners: Set<(data: any, loading: boolean, error: string | null) => void>,
  unsubscribe?: () => void
}} = {};

/**
 * Hook para obtener los datos de un usuario específico desde Firestore (Optimizado con Cache).
 * @param usuarioID ID del usuario en la colección "usuarios".
 */
export function useUsuario(usuarioID: string | null | undefined) {
  const [data, setData] = useState<any>(userCache[usuarioID || ""]?.data || null);
  const [loading, setLoading] = useState<boolean>(!userCache[usuarioID || ""] || userCache[usuarioID || ""]?.loading);
  const [error, setError] = useState<string | null>(userCache[usuarioID || ""]?.error || null);

  useEffect(() => {
    if (!usuarioID) {
      setLoading(false);
      return;
    }

    // Inicializar cache para este UID si no existe
    if (!userCache[usuarioID]) {
      userCache[usuarioID] = {
        data: null,
        loading: true,
        error: null,
        listeners: new Set(),
      };

      const docRef = doc(firestore, "usuarios", usuarioID);
      userCache[usuarioID].unsubscribe = onSnapshot(docRef, 
        (docSnap) => {
          const newData = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
          const newError = docSnap.exists() ? null : "No encontrado";
          
          userCache[usuarioID].data = newData;
          userCache[usuarioID].loading = false;
          userCache[usuarioID].error = newError;
          
          userCache[usuarioID].listeners.forEach(l => l(newData, false, newError));
        },
        (err) => {
          userCache[usuarioID].loading = false;
          userCache[usuarioID].error = err.message;
          userCache[usuarioID].listeners.forEach(l => l(null, false, err.message));
        }
      );
    }

    // Suscribir este componente a los cambios en el cache
    const updateState = (newData: any, newLoading: boolean, newError: string | null) => {
      setData(newData);
      setLoading(newLoading);
      setError(newError);
    };

    userCache[usuarioID].listeners.add(updateState);
    
    // Si ya tenemos datos, actualizamos el estado inicial del componente
    if (!userCache[usuarioID].loading) {
      updateState(userCache[usuarioID].data, false, userCache[usuarioID].error);
    }

    return () => {
      if (userCache[usuarioID]) {
        userCache[usuarioID].listeners.delete(updateState);
        // Opcional: Podríamos limpiar el listener si no hay más componentes usándolo,
        // pero para una app social suave es mejor mantenerlo en cache mientras la sesión dure.
      }
    };
  }, [usuarioID]);

  return { usuario: data, loading, error };
}