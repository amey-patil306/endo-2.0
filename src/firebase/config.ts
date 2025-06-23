import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase config - make sure this is correct
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "endo-efbc7.firebaseapp.com",
  projectId: "endo-efbc7",
  storageBucket: "endo-efbc7.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with additional settings
export const db = getFirestore(app);

// Add these settings to help with connectivity issues
if (typeof window !== 'undefined') {
  // Enable offline persistence
  import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
    // This helps with connectivity issues
    enableNetwork(db).catch(console.error);
  });
}

export default app;