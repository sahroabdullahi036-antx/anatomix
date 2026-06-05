import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { FirestoreRoom, RoomPlayer, subscribeToRoom, updateRoom, deleteRoom } from "@/firebase/firestoreService";

const IS_HOST = (u: string) => u.toLowerCase() === "gameshowhost";
const Q_TIMEOUT = 15000;

export default function GameRoom() {
  const { code } = useParams<{ code: string }>();
  const [, navigate] = useLocation();
  const { user, recordCorrect, recordMiss } = useUser();
  const { db, ready } = useFirebase();
  const [room, setRoom] = useState<FirestoreRoom | null>(null);
  const [error, setError] = useState("");
  const [typed, setTyped] = useState("");
  const [answered, setAnswered] = useState(false);
  const [buzzed, setBuzzed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHost = user ? IS_HOST(user.username) : false;

  useEffect(() => {
    if (!db || !code) return;
    const unsub = subscribeToRoom(db, code.toUpperCase(), r => {
      if (!r) { setError("Room not found or ended."); return; }
      setRoom(r);
      if (r.questionIndex !== undefined) { setAnswered(false); setBuzzed(false); setTyped(""); }
    });
    return () => { unsub(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [db, code]);

  const username = user?.username ?? "Anonymous";
  const q = room?.questions[room.questionIndex];
  const players = Object.values(room?.players ?? {}).sort((a, b) => b.score - a.score);
  const myPlayer = room?.players[username];
  const alive = myPlayer?.status === "alive" || myPlayer?.status === "waiting";
  const finished = room?.status === "finished";

  const advanceQ = async () => {
    if (!db || !room) return;
    const next = room.questionIndex + 1;
    if (next >= room.questions.length) {
      await updateRoom(db, room.roomCode, { status: "finished" });
    } else {
      const resetPlayers: Record<string, RoomPlayer> = {};
      for (const [k, v] of Object.entries(room.players)) {
        resetPlayers[k] = { ...v, answered: false, answerCorrect: undefined };
      }
      await updateRoom(db, room.roomCode, { questionIndex: next, players: resetPlayers });
    }
  };

  const startGame = async () => {
    if (!db || !room) return;
    await updateRoom(db, room.roomCode, { status: "playing", startedAt: Date.now() });
  };

  const handleAnswer = async (choice: string) => {
    if (!db || !room || !q || answered || !alive) return;
    const correct = choice === q.meaning;
    setAnswered(true);
    if (correct) recordCorrect(q.termId);
    else recordMiss(q.termId, q.term);
    const updatedPlayer: RoomPlayer = {
      ...room.players[username],
      answered: true,
      answerCorrect: correct,
      answerTime: Date.now(),
      score: room.players[username].score + (correct ? (room.mode === "blitz" ? 2 : 1) : 0),
      status: room.mode === "elimination" && !correct ? "eliminated" : room.players[username].status,
    };
    await updateRoom(db, room.roomCode, { [`players.${username}`]: updatedPlayer });
    if (isHost) {
      const allAnswered = Object.values({ ...room.players, [username]: updatedPlayer }).every(p => p.answered || p.status === "eliminated");
      if (allAnswered) setTimeout(() => advanceQ(), 2000);
    }
  };

  const handleTypingSubmit = async () => {
    if (!db || !room || !q || answered) return;
    const correct = typed.toLowerCase().trim() === q.term.toLowerCase().trim();
    setAnswered(true);
    if (correct) recordCorrect(q.termId);
    else recordMiss(q.termId, q.term);
    const updatedPlayer: RoomPlayer = {
      ...room.players[username],
      answered: true, answerCorrect: correct, answerTime: Date.now(), typedAnswer: typed,
      score: room.players[username].score + (correct ? 3 : 0),
    };
    await updateRoom(db, room.roomCode, { [`players.${username}`]: updatedPlayer });
  };

  const handleBuzz = async () => {
    if (!db || !room || buzzed) return;
    setBuzzed(true);
    await updateRoom(db, room.roomCode, { [`players.${username}.answered`]: true });
  };

  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)", justifyContent: "space-between" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };
  const modeLabel = { blitz: "Blitz Race", elimination: "Elimination Royale", "quiz-show": "Quiz Show", cooperative: "Cooperative Survival", "speed-typing": "Speed Typing", "class-review": "Class Review" };

  if (error) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ textAlign: "center", color: "rgba(252,250,247,0.5)" }}>
        <div style={{ marginBottom: "16px" }}>{error}</div>
        <button onClick={() => navigate("/multiplayer")} style={backBtn}>Back to Multiplayer</button>
      </div>
    </div>
  );

  if (!room) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", color: "rgba(252,250,247,0.4)" }}>
      Connecting to room...
    </div>
  );

  if (room.status === "lobby") return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/multiplayer")} style={backBtn}>← Leave</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Room Lobby</span>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: "800", color: "#fcfaf7", letterSpacing: "0.12em" }}>{room.roomCode}</div>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "28px", marginBottom: "24px", border: "1px solid rgba(252,250,247,0.06)", textAlign: "center" }}>
          <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Room Code</div>
          <div style={{ fontFamily: "monospace", fontSize: "3rem", fontWeight: "800", color: "#fcfaf7", letterSpacing: "0.2em" }}>{room.roomCode}</div>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.85rem", marginTop: "8px" }}>Share this with players. They enter it at Dashboard - Multiplayer.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.82rem" }}>{modeLabel[room.mode]} - {room.chapterFilter > 0 ? `Chapter ${room.chapterFilter}` : "All Chapters"}</div>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.82rem" }}>{players.length} player{players.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          {players.map(p => (
            <div key={p.username} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", border: "1px solid rgba(252,250,247,0.06)" }}>
              <span style={{ color: "#fcfaf7", fontWeight: "600" }}>{p.username}</span>
              {IS_HOST(p.username) && <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.8rem" }}>Host</span>}
            </div>
          ))}
        </div>
        {isHost && <button onClick={startGame} disabled={players.length < 1} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Start Game ({players.length} players)</button>}
        {!isHost && <div style={{ textAlign: "center", color: "rgba(252,250,247,0.35)", fontSize: "0.9rem" }}>Waiting for host to start the game...</div>}
      </div>
    </div>
  );

  if (finished) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={hdr}>
          <button onClick={() => navigate("/multiplayer")} style={backBtn}>← Multiplayer</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Game Over</span>
        </div>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Winner</div>
            <div style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800" }}>{sorted[0]?.username}</div>
          </div>
          {sorted.map((p, i) => (
            <div key={p.username} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "14px 18px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${i === 0 ? "rgba(212,168,67,0.3)" : "rgba(252,250,247,0.06)"}` }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: i === 0 ? "#d4a843" : "rgba(252,250,247,0.3)", fontWeight: "700", width: "24px" }}>#{i + 1}</span>
                <span style={{ color: "#fcfaf7", fontWeight: "600" }}>{p.username}</span>
                {p.status === "eliminated" && <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.75rem" }}>eliminated</span>}
              </div>
              <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.1rem" }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allAnswered = Object.values(room.players).every(p => p.answered || p.status === "eliminated");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{modeLabel[room.mode]}</span>
          <span style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.8rem" }}>{room.roomCode}</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>Q{room.questionIndex + 1}/{room.questions.length}</span>
          {!alive && <span style={{ color: "#c07070", fontSize: "0.82rem", fontWeight: "700" }}>Eliminated</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0", height: "calc(100vh - 57px)" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px" }}>
          {q && (
            <>
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "28px 32px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
                {room.mode === "speed-typing" ? (
                  <>
                    <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Type the term</div>
                    <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>{q.meaning}</div>
                    <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>{q.definition}</div>
                  </>
                ) : room.mode === "quiz-show" ? (
                  <>
                    <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Buzz in to answer</div>
                    <div style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", fontFamily: "monospace", marginBottom: "8px" }}>{q.term}</div>
                    <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.9rem" }}>{q.meaning}</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Select the correct meaning</div>
                    <div style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", fontFamily: "monospace" }}>{q.term}</div>
                  </>
                )}
              </div>

              {!alive ? (
                <div style={{ textAlign: "center", color: "rgba(252,250,247,0.3)", padding: "24px" }}>You have been eliminated. Watching the game...</div>
              ) : room.mode === "speed-typing" ? (
                <div>
                  <input value={typed} onChange={e => setTyped(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTypingSubmit()} disabled={answered} placeholder="Type the medical term..." style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.12)", fontFamily: "monospace", fontSize: "1.1rem", outline: "none", boxSizing: "border-box", marginBottom: "12px" }} />
                  <button onClick={handleTypingSubmit} disabled={!typed.trim() || answered} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Submit</button>
                </div>
              ) : room.mode === "quiz-show" ? (
                <div style={{ textAlign: "center" }}>
                  {!buzzed ? (
                    <button onClick={handleBuzz} style={{ padding: "20px 60px", borderRadius: "16px", backgroundColor: "#6a3040", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1.2rem" }}>BUZZ IN</button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {q.choices.map(c => (
                        <button key={c} onClick={() => handleAnswer(c)} disabled={answered} style={{ padding: "14px 18px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {q.choices.map(c => (
                    <button key={c} onClick={() => handleAnswer(c)} disabled={answered} style={{ padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(252,250,247,0.07)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fcfaf7", cursor: answered ? "default" : "pointer", fontFamily: "inherit", fontWeight: "600" }}>{c}</button>
                  ))}
                </div>
              )}

              {answered && <div style={{ textAlign: "center", color: myPlayer?.answerCorrect ? "#7aaa7a" : "#c07070", fontWeight: "700", marginTop: "16px" }}>{myPlayer?.answerCorrect ? "Correct!" : "Wrong"}</div>}
              {isHost && allAnswered && room.mode !== "quiz-show" && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button onClick={advanceQ} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
                    {room.questionIndex + 1 >= room.questions.length ? "End Game" : "Next Question"}
                  </button>
                </div>
              )}
              {isHost && room.mode === "quiz-show" && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button onClick={advanceQ} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
                    {room.questionIndex + 1 >= room.questions.length ? "End Game" : "Next"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ width: "220px", borderLeft: "1px solid rgba(252,250,247,0.07)", padding: "20px 16px", overflowY: "auto" }}>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Players</div>
          {players.map((p, i) => (
            <div key={p.username} style={{ marginBottom: "8px", padding: "8px 10px", borderRadius: "8px", backgroundColor: p.status === "eliminated" ? "rgba(160,70,70,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(252,250,247,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: p.status === "eliminated" ? "rgba(252,250,247,0.3)" : "#fcfaf7", fontSize: "0.85rem", fontWeight: "600" }}>{p.username}</span>
                <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "0.85rem" }}>{p.score}</span>
              </div>
              {p.answered && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#7aaa7a", marginTop: "4px" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
