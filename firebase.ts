import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This configuration is now an object injected directly by Vite's `define` config.
// FIX: The config is injected as a JSON string, so it must be parsed into an object.
// The type assertion `as string` is necessary for TypeScript to compile.
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG as string);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();