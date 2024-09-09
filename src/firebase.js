// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Import de Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjPaDBeUqiaCdrxAwusUBlH7I9x64Nsec",
  authDomain: "mariama-project.firebaseapp.com",
  databaseURL:
    "https://mariama-project-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mariama-project",
  storageBucket: "mariama-project.appspot.com",
  messagingSenderId: "1039293262969",
  appId: "1:1039293262969:web:aa36e092fd0bf1003078a8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialisation de Realtime Database

export const auth = getAuth(app);
export { db };
export default app;
