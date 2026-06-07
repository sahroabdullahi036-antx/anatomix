import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, Auth } from "firebase/auth";

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  ready: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({ app: null, db: null, auth: null, ready: false });

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "anatomix-c3885.firebaseapp.com",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "anatomix-c3885",
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "anatomix-c3885.firebasestorage.app",
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "31474037206",
        appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:31474037206:web:db3cf1ac01a67d4105b477",
      };
      const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
      const firestore = getFirestore(firebaseApp);
      const firebaseAuth = getAuth(firebaseApp);
      setApp(firebaseApp);
      setDb(firestore);
      setAuth(firebaseAuth);
      signInAnonymously(firebaseAuth)
        .then(() => setReady(true))
        .catch((err) => { console.error("Anonymous auth failed:", err?.code, err?.message); setReady(true); });
    } catch (err) {
      console.error("Firebase init error:", err);
      setReady(false);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, db, auth, ready }}>
      {children}
    </FirebaseContext.Provider>
  );
};
