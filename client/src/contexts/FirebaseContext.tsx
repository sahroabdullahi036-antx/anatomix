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
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
      const firestore = getFirestore(firebaseApp);
      const firebaseAuth = getAuth(firebaseApp);
      setApp(firebaseApp);
      setDb(firestore);
      setAuth(firebaseAuth);
      signInAnonymously(firebaseAuth)
        .then(() => setReady(true))
        .catch(() => setReady(true));
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
