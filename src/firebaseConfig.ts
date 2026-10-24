// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBQoAonXSEjwYE3f5O-IcFr-pdSpoddam8",
  authDomain: "kissan-connect-bcc8c.firebaseapp.com",
  projectId: "kissan-connect-bcc8c",
  storageBucket: "kissan-connect-bcc8c.firebasestorage.app",
  messagingSenderId: "127200574291",
  appId: "1:127200574291:web:32051cc6f5274072483fa6",
  measurementId: "G-K1K3ECXXCF"
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analyticsInstance: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => null);
}
export const analytics = analyticsInstance;

export const auth: Auth = getAuth(app);

// Initialize Firestore on default database "(default)" with experimentalForceLongPolling and ignoreUndefinedProperties
export const db: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
});

export const firestoreDatabaseId = '(default)';

// Checks if real Firebase credentials have been configured
export const isFirebaseConfigured = (): boolean => true;
