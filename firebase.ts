import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This configuration is now an object injected directly by Vite's `define` config.
// FIX: The config is injected as a JSON string, so it must be parsed into an object.
// The type assertion `as string` is necessary for TypeScript to compile.
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG as string);

  // Validate that required fields are present and not placeholder values
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field] || firebaseConfig[field].includes('your_'));

  if (missingFields.length > 0) {
    throw new Error(`Firebase configuration is incomplete. Please update your .env file with valid Firebase credentials. Missing or invalid fields: ${missingFields.join(', ')}`);
  }
} catch (error) {
  if (error instanceof SyntaxError) {
    throw new Error('Firebase configuration is missing. Please check your .env file and ensure the Vite dev server is running correctly.');
  }
  throw error;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();