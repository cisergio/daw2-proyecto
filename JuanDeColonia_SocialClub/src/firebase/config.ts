// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, getDocs, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB03CIs3C7x-za2VFMj6OwdK4RqczMz_DE",
  authDomain: "proyectoprimerasemana.firebaseapp.com",
  projectId: "proyectoprimerasemana",
  storageBucket: "proyectoprimerasemana.firebasestorage.app",
  messagingSenderId: "765557578274",
  appId: "1:765557578274:web:09fc7f365261a4be2ac87b",
  measurementId: "G-80YHXLC0LP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, app, firestore, getDocs, addDoc, storage };
