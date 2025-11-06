import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This configuration is now an object injected directly by Vite's `define` config.
// The config is injected as a JSON string, so it must be parsed into an object.
// Added safety check to handle undefined config gracefully.
const firebaseConfig = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG as string)
  : (() => {
      throw new Error(
        'Firebase configuration is missing. Please check your .env file and ensure the Vite dev server is running correctly.\n\n' +
        'Steps to fix:\n' +
        '1. Copy .env.example to .env\n' +
        '2. Fill in your Firebase credentials\n' +
        '3. Restart the dev server with: npm run dev'
      );
    })();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();