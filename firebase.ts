import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This configuration was found misplaced in another component file.
// It is now correctly placed here for proper Firebase initialization.
const firebaseConfig = {
  apiKey: "AIzaSyDiv333Axa_jUTzxp-lgxzXLU5chsYVWEw",
  authDomain: "words-learning-5c17e.firebaseapp.com",
  projectId: "words-learning-5c17e",
  storageBucket: "words-learning-5c17e.firebasestorage.app",
  messagingSenderId: "916538827301",
  appId: "1:916538827301:web:9ce25fcbdeed4c056e95cc",
  measurementId: "G-46Q8T2XNEV"
};

// A guard clause to ensure the Firebase config is present and valid.
if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('Firebase configuration is missing or invalid.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();