import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser, SRSEntry } from "@/contexts/UserContext";
import { ALL_TERMS, CHAPTERS, getTermsByChapter, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { SpeakButton } from "@/components/SpeakButton";
import { termToSpeakText } from "@/lib/speakUtils";

const CHAPTER_TONES = [
  "#374a5e","#3a4d62","#364860","#3d5168","#394c64",
  "#364960","#3b4e65","#384b62","#3c4f68","#374b60",
  "#3a4d64","#364960","#3b4f66",
];

type Tab = "study" | "srs" | "critical" | "decks";

export default function FlashcardsHub() {
  const [, navigate] = useLocation();
  const { user, recordCorrect, recordMiss, addDeck, removeDeck, updateSRS } = useUser();
  const [tab, setTab] = useState<Tab>("study");
  const [chapterFilter, setChapterFilter] = useState<number>(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [reversed, setReversed] = useState(false);
  const [hideMastered, setHideMastered] = useState(false);
  const [srsIdx, setSrsIdx] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);

  const cleared = useMemo(() => new Set(user?.clearedTermIds ?? []), [user?.clearedTermIds]);

  useEffect(() => {
    const stored = localStorage.getItem(STUDY_CHAPTER_KEY);
    if (stored) setChapterFilter(parseInt(stored, 10));
  }, []);

  const changeChapter = (val: number) => {
    setChapterFilter(val); setCardIndex(0); setFlipped(false);
    if (val > 0) localStorage.setItem(STUDY_CHAPTER_KEY, String(val));
    else localStorage.removeItem(STUDY_CHAPTER_KEY);
  };

  const baseStudyTerms = useMemo(() => {
    if (chapterFilter === 0) return ALL_TERMS;
    return getTermsByChapter(chapterFilter);
  }, [chapterFilter]);

  const studyTerms = useMemo(() => {
    if (!hideMastered) return baseStudyTerms;
    return baseStudyTerms.filter(t => !cleared.has(t.id));
  }, [baseStudyTerms, hideMastered, cleared]);

  const dueTerms = useMemo(() => {
    const now = Date.now();
    return Object.values(user?.criticalReview ?? {}).filter(e => e.nextReview <= now);
  }, [user?.criticalReview]);

  const srsDueTerms = useMemo((): Array<{ entry: SRSEntry; term: typeof ALL_TERMS[0] }> => {
    const now = Date.now();
    const deck = user?.srsDeck ?? {};
    return Object.values(deck)
      .filter(e => e.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview)
      .map(e => ({ entry: e, term: ALL_TERMS.find(t => t.id === e.termId)! }))
      .filter(x => x.term != null);
  }, [user?.srsDeck]);

  const srsAllCount = Object.keys(user?.srsDeck ?? {}).length;

  const allCritTerms = useMemo(() => {
    return Object.values(user?.criticalReview ?? {}).map(e => {
      const term = ALL_TERMS.find(t => t.id === e.termId);
      return { ...e, termData: term };
    });
  }, [user?.criticalReview]);

  const critTerms = useMemo(() => {
    const dueIds = new Set(dueTerms.map(e => e.termId));
    const due = allCritTerms.filter(c => dueIds.has(c.termId));
    const notDue = allCritTerms.filter(c => !dueIds.has(c.termId));
    return [...due, ...notDue];
  }, [allCritTerms, dueTerms]);

  const currentTerms = tab === "critical"
    ? (critTerms.map(c => c.termData).filter(Boolean) as typeof ALL_TERMS)
    : studyTerms;
  const effectiveIndex = currentTerms.length > 0 ? Math.min(cardIndex, currentTerms.length - 1) : 0;
  const currentCard = currentTerms[effectiveIndex];

  const handleNext = () => { setCardIndex(i => (i + 1) % Math.max(1, currentTerms.length)); setFlipped(false); };
  const handlePrev = () => { setCardIndex(i => (i - 1 + Math.max(1, currentTerms.length)) % Math.max(1, currentTerms.length)); setFlipped(false); };
  const handleCorrect = () => { if (currentCard) { recordCorrect(currentCard.id); updateSRS(currentCard.id, "easy"); } handleNext(); };
  const handleMiss    = () => { if (currentCard) { recordMiss(currentCard.id, currentCard.term); updateSRS(currentCard.id, "wrong"); } handleNext(); };

  const handleSRS = (quality: "wrong" | "hard" | "easy") => {
    const item = srsDueTerms[srsIdx];
    if (!item) return;
    updateSRS(item.entry.termId, quality);
    setSrsFlipped(false);
    setSrsIdx(i => (i + 1 >= srsDueTerms.length ? 0 : i + 1));
  };

  const exportDeck = () => {
    const text = currentTerms.map(t => `${t.term}: ${t.meaning}\n${t.definition}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    alert("Copied to clipboard!");
  };

  const tabBtn = (key: Tab, label: string, badge?: number) => (
    <button
      onClick={() => { setTab(key); setCardIndex(0); setFlipped(false); setSrsIdx(0); setSrsFlipped(false); }}
      style={{ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.9rem", backgroundColor: tab === key ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7", transition: "all 0.15s" }}
    >
      {label}{badge !== undefined && badge > 0 ? ` (${badge})` : ""}
    </button>
  );

  const toggleBtn = (active: boolean, label: string, onClick: () => void) => (
    <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: "7px", border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontSize: "0.78rem", backgroundColor: active ? "rgba(74,96,128,0.6)" : "rgba(255,255,255,0.05)", color: active ? "#fcfaf7" : "rgba(252,250,247,0.5)", transition: "all 0.15s" }}>
      {label}
    </button>
  );

  const critEntry = currentCard ? (user?.criticalReview[currentCard.id]) : null;
  const activeChapter = CHAPTERS.find(c => c.num === chapterFilter);

  const chapterProficiency = (ch: typeof CHAPTERS[0]) => {
    const count = ch.termIds.filter((id: string) => cleared.has(id)).length;
    return ch.termIds.length > 0 ? count / ch.termIds.length : 0;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Flashcards</span>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          {tabBtn("study", "Study Deck")}
          {tabBtn("srs", "Spaced Review", srsDueTerms.length || undefined)}
          {tabBtn("critical", "Critical Review", allCritTerms.length)}
          {tabBtn("decks", "Custom Decks", user?.decks.length)}
        </div>

        {tab === "study" && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Study by Chapter</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "8px", marginBottom: "12px" }}>
                <button
                  onClick={() => changeChapter(0)}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: chapterFilter === 0 ? "2px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: chapterFilter === 0 ? "#4a6080" : "rgba(255,255,255,0.04)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "all 0.15s" }}
                >
                  <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>All Chapters</div>
                  <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.72rem", marginTop: "2px" }}>{ALL_TERMS.length} terms</div>
                </button>
                {CHAPTERS.map((ch, i) => {
                  const isActive = chapterFilter === ch.num;
                  const tone = CHAPTER_TONES[i % CHAPTER_TONES.length];
                  const prof = chapterProficiency(ch);
                  const isProficient = prof >= 0.8;
                  return (
                    <div key={ch.num} style={{ position: "relative" }}>
                      <button
                        onClick={() => changeChapter(ch.num)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: isActive ? "2px solid rgba(255,255,255,0.3)" : isProficient ? "1px solid rgba(80,160,100,0.3)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: isActive ? tone : "rgba(255,255,255,0.04)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "all 0.15s" }}
                      >
                        <div style={{ fontWeight: "700", fontSize: "0.82rem" }}>{ch.title}</div>
                        <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.7rem", marginTop: "2px", lineHeight: 1.3 }}>{ch.subtitle}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                          <div style={{ flex: 1, height: "3px", borderRadius: "2px", backgroundColor: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.round(prof * 100)}%`, backgroundColor: isProficient ? "#7aaa7a" : "#4a6080", borderRadius: "2px" }} />
                          </div>
                          <span style={{ color: isProficient ? "#7aaa7a" : "rgba(252,250,247,0.3)", fontSize: "0.65rem", fontWeight: "700", whiteSpace: "nowrap" as const }}>{Math.round(prof * 100)}%</span>
                        </div>
                      </button>
                      {isProficient && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/chapter-summary/${ch.num}`); }}
                          style={{ position: "absolute", top: "6px", right: "6px", backgroundColor: "rgba(60,130,80,0.3)", border: "1px solid rgba(80,160,100,0.3)", borderRadius: "4px", color: "#7aaa7a", fontSize: "0.6rem", fontWeight: "700", padding: "2px 5px", cursor: "pointer", fontFamily: "inherit" }}
                        >Summary</button>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeChapter && (
                <div style={{ backgroundColor: CHAPTER_TONES[(activeChapter.num - 1) % CHAPTER_TONES.length], borderRadius: "10px", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "0.9rem" }}>{activeChapter.title}: </span>
                    <span style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.85rem" }}>{activeChapter.subtitle}</span>
                  </div>
                  <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem" }}>{studyTerms.length} terms</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {toggleBtn(reversed, "Reverse Mode", () => { setReversed(r => !r); setFlipped(false); })}
                {toggleBtn(hideMastered, "Hide Mastered", () => { setHideMastered(m => !m); setCardIndex(0); setFlipped(false); })}
              </div>
              <button onClick={exportDeck} style={{ padding: "6px 12px", borderRadius: "7px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.6)", border: "1px solid rgba(252,250,247,0.08)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem" }}>Export Deck</button>
            </div>

            {currentTerms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(252,250,247,0.3)" }}>
                <div style={{ fontWeight: "700", marginBottom: "8px" }}>No terms to show</div>
                <div style={{ fontSize: "0.85rem" }}>All terms in this chapter are mastered. Toggle "Hide Mastered" off to review them.</div>
              </div>
            ) : (
              currentCard && <FlashCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onCorrect={handleCorrect} onMiss={handleMiss} index={effectiveIndex} total={currentTerms.length} critEntry={critEntry} reversed={reversed} />
            )}
          </>
        )}

        {tab === "srs" && (
          <>
            <div style={{ backgroundColor: "rgba(60,90,120,0.2)", border: "1px solid rgba(80,110,150,0.25)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
              <div style={{ color: "#7aabcc", fontWeight: "700", marginBottom: "4px" }}>Spaced Review</div>
              <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem" }}>Terms are reviewed at expanding intervals. They appear here after you study flashcards and rate them Correct or Missed.</div>
              {srsAllCount > 0 && (
                <div style={{ marginTop: "10px", color: "rgba(252,250,247,0.7)", fontSize: "0.82rem" }}>
                  <span style={{ color: "#7aabcc", fontWeight: "700" }}>{srsDueTerms.length} due now</span>
                  {srsAllCount > srsDueTerms.length && ` - ${srsAllCount - srsDueTerms.length} scheduled for later`}
                </div>
              )}
            </div>
            {srsDueTerms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(252,250,247,0.3)" }}>
                <div style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "6px" }}>
                  {srsAllCount === 0 ? "No terms tracked yet" : "All caught up"}
                </div>
                <div style={{ fontSize: "0.85rem" }}>
                  {srsAllCount === 0 ? "Study flashcards and rate them -- they will appear here for spaced review." : `${srsAllCount} term${srsAllCount !== 1 ? "s" : ""} scheduled for future sessions.`}
                </div>
              </div>
            ) : (() => {
              const item = srsDueTerms[srsIdx] ?? srsDueTerms[0];
              if (!item) return null;
              const t = item.term;
              const TYPE_COLORS: Record<string, string> = { prefix: "#5a4a3e", suffix: "#394d62", root: "#3d5a47", condition: "#4a3d62", procedure: "#424242", word: "#2e4e58" };
              return (
                <div>
                  <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.8rem", textAlign: "center", marginBottom: "12px" }}>
                    {srsIdx + 1} / {srsDueTerms.length}
                    <span style={{ color: "#7aabcc", marginLeft: "12px" }}>interval: {item.entry.interval}d</span>
                  </div>
                  <div onClick={() => setSrsFlipped(f => !f)} style={{ backgroundColor: TYPE_COLORS[t.type] ?? "#394d62", borderRadius: "16px", padding: "40px 32px", minHeight: "220px", cursor: "pointer", textAlign: "center", marginBottom: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", userSelect: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
                    {!srsFlipped ? (
                      <>
                        <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{t.type} - {t.system}</div>
                        <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{t.term}</div>
                        <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.85rem", marginTop: "16px" }}>Tap to reveal definition</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{t.term}</div>
                        <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "10px" }}>{t.meaning}</div>
                        <div style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "400px" }}>{t.definition}</div>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {srsFlipped ? (
                      <>
                        <button onClick={() => handleSRS("wrong")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(160,70,70,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Wrong</button>
                        <button onClick={() => handleSRS("hard")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(180,140,50,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Hard</button>
                        <button onClick={() => handleSRS("easy")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(60,130,80,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Easy</button>
                      </>
                    ) : (
                      <div style={{ color: "rgba(252,250,247,0.25)", fontSize: "0.82rem", padding: "10px" }}>Flip the card first, then rate your recall</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {tab === "critical" && (
          <>
            <div style={{ backgroundColor: "rgba(160,70,70,0.2)", border: "1px solid rgba(200,90,90,0.25)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
              <div style={{ color: "#e09090", fontWeight: "700", marginBottom: "4px" }}>Critical Review</div>
              <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem" }}>Terms added automatically when missed. Spaced repetition schedules reviews at increasing intervals. Answer correctly to advance toward removal.</div>
              {dueTerms.length > 0 && (
                <div style={{ marginTop: "10px", color: "rgba(252,250,247,0.7)", fontSize: "0.82rem" }}>
                  <span style={{ color: "#e09090", fontWeight: "700" }}>{dueTerms.length} due now</span>
                  {allCritTerms.length > dueTerms.length && ` - ${allCritTerms.length - dueTerms.length} scheduled for later`}
                </div>
              )}
            </div>
            {critTerms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(252,250,247,0.3)" }}>
                <div style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "6px" }}>Critical Review is empty</div>
                <div>Play games or study flashcards to add missed terms here.</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "12px", color: "rgba(252,250,247,0.45)", fontSize: "0.85rem" }}>{allCritTerms.length} term{allCritTerms.length !== 1 ? "s" : ""} tracked{dueTerms.length > 0 && ` - reviewing ${effectiveIndex + 1} of ${currentTerms.length}`}</div>
                {currentCard && <FlashCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onCorrect={handleCorrect} onMiss={handleMiss} index={effectiveIndex} total={currentTerms.length} critEntry={critEntry} reversed={false} />}
              </>
            )}
          </>
        )}

        {tab === "decks" && (
          <div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
              <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "12px" }}>Create New Custom Deck</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="Deck name..." style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit" }} />
                <button onClick={() => { if (newDeckName.trim()) { addDeck(newDeckName.trim(), []); setNewDeckName(""); } }} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Create</button>
              </div>
            </div>
            {user?.decks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(252,250,247,0.3)" }}>No custom decks yet. Create one above.</div>
            ) : user?.decks.map(deck => (
              <div key={deck.id} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(252,250,247,0.06)" }}>
                <div>
                  <div style={{ color: "#fcfaf7", fontWeight: "700" }}>{deck.name}</div>
                  <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{deck.termIds.length} terms - Created {new Date(deck.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => removeDeck(deck.id)} style={{ backgroundColor: "rgba(160,70,70,0.3)", color: "#e09090", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem" }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FlashCard({ card, flipped, onFlip, onNext, onPrev, onCorrect, onMiss, index, total, critEntry, reversed }: {
  card: typeof ALL_TERMS[0]; flipped: boolean; onFlip: () => void;
  onNext: () => void; onPrev: () => void; onCorrect: () => void; onMiss: () => void;
  index: number; total: number; critEntry?: any; reversed: boolean;
}) {
  const TYPE_COLORS: Record<string, string> = {
    prefix: "#5a4a3e", suffix: "#394d62", root: "#3d5a47",
    condition: "#4a3d62", procedure: "#424242", word: "#2e4e58",
  };
  const color = TYPE_COLORS[card.type] ?? "#394d62";
  const nextReviewDays = critEntry ? Math.max(0, Math.round((critEntry.nextReview - Date.now()) / 86_400_000)) : null;

  return (
    <div>
      <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.8rem", textAlign: "center", marginBottom: "12px" }}>
        {index + 1} / {total}
        {critEntry && <span style={{ color: "#e09090", marginLeft: "12px" }}>{critEntry.correctStreak} correct - next review in {nextReviewDays === 0 ? "less than 1" : nextReviewDays} day{nextReviewDays !== 1 ? "s" : ""}</span>}
        {reversed && <span style={{ color: "rgba(74,96,128,0.9)", marginLeft: "12px", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase" }}>Reverse</span>}
      </div>
      <div onClick={onFlip} style={{ backgroundColor: color, borderRadius: "16px", padding: "40px 32px", minHeight: "220px", cursor: "pointer", textAlign: "center", marginBottom: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", userSelect: "none", transition: "transform 0.15s", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        {!reversed ? (
          !flipped ? (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{card.type} - {card.system}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "4px" }}>
                <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{card.term}</div>
                <SpeakButton text={termToSpeakText(card.term, card.meaning)} />
              </div>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.85rem", marginTop: "14px" }}>Tap to reveal definition</div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)" }}>{card.term}</div>
                <SpeakButton text={termToSpeakText(card.term, card.meaning)} size="sm" />
              </div>
              <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "10px" }}>{card.meaning}</div>
              <div style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "400px" }}>{card.definition}</div>
              {card.casualMeaning && <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.8rem", marginTop: "10px", fontStyle: "italic" }}>{card.casualMeaning}</div>}
            </>
          )
        ) : (
          !flipped ? (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{card.type} - {card.system}</div>
              <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>{card.meaning}</div>
              <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "400px" }}>{card.definition}</div>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.85rem", marginTop: "16px" }}>Tap to reveal term</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{card.type} - {card.system}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                <div style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", fontFamily: "monospace" }}>{card.term}</div>
                <SpeakButton text={termToSpeakText(card.term, card.meaning)} />
              </div>
            </>
          )
        )}
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={onPrev} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Prev</button>
        {flipped && (
          <>
            <button onClick={onMiss} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(160,70,70,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Missed</button>
            <button onClick={onCorrect} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(60,130,80,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Got It</button>
          </>
        )}
        <button onClick={onNext} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Next</button>
      </div>
    </div>
  );
}
