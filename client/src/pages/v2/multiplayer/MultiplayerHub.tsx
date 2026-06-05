import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { ALL_TERMS, CHAPTERS, getTermsByChapter, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { shuffle } from "../games/shared";
import { createRoom, joinRoom, getRoom, FirestoreRoom, RoomPlayer } from "@/firebase/firestoreService";

const MODES = [
  { id: "blitz",       label: "Blitz Race",          desc: "First correct answer scores" },
  { id: "elimination", label: "Elimination Royale",   desc: "Miss once and you're out" },
  { id: "quiz-show",   label: "Quiz Show",            desc: "Host controls pace, players buzz in" },
  { id: "cooperative", label: "Cooperative Survival", desc: "Shared health bar, take turns" },
  { id: "speed-typing",label: "Speed Typing",         desc: "Fastest correct typist scores" },
  { id: "class-review",label: "Class Review",         desc: "Structured review, no competition" },
] as const;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function buildQuestions(chapter: number, count = 20) {
  const pool = chapter > 0 ? getTermsByChapter(chapter) : ALL_TERMS;
  const terms = shuffle(pool.length >= count ? pool : ALL_TERMS).slice(0, count);
  return terms.map(t => {
    const wrong = shuffle(ALL_TERMS.filter(x => x.id !== t.id)).slice(0, 3);
    const choices = shuffle([t, ...wrong]).map(x => x.meaning);
    return { termId: t.id, term: t.term, meaning: t.meaning, definition: t.definition, choices };
  });
}

const IS_HOST = (u: string) => u.toLowerCase() === "gameshowhost";

export default function MultiplayerHub() {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { db, ready } = useFirebase();
  const isHost = user ? IS_HOST(user.username) : false;

  const [tab, setTab] = useState<"join" | "host">(isHost ? "host" : "join");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const [mode, setMode] = useState<FirestoreRoom["mode"]>("blitz");
  const [chapter, setChapter] = useState(0);
  const [creating, setCreating] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };
  const tabBtn = (key: typeof tab) => ({
    padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" as const, fontSize: "0.9rem",
    backgroundColor: tab === key ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7",
  });

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || !db || !user) return;
    setJoining(true);
    setJoinError("");
    try {
      const room = await getRoom(db, code);
      if (!room) { setJoinError("Room not found. Check the code and try again."); setJoining(false); return; }
      if (room.status === "finished") { setJoinError("This game has already ended."); setJoining(false); return; }
      const player: RoomPlayer = { username: user.username, score: 0, status: "alive", answered: false };
      await joinRoom(db, code, player);
      navigate(`/game-room/${code}`);
    } catch { setJoinError("Could not join. Try again."); setJoining(false); }
  };

  const handleCreate = async () => {
    if (!db || !user) return;
    setCreating(true);
    const code = generateCode();
    const questions = buildQuestions(chapter, 20);
    const room: FirestoreRoom = {
      roomCode: code, hostUsername: user.username, mode, chapterFilter: chapter,
      status: "lobby",
      players: { [user.username]: { username: user.username, score: 0, status: "alive", answered: false } },
      questionIndex: 0, questions, groupHealth: 10, maxHealth: 10, createdAt: Date.now(),
    };
    await createRoom(db, room);
    setRoomCode(code);
    setCreating(false);
    navigate(`/game-room/${code}`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}>
        <button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Multiplayer</span>
      </div>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
        {!ready && (
          <div style={{ backgroundColor: "rgba(200,150,50,0.15)", border: "1px solid rgba(200,150,50,0.3)", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", color: "rgba(252,250,247,0.7)", fontSize: "0.85rem" }}>
            Connecting to game server...
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          <button onClick={() => setTab("join")} style={tabBtn("join")}>Join a Game</button>
          {isHost && <button onClick={() => setTab("host")} style={tabBtn("host")}>Create a Room</button>}
        </div>

        {tab === "join" && (
          <div>
            <h2 style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.3rem", marginBottom: "8px" }}>Join a Game</h2>
            <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "24px" }}>Enter the 6-character code from your host to join the room.</p>
            <input value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }} placeholder="Enter room code..." maxLength={6} style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.12)", fontFamily: "monospace", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "0.15em", outline: "none", boxSizing: "border-box", textAlign: "center", marginBottom: "14px" }} />
            {joinError && <div style={{ color: "#c07070", fontSize: "0.85rem", marginBottom: "12px" }}>{joinError}</div>}
            <button onClick={handleJoin} disabled={joinCode.length < 6 || joining || !ready} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: joinCode.length === 6 && ready ? "#4a6080" : "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>
              {joining ? "Joining..." : "Join Room"}
            </button>
          </div>
        )}

        {tab === "host" && isHost && (
          <div>
            <h2 style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.3rem", marginBottom: "8px" }}>Create a Game Room</h2>
            <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "24px" }}>Choose a mode and chapter, then share the code with students.</p>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Game Mode</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setMode(m.id as FirestoreRoom["mode"])} style={{ padding: "14px 18px", borderRadius: "10px", border: mode === m.id ? "2px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: mode === m.id ? "#4a6080" : "rgba(255,255,255,0.04)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "700" }}>{m.label}</span>
                    <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.82rem" }}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Chapter</div>
              <select value={chapter} onChange={e => setChapter(+e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "1rem" }}>
                <option value={0}>All Chapters</option>
                {CHAPTERS.map(ch => <option key={ch.num} value={ch.num}>{ch.title}: {ch.subtitle}</option>)}
              </select>
            </div>
            <button onClick={handleCreate} disabled={creating || !ready} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: ready ? "#4a6080" : "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>
              {creating ? "Creating..." : "Create Room"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
