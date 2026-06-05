import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import {
  subscribeToClasses, getAllUsers,
  subscribeToAllChannels, createChannel, deleteChannel,
  subscribeToChannelMessages, sendChannelMessage,
  subscribeToDmThreadsForUser, subscribeToAllDmThreads,
  subscribeToDmMessages, sendDmMessage, getOrCreateDmThread,
} from "@/firebase/firestoreService";
import type { ChatChannel, ChatMessage, DmThread, FirestoreUserProgress, FirestoreClass } from "@/firebase/firestoreService";

const IS_HOST = (u: string) => u.toLowerCase() === "anatomixowner";
const toKey = (u: string) => u.toLowerCase().replace(/\s+/g, "_");

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(ts: number) {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return "Today";
  const y = new Date(t); y.setDate(t.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatHub() {
  const { user } = useUser();
  const { db } = useFirebase();
  const [, navigate] = useLocation();

  const [classes, setClasses] = useState<FirestoreClass[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [dmThreads, setDmThreads] = useState<DmThread[]>([]);
  const [allUsers, setAllUsers] = useState<FirestoreUserProgress[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeView, setActiveView] = useState<{ type: "channel" | "dm"; id: string } | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newCh, setNewCh] = useState("");
  const [showDmModal, setShowDmModal] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const myUsername = user?.username ?? "";
  const myKey = toKey(myUsername);
  const isHost = IS_HOST(myUsername);

  useEffect(() => {
    if (!db) return;
    const u1 = subscribeToClasses(db, setClasses);
    const u2 = subscribeToAllChannels(db, setChannels);
    const u3 = isHost
      ? subscribeToAllDmThreads(db, setDmThreads)
      : subscribeToDmThreadsForUser(db, myKey, setDmThreads);
    getAllUsers(db).then(setAllUsers);
    return () => { u1(); u2(); u3(); };
  }, [db, isHost, myKey]);

  useEffect(() => {
    if (!db || !activeView) { setMessages([]); return; }
    const unsub = activeView.type === "channel"
      ? subscribeToChannelMessages(db, activeView.id, setMessages)
      : subscribeToDmMessages(db, activeView.id, setMessages);
    return unsub;
  }, [db, activeView?.type, activeView?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const myClasses = isHost ? classes : classes.filter(c =>
    c.memberUsernames.some(m => toKey(m) === myKey) ||
    (c.ownerUsername && toKey(c.ownerUsername) === myKey)
  );
  const myClassIds = new Set(myClasses.map(c => c.id));
  const visibleChs = isHost ? channels : channels.filter(ch => myClassIds.has(ch.classId));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeView || !db || sending) return;
    setSending(true); setInput("");
    if (activeView.type === "channel") await sendChannelMessage(db, activeView.id, myUsername, text);
    else await sendDmMessage(db, activeView.id, myUsername, text);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleAddCh = async (classId: string) => {
    if (!db || !newCh.trim()) return;
    const slug = newCh.trim().toLowerCase().replace(/\s+/g, "-");
    const ch = await createChannel(db, classId, slug, myUsername);
    setNewCh(""); setAddingFor(null);
    setActiveView({ type: "channel", id: ch.id });
  };

  const handleDelCh = async (ch: ChatChannel) => {
    if (!db || !window.confirm(`Delete #${ch.name}? This cannot be undone.`)) return;
    if (activeView?.id === ch.id) setActiveView(null);
    await deleteChannel(db, ch.id);
  };

  const handleStartDm = async (target: FirestoreUserProgress) => {
    if (!db) return;
    const tid = await getOrCreateDmThread(db, myKey, toKey(target.username), myUsername, target.username);
    setActiveView({ type: "dm", id: tid });
    setShowDmModal(false); setDmSearch("");
  };

  const getDmLabel = (t: DmThread) => {
    if (isHost) return (t.participantDisplay ?? t.participants).join(" ↔ ");
    return (t.participantDisplay ?? t.participants).find(p => toKey(p) !== myKey) ?? "Unknown";
  };

  const hdr = (() => {
    if (!activeView) return null;
    if (activeView.type === "channel") {
      const ch = channels.find(c => c.id === activeView.id);
      const cls = classes.find(c => c.id === ch?.classId);
      return { name: `# ${ch?.name ?? "channel"}`, sub: cls?.name };
    }
    const t = dmThreads.find(t => t.id === activeView.id);
    return { name: t ? getDmLabel(t) : "DM", sub: "Direct Message" };
  })();

  const dmCandidates = allUsers.filter(u =>
    toKey(u.username) !== myKey &&
    (!dmSearch || u.username.toLowerCase().includes(dmSearch.toLowerCase()))
  );

  const toggle = (id: string) => setCollapsed(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const row = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", padding: "5px 8px 5px 18px",
    margin: "1px 6px", borderRadius: "6px", cursor: "pointer", gap: "4px",
    backgroundColor: active ? "rgba(74,96,128,0.45)" : "transparent",
    color: active ? "#fcfaf7" : "rgba(252,250,247,0.55)", fontSize: "0.875rem",
  });
  const iconBtn: React.CSSProperties = {
    background: "none", border: "none", color: "rgba(252,250,247,0.3)",
    cursor: "pointer", fontSize: "1rem", padding: "0 3px", fontFamily: "inherit",
  };
  const secHdr: React.CSSProperties = {
    padding: "14px 10px 4px", color: "rgba(252,250,247,0.28)",
    fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" as const,
    letterSpacing: "0.1em", display: "flex", alignItems: "center", justifyContent: "space-between",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", overflow: "hidden" }}>

      <div style={{ backgroundColor: "rgba(0,0,0,0.35)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid rgba(252,250,247,0.07)", flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(252,250,247,0.45)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit", padding: 0 }}>← Back</button>
        <span style={{ color: "#fcfaf7", fontWeight: 800, fontSize: "1rem" }}>Chat</span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: "252px", flexShrink: 0, backgroundColor: "#1e2128", borderRight: "1px solid rgba(252,250,247,0.06)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={secHdr}><span>Channels</span></div>

          {myClasses.length === 0 && (
            <div style={{ color: "rgba(252,250,247,0.2)", fontSize: "0.78rem", padding: "6px 14px" }}>
              {isHost ? "No classes yet." : "Not assigned to any classes yet."}
            </div>
          )}

          {myClasses.map(cls => {
            const chs = visibleChs.filter(c => c.classId === cls.id);
            const isCollapsed = collapsed.has(cls.id);
            return (
              <div key={cls.id}>
                <div onClick={() => toggle(cls.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px 3px 10px", cursor: "pointer", userSelect: "none" }}>
                  <span style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.8rem", fontWeight: 700 }}>
                    {isCollapsed ? "▸" : "▾"} {cls.name}
                  </span>
                  {isHost && <button onClick={e => { e.stopPropagation(); setAddingFor(cls.id); setNewCh(""); }} style={{ ...iconBtn, marginRight: "4px" }} title="Add channel">+</button>}
                </div>
                {!isCollapsed && (
                  <>
                    {chs.map(ch => (
                      <div key={ch.id} style={row(activeView?.id === ch.id)} onClick={() => setActiveView({ type: "channel", id: ch.id })}>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}># {ch.name}</span>
                        {isHost && <button onClick={e => { e.stopPropagation(); handleDelCh(ch); }} style={{ ...iconBtn, color: "rgba(200,80,80,0.5)", fontSize: "0.75rem" }} title="Delete">✕</button>}
                      </div>
                    ))}
                    {isHost && addingFor === cls.id && (
                      <form onSubmit={e => { e.preventDefault(); handleAddCh(cls.id); }} style={{ padding: "3px 10px" }}>
                        <input type="text" value={newCh} onChange={e => setNewCh(e.target.value)} placeholder="channel-name" autoFocus
                          style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(252,250,247,0.2)", color: "#fcfaf7", fontSize: "0.82rem", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                          onKeyDown={e => { if (e.key === "Escape") setAddingFor(null); }}
                          onBlur={() => { if (!newCh.trim()) setAddingFor(null); }}
                        />
                      </form>
                    )}
                    {chs.length === 0 && addingFor !== cls.id && (
                      <div style={{ color: "rgba(252,250,247,0.18)", fontSize: "0.73rem", padding: "2px 18px" }}>
                        {isHost ? "Click + to add a channel" : "No channels yet"}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <div style={{ ...secHdr, marginTop: "8px" }}>
            <span>Direct Messages</span>
            <button onClick={() => setShowDmModal(true)} style={{ ...iconBtn, marginRight: "6px" }} title="New DM">+</button>
          </div>
          {dmThreads.map(t => (
            <div key={t.id} style={row(activeView?.id === t.id)} onClick={() => setActiveView({ type: "dm", id: t.id })}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getDmLabel(t)}</span>
            </div>
          ))}
          {dmThreads.length === 0 && <div style={{ color: "rgba(252,250,247,0.18)", fontSize: "0.73rem", padding: "2px 14px" }}>No conversations yet</div>}
          <div style={{ flex: 1 }} />
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!activeView ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "2.5rem" }}>💬</div>
              <div style={{ color: "rgba(252,250,247,0.25)", fontSize: "0.95rem" }}>Select a channel or DM to start chatting</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 22px", borderBottom: "1px solid rgba(252,250,247,0.06)", flexShrink: 0 }}>
                <div style={{ color: "#fcfaf7", fontWeight: 700, fontSize: "0.95rem" }}>{hdr?.name}</div>
                {hdr?.sub && hdr.sub !== hdr.name && <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.72rem" }}>{hdr.sub}</div>}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px", display: "flex", flexDirection: "column" }}>
                {messages.length === 0 && <div style={{ color: "rgba(252,250,247,0.2)", fontSize: "0.85rem", textAlign: "center", marginTop: "50px" }}>No messages yet. Say hello!</div>}
                {messages.map((msg, i) => {
                  const prev = i > 0 ? messages[i - 1] : null;
                  const grouped = prev?.author === msg.author && msg.createdAt - (prev?.createdAt ?? 0) < 300_000;
                  const showDiv = i === 0 || fmtDate(msg.createdAt) !== fmtDate(messages[i - 1].createdAt);
                  const isMine = msg.author === myUsername;
                  return (
                    <div key={msg.id}>
                      {showDiv && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0 8px" }}>
                          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(252,250,247,0.07)" }} />
                          <span style={{ color: "rgba(252,250,247,0.22)", fontSize: "0.7rem", fontWeight: 600 }}>{fmtDate(msg.createdAt)}</span>
                          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(252,250,247,0.07)" }} />
                        </div>
                      )}
                      <div style={{ marginTop: (grouped && !showDiv) ? "2px" : "10px" }}>
                        {(!grouped || showDiv) && (
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "1px" }}>
                            <span style={{ color: isMine ? "#7a9fc8" : "rgba(252,250,247,0.75)", fontWeight: 700, fontSize: "0.84rem" }}>{msg.author}</span>
                            <span style={{ color: "rgba(252,250,247,0.2)", fontSize: "0.7rem" }}>{fmt(msg.createdAt)}</span>
                          </div>
                        )}
                        <div style={{ color: "rgba(252,250,247,0.88)", fontSize: "0.9rem", lineHeight: 1.55, wordBreak: "break-word" }}>{msg.text}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} style={{ padding: "10px 20px 14px", borderTop: "1px solid rgba(252,250,247,0.06)", flexShrink: 0, display: "flex", gap: "10px" }}>
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder={`Message ${hdr?.name ?? ""}`} disabled={sending}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", fontSize: "0.9rem", fontFamily: "inherit", outline: "none" }} />
                <button type="submit" disabled={!input.trim() || sending}
                  style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: input.trim() ? "#4a6080" : "rgba(255,255,255,0.06)", color: input.trim() ? "#fcfaf7" : "rgba(252,250,247,0.2)", border: "none", cursor: input.trim() ? "pointer" : "default", fontFamily: "inherit", fontWeight: 700, fontSize: "0.88rem" }}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* New DM modal */}
      {showDmModal && (
        <div onClick={e => { if (e.target === e.currentTarget) { setShowDmModal(false); setDmSearch(""); } }}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
          <div style={{ backgroundColor: "#2e3240", borderRadius: "14px", padding: "24px", width: "100%", maxWidth: "360px", border: "1px solid rgba(252,250,247,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ color: "#fcfaf7", fontWeight: 700, fontSize: "0.95rem" }}>New Direct Message</span>
              <button onClick={() => { setShowDmModal(false); setDmSearch(""); }} style={{ background: "none", border: "none", color: "rgba(252,250,247,0.4)", cursor: "pointer", fontSize: "1.3rem", fontFamily: "inherit" }}>×</button>
            </div>
            <input type="text" value={dmSearch} onChange={e => setDmSearch(e.target.value)} placeholder="Search by name..." autoFocus
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(252,250,247,0.12)", color: "#fcfaf7", fontSize: "0.88rem", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "12px", outline: "none" }} />
            <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
              {dmCandidates.length === 0 && <div style={{ color: "rgba(252,250,247,0.25)", textAlign: "center", padding: "20px", fontSize: "0.85rem" }}>No users found</div>}
              {dmCandidates.map(u => (
                <button key={u.username} onClick={() => handleStartDm(u)}
                  style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(252,250,247,0.07)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem", textAlign: "left" }}>
                  {u.username}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
