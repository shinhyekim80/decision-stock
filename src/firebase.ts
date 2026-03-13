import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence } from "firebase/firestore";

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
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore persistence is not supported by this browser');
    }
});

export const googleProvider = new GoogleAuthProvider();
