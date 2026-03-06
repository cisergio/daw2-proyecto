// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzz69a1qZIerFhy4JJGmxMxtZXGqcg7I0",
  authDomain: "juandecolonia-socialclub.firebaseapp.com",
  projectId: "juandecolonia-socialclub",
  storageBucket: "juandecolonia-socialclub.firebasestorage.app",
  messagingSenderId: "803457189688",
  appId: "1:803457189688:web:28ce83bda2e000034ae3cd",
  measurementId: "G-CK30LGT9XJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);