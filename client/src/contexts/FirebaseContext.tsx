import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, Auth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseContextType {
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  auth: null,
  db: null,
  user: null,
  loading: true,
});

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
    };

    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);

      setAuth(authInstance);
      setDb(dbInstance);

      // Listen to auth state changes
      const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setLoading(false);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ auth, db, user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};
