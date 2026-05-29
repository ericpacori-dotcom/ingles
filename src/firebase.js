import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Las llaves de tu aplicación web
const firebaseConfig = {
  apiKey: "AIzaSyAD75GR7KZmsPxt3YfjYX0KzRK9Hj7d6Uo",
  authDomain: "ingles-235d0.firebaseapp.com",
  projectId: "ingles-235d0",
  storageBucket: "ingles-235d0.firebasestorage.app",
  messagingSenderId: "968424536731",
  appId: "1:968424536731:web:744a05e50cce455dc9243e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar la base de datos (Firestore)
export const db = getFirestore(app);