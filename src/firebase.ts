import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase configuration from the console
const firebaseConfig = {
  apiKey: "AIzaSyBhUxoo_Cf0KJ2sUKGzcixHBEilNweBacc",
  authDomain: "decisionstock-c481a.firebaseapp.com",
  projectId: "decisionstock-c481a",
  storageBucket: "decisionstock-c481a.firebasestorage.app",
  messagingSenderId: "395813170099",
  appId: "1:395813170099:web:6f646668c7513bac2a39c6",
  measurementId: "G-BNX3BVDTTL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
