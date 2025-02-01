// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
apiKey:import.meta.env.VITE_PUBLIC_API_KEY || "",
authDomain: import.meta.env.VITE_PUBLIC_AUTH_DOMAIN || "",
projectId:import.meta.env.VITE_PUBLIC_PROJECT_ID || "",
storageBucket:import.meta.env.VITE_PUBLIC_STORAGE_BUCKET || "",
messagingSenderId:import.meta.env.VITE_PUBLIC_MESSAGING_SENDER_ID || "",
appId:import.meta.env.VITE_PUBLIC_APP_ID || "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);