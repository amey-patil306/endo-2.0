import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase config - replace these with your actual Firebase project credentials
// You can find these in your Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAGkmgVeHSvy_m4Ux361ljd7KzrtqTTyQ0",
  authDomain: "endo-efbc7.firebaseapp.com",
  projectId: "endo-efbc7",
  storageBucket: "endo-efbc7.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase - check if app already exists to prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence and network recovery
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ enableNetwork }) => {
    enableNetwork(db).catch((error) => {
      console.warn('Failed to enable Firestore network:', error);
    });
  });
}

export default app;