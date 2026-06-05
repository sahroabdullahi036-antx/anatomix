import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { subscribeToUsers, subscribeToClasses, saveClass, deleteClass, addStudentToClass, removeStudentFromClass, FirestoreUserProgress, FirestoreClass } from "@/firebase/firestoreService";
import { CHAPTERS } from "@/data/medicalData";

const IS_HOST = (u: string) => u.toLowerCase() === "gameshowhost";

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(0,0,0,0.3)", overflow: "hidden", flex: 1 }}><div style={{ height: "100%", width: `${pct * 100}%`, backgroundColor: color, borderRadius: "2px" }} /></div>;
}

export default function ModeratorDashboard() {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { db, ready } = useFirebase();
  const [students, setStudents] = useState<FirestoreUserProgress[]>([]);
  const [classes, setClasses] = useState<FirestoreClass[]>([]);
  const [tab, setTab] = useState<"roster" | "classes" | "games">("roster");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [newClassName, setNewClassName] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_HOST(user?.username ?? "")) navigate("/");
  }, [user]);

  useEffect(() => {
    if (!db) return;
    const u1 = subscribeToUsers(db, s => setStudents(s.filter(s => !IS_HOST(s.username))));
    const u2 = subscribeToClasses(db, setClasses);
    return () => { u1(); u2(); };
  }, [db]);

  const filteredStudents = filterClass === "all" ? students : students.filter(s => {
    const cls = classes.find(c => c.id === filterClass);
    return cls?.memberUsernames.includes(s.username);
  });

  const createClass = async () => {
    if (!db || !newClassName.trim()) return;
    const cls: FirestoreClass = { id: Date.now().toString(), name: newClassName.trim(), memberUsernames: [], createdAt: Date.now() };
    await saveClass(db, cls);
    setNewClassName("");
  };

  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)", justifyContent: "space-between" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };
  const tabBtn = (key: typeof tab) => ({ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer" as const, fontFamily: "inherit", fontWeight: "700" as const, fontSize: "0.9rem", backgroundColor: tab === key ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7" });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.1rem" }}>AnatomiX Moderator</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>GameshowHost</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/multiplayer")} style={backBtn}>Host a Game</button>
          <button onClick={() => navigate("/")} style={backBtn}>Student View</button>
        </div>
      </div>

      {!ready && <div style={{ backgroundColor: "rgba(200,150,50,0.12)", padding: "10px 24px", color: "rgba(252,250,247,0.6)", fontSize: "0.82rem" }}>Connecting to server...</div>}

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          <button onClick={() => setTab("roster")} style={tabBtn("roster")}>Student Roster ({students.length})</button>
          <button onClick={() => setTab("classes")} style={tabBtn("classes")}>Classes ({classes.length})</button>
          <button onClick={() => setTab("games")} style={tabBtn("games")}>Game Rooms</button>
        </div>

        {tab === "roster" && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "0.9rem" }}>
                <option value="all">All Students ({students.length})</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.memberUsernames.length})</option>)}
              </select>
              <span style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.82rem" }}>{filteredStudents.length} shown</span>
            </div>
            {filteredStudents.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(252,250,247,0.3)", padding: "60px" }}>No students have synced progress yet. Students appear here after their first study session.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredStudents.sort((a, b) => b.lastSeen - a.lastSeen).map(s => {
                  const exp = expandedStudent === s.username;
                  const cleared = s.clearedTermIds?.length ?? 0;
                  const studentClasses = classes.filter(c => c.memberUsernames.includes(s.username)).map(c => c.name);
                  return (
                    <div key={s.username} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(252,250,247,0.06)", overflow: "hidden" }}>
                      <div onClick={() => setExpandedStudent(exp ? null : s.username)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                            <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{s.username}</span>
                            {studentClasses.length > 0 && studentClasses.map(c => <span key={c} style={{ backgroundColor: "rgba(74,96,128,0.4)", color: "rgba(252,250,247,0.7)", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px" }}>{c}</span>)}
                          </div>
                          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem" }}>{cleared} terms cleared</span>
                            <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem" }}>{s.studyStreak ?? 0} day streak</span>
                            <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem" }}>{s.criticalReviewCount} in review</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={e => { e.stopPropagation(); setAssignModal(s.username); }} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(252,250,247,0.6)", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Assign Class</button>
                          <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.72rem" }}>{new Date(s.lastSeen).toLocaleDateString()}</span>
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

        {tab === "classes" && (
          <>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
              <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "12px" }}>Create New Class</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Class name (e.g. Period 2, Tuesday Section)..." style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit" }} />
                <button onClick={createClass} style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Create</button>
              </div>
            </div>
            {classes.map(cls => (
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
                  {cls.memberUsernames.length === 0 && <span style={{ color: "rgba(252,250,247,0.25)", fontSize: "0.82rem" }}>No students assigned yet. Use "Assign Class" on the roster.</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "games" && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "24px" }}>Create and manage live game rooms for your class.</p>
            <button onClick={() => navigate("/multiplayer")} style={{ padding: "14px 32px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Create a Game Room</button>
          </div>
        )}
      </div>

      {assignModal && (
        <div onClick={() => setAssignModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#2e3240", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px", border: "1px solid rgba(252,250,247,0.1)" }}>
            <h3 style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "4px" }}>Assign to Class</h3>
            <p style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.85rem", marginBottom: "16px" }}>{assignModal}</p>
            {classes.map(cls => {
              const inClass = cls.memberUsernames.includes(assignModal);
              return (
                <button key={cls.id} onClick={() => { if (!db) return; inClass ? removeStudentFromClass(db, cls.id, assignModal) : addStudentToClass(db, cls.id, assignModal); }} style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", backgroundColor: inClass ? "rgba(74,96,128,0.4)" : "rgba(255,255,255,0.05)", color: "#fcfaf7", border: inClass ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(252,250,247,0.07)", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", textAlign: "left", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>{cls.name}</span><span style={{ color: inClass ? "#7aaa7a" : "rgba(252,250,247,0.3)" }}>{inClass ? "Remove" : "Add"}</span>
                </button>
              );
            })}
            {classes.length === 0 && <p style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.82rem" }}>No classes yet. Create one in the Classes tab.</p>}
            <button onClick={() => setAssignModal(null)} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: "8px" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
