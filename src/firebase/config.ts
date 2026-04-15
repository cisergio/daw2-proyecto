import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzz69a1qZIerFhy4JJGmxMxtZXGqcg7I0",
  authDomain: "juandecolonia-socialclub.firebaseapp.com",
  projectId: "juandecolonia-socialclub",
  storageBucket: "juandecolonia-socialclub.firebasestorage.app",
  messagingSenderId: "803457189688",
  appId: "1:803457189688:web:0e4050439986bc3a4ae3cd",
  measurementId: "G-C128D57KEW"
};

// Patrón Singleton para Next.js: Inicializa solo si no existe ya una instancia
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const firestore = getFirestore(app);
