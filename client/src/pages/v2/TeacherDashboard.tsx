import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { subscribeToUsers, subscribeToClasses, saveClass, deleteClass, addStudentToClass, removeStudentFromClass, subscribeToUserPins, setUserPin, clearUserPin, UserPinEntry, FirestoreUserProgress, FirestoreClass } from "@/firebase/firestoreService";
import { CHAPTERS } from "@/data/medicalData";
import OnboardingTour, { Step } from "./OnboardingTour";

const TEACHER_TOUR_STEPS: Step[] = [
  {
    title: "Welcome to your Teacher dashboard",
    desc: "This is where you manage your classes and keep an eye on your students. Here is a quick look around.",
  },
  {
    title: "Top bar",
    desc: "Open this Guide any time, jump into Chat, host a live multiplayer game, or open Study to review the material yourself.",
    targetId: "teacher-tour-header",
  },
  {
    title: "Your tabs",
    desc: "Create and manage your classes, see how each of your students is progressing, and run game rooms for your sections.",
    targetId: "teacher-tour-tabs",
  },
];

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(0,0,0,0.3)", overflow: "hidden", flex: 1 }}><div style={{ height: "100%", width: `${pct * 100}%`, backgroundColor: color, borderRadius: "2px" }} /></div>;
}

export default function TeacherDashboard() {
  const [, navigate] = useLocation();
  const { user, logout } = useUser();
  const { db, ready } = useFirebase();
  const [allStudents, setAllStudents] = useState<FirestoreUserProgress[]>([]);
  const [allClasses, setAllClasses] = useState<FirestoreClass[]>([]);
  const [tab, setTab] = useState<"classes" | "students" | "games">("classes");
  const [newClassName, setNewClassName] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [pins, setPins] = useState<Record<string, UserPinEntry>>({});
  const [pinModal, setPinModal] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const toKey = (u: string) => u.toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    if (!db || !ready) return;
    const u1 = subscribeToUsers(db, setAllStudents);
    const u2 = subscribeToClasses(db, setAllClasses);
    const u3 = subscribeToUserPins(db, setPins);
    return () => { u1(); u2(); u3(); };
  }, [db, ready]);

  const myUsername = user?.username.toLowerCase() ?? "";
  const myClasses = allClasses.filter(c => !c.ownerUsername || c.ownerUsername === myUsername);
  const myStudentUsernames = new Set(myClasses.flatMap(c => c.memberUsernames));
  const myStudents = allStudents.filter(s => myStudentUsernames.has(s.username));

  const createClass = async () => {
    if (!db || !newClassName.trim() || !user) return;
    const cls: FirestoreClass = { id: Date.now().toString(), name: newClassName.trim(), memberUsernames: [], createdAt: Date.now(), ownerUsername: myUsername };
    await saveClass(db, cls);
    setNewClassName("");
  };

  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)", justifyContent: "space-between" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };
  const tabBtn = (key: typeof tab) => ({ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer" as const, fontFamily: "inherit", fontWeight: "700" as const, fontSize: "0.9rem", backgroundColor: tab === key ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7" });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      {showTour && <OnboardingTour onDone={() => setShowTour(false)} steps={TEACHER_TOUR_STEPS} />}
      <div style={hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.1rem" }}>AnatomiX Teacher</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>{user?.username}</span>
        </div>
        <div id="teacher-tour-header" style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowTour(true)} style={backBtn}>Guide</button>
          <button onClick={() => navigate("/chat")} style={backBtn}>Chat</button>
          <button onClick={() => navigate("/multiplayer")} style={backBtn}>Host a Game</button>
          <button onClick={() => navigate("/flashcards")} style={backBtn}>Study</button>
          <button onClick={logout} style={{ ...backBtn, backgroundColor: "rgba(200,80,80,0.18)", border: "1px solid rgba(200,90,90,0.4)" }} data-testid="button-logout">Log Out</button>
        </div>
      </div>

      {!ready && <div style={{ backgroundColor: "rgba(200,150,50,0.12)", padding: "10px 24px", color: "rgba(252,250,247,0.6)", fontSize: "0.82rem" }}>Connecting to server...</div>}

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px" }}>
        <div id="teacher-tour-tabs" style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          <button onClick={() => setTab("classes")} style={tabBtn("classes")}>My Classes ({myClasses.length})</button>
          <button onClick={() => setTab("students")} style={tabBtn("students")}>Students ({myStudents.length})</button>
          <button onClick={() => setTab("games")} style={tabBtn("games")}>Game Rooms</button>
        </div>

        {tab === "classes" && (
          <>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
              <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "12px" }}>Create New Class</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Class name (e.g. Period 2, Tuesday Section)..." style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit" }} />
                <button onClick={createClass} style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Create</button>
              </div>
            </div>

            {myClasses.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(252,250,247,0.3)", padding: "60px" }}>No classes yet. Create one above to get started.</div>
            ) : myClasses.map(cls => (
              <div key={cls.id} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px", marginBottom: "12px", border: "1px solid rgba(252,250,247,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{cls.name}</span>
                    <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem", marginLeft: "10px" }}>{cls.memberUsernames.length} students</span>
                  </div>
                  <button onClick={() => db && deleteClass(db, cls.id)} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(160,70,70,0.3)", color: "#e09090", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Delete</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {cls.memberUsernames.map(u => (
                    <span key={u} style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "6px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#fcfaf7", fontSize: "0.82rem" }}>{u}</span>
                      <button onClick={() => db && removeStudentFromClass(db, cls.id, u)} style={{ background: "none", border: "none", color: "rgba(252,250,247,0.3)", cursor: "pointer", padding: "0", fontSize: "0.9rem" }}>x</button>
                    </span>
                  ))}
                  {cls.memberUsernames.length === 0 && <span style={{ color: "rgba(252,250,247,0.25)", fontSize: "0.82rem" }}>No students assigned yet.</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "students" && (
          <>
            {myStudents.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(252,250,247,0.3)", padding: "60px" }}>No students in your classes yet. Add students from the Classes tab.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {myStudents.sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0)).map(s => {
                  const exp = expandedStudent === s.username;
                  const cleared = s.clearedTermIds?.length ?? 0;
                  const studentClasses = myClasses.filter(c => c.memberUsernames.includes(s.username)).map(c => c.name);
                  return (
                    <div key={s.username} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(252,250,247,0.06)", overflow: "hidden" }}>
                      <div onClick={() => setExpandedStudent(exp ? null : s.username)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                            <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{s.username}</span>
                            {studentClasses.map(c => <span key={c} style={{ backgroundColor: "rgba(74,96,128,0.4)", color: "rgba(252,250,247,0.7)", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px" }}>{c}</span>)}
                          </div>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem" }}>{cleared} terms cleared</span>
                            <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem" }}>{s.studyStreak ?? 0} day streak</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {pins[toKey(s.username)]?.pin && <span style={{ backgroundColor: "rgba(74,96,128,0.4)", color: "#7aabcc", fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>PIN</span>}
                          <button onClick={e => { e.stopPropagation(); setAssignModal(s.username); }} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(252,250,247,0.6)", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Assign Class</button>
                          <button onClick={e => { e.stopPropagation(); setPinModal(s.username); setPinInput(""); }} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(60,80,120,0.3)", color: "#7aabcc", border: "1px solid rgba(74,96,128,0.25)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>{pins[toKey(s.username)]?.pin ? "Reset PIN" : "Set PIN"}</button>
                          <button onClick={e => { e.stopPropagation(); if (!db) return; myClasses.filter(c => c.memberUsernames.includes(s.username)).forEach(c => removeStudentFromClass(db!, c.id, s.username)); }} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(160,70,70,0.25)", color: "#e09090", border: "1px solid rgba(160,70,70,0.2)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Remove</button>
                          <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.72rem", alignSelf: "center" }}>{new Date(s.lastSeen ?? 0).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {exp && (
                        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(252,250,247,0.05)" }}>
                          <div style={{ paddingTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                            {CHAPTERS.map(ch => {
                              const chCleared = ch.termIds.filter(id => (s.clearedTermIds ?? []).includes(id)).length;
                              const pct = ch.termIds.length > 0 ? chCleared / ch.termIds.length : 0;
                              return (
                                <div key={ch.num} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px 12px" }}>
                                  <div style={{ color: "#fcfaf7", fontSize: "0.78rem", fontWeight: "600", marginBottom: "6px" }}>{ch.title}</div>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <StatBar value={chCleared} max={ch.termIds.length} color={pct >= 0.8 ? "#7aaa7a" : "#4a6080"} />
                                    <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.7rem", whiteSpace: "nowrap" }}>{Math.round(pct * 100)}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "games" && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "24px" }}>Create and manage live game rooms for your class.</p>
            <button onClick={() => navigate("/multiplayer")} style={{ padding: "14px 32px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Create a Game Room</button>
          </div>
        )}
      </div>

      {pinModal && (
        <div onClick={() => setPinModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#2e3240", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "340px", border: "1px solid rgba(252,250,247,0.1)" }}>
            <h3 style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "4px" }}>{pins[toKey(pinModal)]?.pin ? "Reset PIN" : "Set PIN"}</h3>
            <p style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.85rem", marginBottom: "16px" }}>{pinModal}</p>
            <input
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="Enter new PIN..."
              inputMode="numeric"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "0.9rem", boxSizing: "border-box" as const, marginBottom: "12px" }}
            />
            <p style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.78rem", marginBottom: "14px" }}>Share this PIN with the student. They will need it to log in.</p>
            <div style={{ display: "flex", gap: "8px", flexDirection: "column" as const }}>
              <button disabled={pinSaving || !pinInput.trim()} onClick={async () => { if (!db) return; setPinSaving(true); await setUserPin(db, pinModal!, pinInput.trim()); setPinSaving(false); setPinModal(null); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", opacity: (pinSaving || !pinInput.trim()) ? 0.5 : 1 }}>
                {pinSaving ? "Saving..." : "Set PIN"}
              </button>
              {pins[toKey(pinModal)]?.pin && (
                <button onClick={async () => { if (!db) return; await clearUserPin(db, pinModal!); setPinModal(null); }} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(160,70,70,0.3)", color: "#e09090", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Clear PIN (no PIN required)
                </button>
              )}
              <button onClick={() => setPinModal(null)} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {assignModal && (
        <div onClick={() => setAssignModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#2e3240", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px", border: "1px solid rgba(252,250,247,0.1)" }}>
            <h3 style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "4px" }}>Assign to Class</h3>
            <p style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.85rem", marginBottom: "16px" }}>{assignModal}</p>
            {myClasses.map(cls => {
              const inClass = cls.memberUsernames.includes(assignModal);
              return (
                <button key={cls.id} onClick={() => { if (!db) return; inClass ? removeStudentFromClass(db, cls.id, assignModal) : addStudentToClass(db, cls.id, assignModal); }} style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", backgroundColor: inClass ? "rgba(74,96,128,0.4)" : "rgba(255,255,255,0.05)", color: "#fcfaf7", border: inClass ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(252,250,247,0.07)", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", textAlign: "left", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>{cls.name}</span><span style={{ color: inClass ? "#7aaa7a" : "rgba(252,250,247,0.3)" }}>{inClass ? "Remove" : "Add"}</span>
                </button>
              );
            })}
            {myClasses.length === 0 && <p style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.82rem" }}>No classes yet. Create one in the Classes tab.</p>}
            <button onClick={() => setAssignModal(null)} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: "8px" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
