import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { subscribeToUsers, subscribeToClasses, saveClass, deleteClass, addStudentToClass, removeStudentFromClass, subscribeToTeachers, addTeacher, removeTeacher, subscribeToUserPins, setUserPin, clearUserPin, setUsernameLocked, renameUser, removeUserEntirely, getTermOverrides, saveTermOverride, deleteTermOverride, UserPinEntry, FirestoreUserProgress, FirestoreClass } from "@/firebase/firestoreService";
import { CHAPTERS, ALL_TERMS, MedicalTerm, applyTermOverrides } from "@/data/medicalData";

const TERM_SYSTEMS = ["General","Cardiovascular","Digestive","Respiratory","Nervous","Musculoskeletal","Urinary","Endocrine","Integumentary","Blood","Reproductive","Lymphatic"];
const TERM_TYPES: MedicalTerm["type"][] = ["prefix","suffix","root","condition","procedure","word"];

type EditForm = { term: string; type: MedicalTerm["type"]; meaning: string; casualMeaning: string; system: string; example: string; definition: string; homonymWarning: string; };

const IS_HOST = (u: string) => u.toLowerCase() === "anatomixowner";

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
  const [tab, setTab] = useState<"roster" | "classes" | "games" | "teachers" | "terms">("roster");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [newClassName, setNewClassName] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [newTeacher, setNewTeacher] = useState("");
  const [pins, setPins] = useState<Record<string, UserPinEntry>>({});
  const [manageModal, setManageModal] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [pinInputModal, setPinInputModal] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [renameSaving, setRenameSaving] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const toKey = (u: string) => u.toLowerCase().replace(/\s+/g, "_");

  const [termSearch, setTermSearch] = useState("");
  const [editingTerm, setEditingTerm] = useState<MedicalTerm | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [termOverrideIds, setTermOverrideIds] = useState<Set<string>>(new Set());
  const [termSaving, setTermSaving] = useState(false);

  useEffect(() => {
    if (!db) return;
    getTermOverrides(db).then(o => setTermOverrideIds(new Set(Object.keys(o))));
  }, [db]);

  useEffect(() => {
    if (!IS_HOST(user?.username ?? "")) navigate("/");
  }, [user]);

  useEffect(() => {
    if (!db) return;
    const u1 = subscribeToUsers(db, s => setStudents(s.filter(s => !IS_HOST(s.username))));
    const u2 = subscribeToClasses(db, setClasses);
    const u3 = subscribeToTeachers(db, setTeachers);
    const u4 = subscribeToUserPins(db, setPins);
    return () => { u1(); u2(); u3(); u4(); };
  }, [db]);

  const filteredStudents = filterClass === "all" ? students : students.filter(s => {
    const cls = classes.find(c => c.id === filterClass);
    return cls?.memberUsernames.includes(s.username);
  });

  const createClass = async () => {
    if (!db || !newClassName.trim()) return;
    const cls: FirestoreClass = { id: Date.now().toString(), name: newClassName.trim(), memberUsernames: [], createdAt: Date.now(), ownerUsername: "anatomixowner" };
    await saveClass(db, cls);
    setNewClassName("");
  };

  const grantTeacher = async () => {
    if (!db || !newTeacher.trim()) return;
    await addTeacher(db, newTeacher.trim());
    setNewTeacher("");
  };

  const revokeTeacher = async (username: string) => {
    if (!db) return;
    await removeTeacher(db, username);
  };

  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)", justifyContent: "space-between" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };
  const tabBtn = (key: typeof tab) => ({ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer" as const, fontFamily: "inherit", fontWeight: "700" as const, fontSize: "0.9rem", backgroundColor: tab === key ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7" });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.1rem" }}>AnatomiX Moderator</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>AnatomiXOwner</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/multiplayer")} style={backBtn}>Host a Game</button>
          <button onClick={() => navigate("/")} style={backBtn}>Student View</button>
        </div>
      </div>

      {!ready && <div style={{ backgroundColor: "rgba(200,150,50,0.12)", padding: "10px 24px", color: "rgba(252,250,247,0.6)", fontSize: "0.82rem" }}>Connecting to server...</div>}

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
          <button onClick={() => setTab("roster")} style={tabBtn("roster")}>Roster ({students.length})</button>
          <button onClick={() => setTab("classes")} style={tabBtn("classes")}>Classes ({classes.length})</button>
          <button onClick={() => setTab("games")} style={tabBtn("games")}>Game Rooms</button>
          <button onClick={() => setTab("teachers")} style={tabBtn("teachers")}>Teachers ({teachers.length})</button>
          <button onClick={() => setTab("terms")} style={tabBtn("terms")}>Term Editor ({ALL_TERMS.length})</button>
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
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {pins[toKey(s.username)]?.pin && <span style={{ backgroundColor: "rgba(74,96,128,0.4)", color: "#7aabcc", fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>PIN</span>}
                          {pins[toKey(s.username)]?.locked && <span style={{ backgroundColor: "rgba(160,100,40,0.4)", color: "#d4a843", fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>LOCKED</span>}
                          <button onClick={e => { e.stopPropagation(); setAssignModal(s.username); }} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(252,250,247,0.6)", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Assign Class</button>
                          <button onClick={e => { e.stopPropagation(); setManageModal(s.username); setRenameInput(s.username); setPinInputModal(""); setRemoveConfirm(false); }} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(252,250,247,0.6)", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Manage</button>
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

        {tab === "terms" && (() => {
          const q = termSearch.trim().toLowerCase();
          const filtered = q
            ? ALL_TERMS.filter(t => t.term.toLowerCase().includes(q) || t.meaning.toLowerCase().includes(q) || t.system.toLowerCase().includes(q) || t.type.toLowerCase().includes(q))
            : ALL_TERMS;
          const openEdit = (t: MedicalTerm) => {
            setEditingTerm(t);
            setEditForm({ term: t.term, type: t.type, meaning: t.meaning, casualMeaning: t.casualMeaning, system: t.system, example: t.example, definition: t.definition, homonymWarning: t.homonymWarning ?? "" });
          };
          return (
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "18px", alignItems: "center" }}>
                <input value={termSearch} onChange={e => setTermSearch(e.target.value)} placeholder="Search by term, meaning, type, or system..." style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "0.9rem" }} />
                <span style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{filtered.length} terms</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "60vh", overflowY: "auto" }}>
                {filtered.map(t => (
                  <div key={t.id} onClick={() => openEdit(t)} style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${termOverrideIds.has(t.id) ? "rgba(100,160,100,0.35)" : "rgba(252,250,247,0.06)"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#fcfaf7", fontFamily: "monospace", fontWeight: "700", minWidth: "120px" }}>{t.term}</span>
                    <span style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem", backgroundColor: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>{t.type}</span>
                    <span style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem", flex: 1 }}>{t.meaning}</span>
                    <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.75rem" }}>{t.system}</span>
                    {termOverrideIds.has(t.id) && <span style={{ color: "#7aaa7a", fontSize: "0.7rem", fontWeight: "700" }}>EDITED</span>}
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {tab === "games" && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "24px" }}>Create and manage live game rooms for your class.</p>
            <button onClick={() => navigate("/multiplayer")} style={{ padding: "14px 32px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Create a Game Room</button>
          </div>
        )}

        {tab === "teachers" && (
          <>
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "18px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
              <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "4px" }}>Grant Teacher Access</div>
              <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem", marginBottom: "12px" }}>Teachers can manage their own classes, view student progress, and host games. They cannot manage other teachers or view all students.</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={newTeacher} onChange={e => setNewTeacher(e.target.value)} onKeyDown={e => e.key === "Enter" && grantTeacher()} placeholder="Enter username exactly as they log in..." style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit" }} />
                <button onClick={grantTeacher} style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Grant Access</button>
              </div>
            </div>
            {teachers.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(252,250,247,0.3)", padding: "60px" }}>No teachers yet. Grant access above to add them.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {teachers.map(t => (
                  <div key={t} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(252,250,247,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{t}</span>
                      <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.78rem" }}>Teacher</span>
                      {pins[toKey(t)]?.pin && <span style={{ backgroundColor: "rgba(74,96,128,0.4)", color: "#7aabcc", fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>PIN</span>}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setManageModal(t); setRenameInput(t); setPinInputModal(""); setRemoveConfirm(false); }} style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(252,250,247,0.6)", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Manage</button>
                      <button onClick={() => revokeTeacher(t)} style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(160,70,70,0.3)", color: "#e09090", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {manageModal && (() => {
        const u = manageModal;
        const pinEntry = pins[toKey(u)];
        const isTeacher = teachers.includes(toKey(u));
        return (
          <div onClick={() => setManageModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#2e3240", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "400px", border: "1px solid rgba(252,250,247,0.1)", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: "#fcfaf7", fontWeight: "700", margin: 0 }}>Manage User</h3>
                {isTeacher && <span style={{ backgroundColor: "rgba(74,96,128,0.4)", color: "#7aabcc", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>Teacher</span>}
              </div>

              <div>
                <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "8px" }}>Rename</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input value={renameInput} onChange={e => setRenameInput(e.target.value)} style={{ flex: 1, padding: "9px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "0.9rem" }} />
                  <button disabled={renameSaving || !renameInput.trim() || renameInput.trim() === u} onClick={async () => { if (!db) return; setRenameSaving(true); await renameUser(db, u, renameInput.trim(), classes); setRenameSaving(false); setManageModal(null); }} style={{ padding: "9px 14px", borderRadius: "7px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.82rem", opacity: (renameSaving || !renameInput.trim() || renameInput.trim() === u) ? 0.4 : 1 }}>
                    {renameSaving ? "..." : "Rename"}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "8px" }}>
                  PIN {pinEntry?.pin ? <span style={{ color: "#7aabcc", textTransform: "none" as const, fontWeight: "400" }}>- currently set</span> : <span style={{ color: "rgba(252,250,247,0.3)", textTransform: "none" as const, fontWeight: "400" }}>- not set</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: pinEntry?.pin ? "8px" : "0" }}>
                  <input value={pinInputModal} onChange={e => setPinInputModal(e.target.value)} placeholder={pinEntry?.pin ? "New PIN..." : "Set PIN..."} style={{ flex: 1, padding: "9px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "0.9rem" }} />
                  <button disabled={pinSaving || !pinInputModal.trim()} onClick={async () => { if (!db) return; setPinSaving(true); await setUserPin(db, u, pinInputModal.trim(), pinEntry?.locked ?? false); setPinSaving(false); setPinInputModal(""); }} style={{ padding: "9px 14px", borderRadius: "7px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.82rem", opacity: (pinSaving || !pinInputModal.trim()) ? 0.4 : 1 }}>
                    {pinSaving ? "..." : "Set PIN"}
                  </button>
                </div>
                {pinEntry?.pin && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={async () => { if (!db) return; await setUsernameLocked(db, u, !pinEntry.locked); }} style={{ padding: "7px 12px", borderRadius: "7px", backgroundColor: pinEntry.locked ? "rgba(160,100,40,0.3)" : "rgba(255,255,255,0.06)", color: pinEntry.locked ? "#d4a843" : "rgba(252,250,247,0.55)", border: "1px solid rgba(252,250,247,0.08)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>
                      {pinEntry.locked ? "Unlock" : "Lock Username"}
                    </button>
                    <button onClick={async () => { if (!db) return; await clearUserPin(db, u); }} style={{ padding: "7px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.5)", border: "1px solid rgba(252,250,247,0.08)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>
                      Clear PIN
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid rgba(252,250,247,0.06)", paddingTop: "14px" }}>
                <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "8px" }}>Danger Zone</div>
                {!removeConfirm ? (
                  <button onClick={() => setRemoveConfirm(true)} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(160,60,60,0.25)", color: "#e09090", border: "1px solid rgba(160,60,60,0.3)", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.85rem" }}>
                    Remove User Entirely
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={async () => { if (!db) return; await removeUserEntirely(db, u, classes); setManageModal(null); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "rgba(180,50,50,0.5)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.85rem" }}>
                      Confirm Delete
                    </button>
                    <button onClick={() => setRemoveConfirm(false)} style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => setManageModal(null)} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Close</button>
            </div>
          </div>
        );
      })()}

      {editingTerm && editForm && (() => {
        const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "0.9rem", boxSizing: "border-box" as const };
        const lbl: React.CSSProperties = { color: "rgba(252,250,247,0.45)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "5px", display: "block" };
        const field = (key: keyof EditForm, label: string, multiline?: boolean) => (
          <div>
            <span style={lbl}>{label}</span>
            {multiline
              ? <textarea rows={3} value={editForm[key]} onChange={e => setEditForm(f => f && ({ ...f, [key]: e.target.value }))} style={{ ...inp, resize: "vertical" as const }} />
              : <input value={editForm[key]} onChange={e => setEditForm(f => f && ({ ...f, [key]: e.target.value }))} style={inp} />
            }
          </div>
        );
        const saveTerm = async () => {
          if (!db || !editForm) return;
          setTermSaving(true);
          const fields: Record<string, unknown> = { ...editForm };
          if (!editForm.homonymWarning) delete fields.homonymWarning;
          await saveTermOverride(db, editingTerm.id, fields);
          applyTermOverrides({ [editingTerm.id]: editForm as never });
          setTermOverrideIds(s => new Set([...s, editingTerm.id]));
          setTermSaving(false);
          setEditingTerm(null);
          setEditForm(null);
        };
        const resetTerm = async () => {
          if (!db) return;
          await deleteTermOverride(db, editingTerm.id);
          setTermOverrideIds(s => { const n = new Set(s); n.delete(editingTerm.id); return n; });
          setEditingTerm(null);
          setEditForm(null);
        };
        return (
          <div onClick={() => { setEditingTerm(null); setEditForm(null); }} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#2e3240", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "520px", border: "1px solid rgba(252,250,247,0.1)", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: "#fcfaf7", fontWeight: "700", margin: 0 }}>Edit Term</h3>
                <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.75rem", fontFamily: "monospace" }}>id: {editingTerm.id}</span>
              </div>

              {field("term", "Term")}

              <div>
                <span style={lbl}>Type</span>
                <select value={editForm.type} onChange={e => setEditForm(f => f && ({ ...f, type: e.target.value as MedicalTerm["type"] }))} style={{ ...inp }}>
                  {TERM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <span style={lbl}>System</span>
                <select value={editForm.system} onChange={e => setEditForm(f => f && ({ ...f, system: e.target.value }))} style={{ ...inp }}>
                  {TERM_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {field("meaning", "Meaning (short)")}
              {field("casualMeaning", "Casual Meaning")}
              {field("example", "Example")}
              {field("definition", "Full Definition", true)}
              {field("homonymWarning", "Homonym Warning (optional)")}

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={saveTerm} disabled={termSaving} style={{ flex: 1, padding: "11px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", opacity: termSaving ? 0.5 : 1 }}>
                  {termSaving ? "Saving..." : "Save Changes"}
                </button>
                {termOverrideIds.has(editingTerm.id) && (
                  <button onClick={resetTerm} style={{ padding: "11px 14px", borderRadius: "8px", backgroundColor: "rgba(160,100,40,0.3)", color: "#d4a843", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem" }}>
                    Reset to Original
                  </button>
                )}
                <button onClick={() => { setEditingTerm(null); setEditForm(null); }} style={{ padding: "11px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
