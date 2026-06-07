import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { subscribeToUsers, FirestoreUserProgress } from "@/firebase/firestoreService";
import ProfilePic from "@/components/ProfilePic";

const BG = "#252830";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(252,250,247,0.08)";
const TEXT = "#fcfaf7";
const MUTED = "rgba(252,250,247,0.45)";
const ACCENT = "#4a6080";

function getISOWeek(d = new Date()) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
}
const THIS_WEEK_KEY = `w${new Date().getFullYear()}_${getISOWeek()}`;

function PodiumBlock({ rank, user, isMe }: { rank: 1 | 2 | 3; user: FirestoreUserProgress | null; isMe: boolean }) {
  const heights = { 1: 90, 2: 66, 3: 50 };
  const colors = { 1: "#d4a843", 2: "#8fa8c0", 3: "#b07858" };
  const h = heights[rank];
  const c = colors[rank];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "90px" }}>
      {user && (
        <div style={{ animation: "avatar-bob 2s ease-in-out infinite", animationDelay: `${(rank - 1) * 0.4}s`, marginBottom: "8px" }}>
          <ProfilePic src={user.profilePic} name={user.username} size={56} />
        </div>
      )}
      {!user && <div style={{ width: "56px", height: "93px" }} />}
      <div style={{ color: isMe ? "#fcfaf7" : MUTED, fontSize: "0.78rem", fontWeight: "700", marginBottom: "4px", textAlign: "center", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {user?.username ?? "-"}
      </div>
      <div style={{
        width: "100%", height: `${h}px`, backgroundColor: c, borderRadius: "8px 8px 0 0",
        display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10px",
        boxShadow: `0 -4px 0 ${c}99, inset 0 -6px 0 rgba(0,0,0,0.2)`,
        border: isMe ? `2px solid ${TEXT}` : "none",
      }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "800", fontSize: "1.3rem" }}>{rank}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { db, ready } = useFirebase();
  const [users, setUsers] = useState<FirestoreUserProgress[]>([]);
  const [sortMode, setSortMode] = useState<"total" | "weekly">("total");

  useEffect(() => {
    if (!db || !ready) return;
    return subscribeToUsers(db, setUsers);
  }, [db, ready]);

  const ranked = [...users]
    .map(u => ({
      ...u,
      score: sortMode === "total"
        ? (u.clearedTermIds?.length ?? 0)
        : ((u as any)[THIS_WEEK_KEY] ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .filter(u => u.username.toLowerCase() !== "anatomixowner");

  const top3 = [ranked[0] ?? null, ranked[1] ?? null, ranked[2] ?? null];
  const myUsername = user?.username?.toLowerCase() ?? "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>Back</button>
        <span style={{ color: TEXT, fontWeight: "800", fontSize: "1.1rem" }}>Leaderboard</span>
        <div style={{ display: "flex", gap: "6px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "3px" }}>
          {(["total", "weekly"] as const).map(m => (
            <button key={m} onClick={() => setSortMode(m)} style={{
              padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: "700", fontSize: "0.8rem",
              backgroundColor: sortMode === m ? ACCENT : "transparent",
              color: sortMode === m ? TEXT : MUTED, transition: "all 0.15s",
            }}>
              {m === "total" ? "All Time" : "This Week"}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "32px 24px", display: "flex", gap: "28px" }}>
        {/* Podium */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "300px" }}>
          <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "24px" }}>
            {sortMode === "total" ? "Total Terms Cleared" : "Terms This Week"}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "0" }}>
            <PodiumBlock rank={2} user={top3[1]} isMe={top3[1]?.username?.toLowerCase() === myUsername} />
            <PodiumBlock rank={1} user={top3[0]} isMe={top3[0]?.username?.toLowerCase() === myUsername} />
            <PodiumBlock rank={3} user={top3[2]} isMe={top3[2]?.username?.toLowerCase() === myUsername} />
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0 0 6px 6px" }} />
        </div>

        {/* Roster */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
            Full Rankings
          </div>
          {ranked.length === 0 && (
            <div style={{ color: MUTED, fontSize: "0.9rem", textAlign: "center", padding: "40px 0" }}>No student data yet.</div>
          )}
          {ranked.map((u, i) => {
            const isMe = u.username.toLowerCase() === myUsername;
            return (
              <div
                key={u.username}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  backgroundColor: isMe ? "rgba(74,96,128,0.18)" : CARD,
                  border: `1px solid ${isMe ? "rgba(74,96,128,0.4)" : BORDER}`,
                  borderRadius: "12px", padding: "10px 14px",
                  boxShadow: isMe ? "0 0 0 1px rgba(74,96,128,0.2)" : "none",
                  animation: isMe ? "glow-pulse 3s ease-in-out infinite" : "none",
                }}
              >
                <span style={{ color: i < 3 ? ["#d4a843","#8fa8c0","#b07858"][i] : MUTED, fontWeight: "800", fontSize: "0.88rem", minWidth: "24px", textAlign: "center" }}>
                  {i + 1}
                </span>
                <ProfilePic src={u.profilePic} name={u.username} size={36} />
                <span style={{ color: isMe ? TEXT : "rgba(252,250,247,0.85)", fontWeight: isMe ? "700" : "500", fontSize: "0.9rem", flex: 1 }}>
                  {u.username}{isMe ? " (you)" : ""}
                </span>
                <span style={{ color: MUTED, fontSize: "0.82rem", fontWeight: "600" }}>
                  {u.score} {sortMode === "total" ? "cleared" : "this week"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes avatar-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(74,96,128,0.2); }
          50% { box-shadow: 0 0 12px rgba(74,96,128,0.35); }
        }
      `}</style>
    </div>
  );
}
