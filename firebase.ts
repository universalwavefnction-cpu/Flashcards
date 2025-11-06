import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This configuration is now an object injected directly by Vite's `define` config.
// The config is injected as a JSON string, so it must be parsed into an object.
// Added safety check to handle undefined config gracefully.
const firebaseConfig = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG as string)
  : (() => { throw new Error('Firebase configuration is missing. Please check your environment variables.'); })();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();