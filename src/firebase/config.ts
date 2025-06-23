import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase config - replace these with your actual Firebase project credentials
// You can find these in your Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "your-actual-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-messaging-sender-id",
  appId: "your-actual-app-id"
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