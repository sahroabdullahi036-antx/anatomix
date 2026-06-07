import { useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { syncUserToFirestore, subscribeToUserDoc } from "@/firebase/firestoreService";

const DEBOUNCE_MS = 3000;

export function useFirebaseSync() {
  const { onSyncNeeded } = useUser();
  const { db, ready } = useFirebase();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ready || !db) return;
    const unsub = onSyncNeeded(user => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        syncUserToFirestore(db, user).catch(() => {});
      }, DEBOUNCE_MS);
    });
    return () => { unsub(); if (timer.current) clearTimeout(timer.current); };
  }, [ready, db, onSyncNeeded]);
}

/** Keeps the local user's moderator-controlled chapter unlocks in sync from Firestore. */
export function useRemoteUserDoc() {
  const { user, applyRemoteUnlocks } = useUser();
  const { db, ready } = useFirebase();
  const username = user?.username;

  useEffect(() => {
    if (!ready || !db || !username) return;
    const unsub = subscribeToUserDoc(db, username, data => {
      applyRemoteUnlocks(Array.isArray(data?.unlockedChapters) ? data!.unlockedChapters! : []);
    });
    return () => unsub();
  }, [ready, db, username, applyRemoteUnlocks]);
}
