
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
/**
 * @fileOverview Configuración administrativa de Firebase (Lado del servidor).
 * Utiliza variables de entorno para inicializar el SDK de Admin de forma segura.
 */

if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "studio-1374758894-2c962.firebasestorage.app",
      });
    } catch (error) {
      console.error("Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    }
  } else {
    // Fallback para entornos donde el SDK de Admin se inicializa automáticamente (como App Hosting/Cloud Functions)
    initializeApp();
  }
}

export const adminFirestore = getFirestore();
export const adminStorage = getStorage();
export const auth = getAuth();
