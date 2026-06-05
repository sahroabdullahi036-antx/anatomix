import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  ready: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({ app: null, db: null, ready: false });

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
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
      setApp(firebaseApp);
      setDb(firestore);
      setReady(true);
    } catch (err) {
      console.error("Firebase init error:", err);
      setReady(false);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, db, ready }}>
      {children}
    </FirebaseContext.Provider>
  );
};
