import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, CHAPTERS, getTermsByChapter, STUDY_CHAPTER_KEY } from "@/data/medicalData";

const CHAPTER_TONES = [
  "#374a5e","#3a4d62","#364860","#3d5168","#394c64",
  "#364960","#3b4e65","#384b62","#3c4f68","#374b60",
  "#3a4d64","#364960","#3b4f66",
];

type Tab = "study" | "critical" | "decks";

export default function FlashcardsHub() {
  const [, navigate] = useLocation();
  const { user, recordCorrect, recordMiss, addDeck, removeDeck } = useUser();
  const [tab, setTab] = useState<Tab>("study");
  const [chapterFilter, setChapterFilter] = useState<number>(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const cleared = useMemo(() => new Set(user?.clearedTermIds ?? []), [user?.clearedTermIds]);

  useEffect(() => {
    const stored = localStorage.getItem(STUDY_CHAPTER_KEY);
    if (stored) setChapterFilter(parseInt(stored, 10));
  }, []);

  const changeChapter = (val: number) => {
    setChapterFilter(val);
    setCardIndex(0);
    setFlipped(false);
    if (val > 0) localStorage.setItem(STUDY_CHAPTER_KEY, String(val));
    else localStorage.removeItem(STUDY_CHAPTER_KEY);
  };

  const studyTerms = useMemo(() => {
    if (chapterFilter === 0) return ALL_TERMS;
    return getTermsByChapter(chapterFilter);
  }, [chapterFilter]);

  const dueTerms = useMemo(() => {
    const now = Date.now();
    return Object.values(user?.criticalReview ?? {}).filter(e => e.nextReview <= now);
  }, [user?.criticalReview]);

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
  const currentCard = currentTerms[cardIndex];

  const handleNext = () => { setCardIndex(i => (i + 1) % currentTerms.length); setFlipped(false); };
  const handlePrev = () => { setCardIndex(i => (i - 1 + currentTerms.length) % currentTerms.length); setFlipped(false); };

  const handleCorrect = () => { if (currentCard) recordCorrect(currentCard.id); handleNext(); };
  const handleMiss    = () => { if (currentCard) recordMiss(currentCard.id, currentCard.term); handleNext(); };

  const exportDeck = () => {
    const text = currentTerms.map(t => `${t.term}: ${t.meaning}\n${t.definition}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    alert("Copied to clipboard!");
  };

  const tabBtn = (key: Tab, label: string, badge?: number) => (
    <button
      onClick={() => { setTab(key); setCardIndex(0); setFlipped(false); }}
      style={{ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.9rem", backgroundColor: tab === key ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7", transition: "all 0.15s" }}
    >
      {label}{badge !== undefined && badge > 0 ? ` (${badge})` : ""}
    </button>
  );

  const critEntry = currentCard ? (user?.criticalReview[currentCard.id]) : null;
  const activeChapter = CHAPTERS.find(c => c.num === chapterFilter);

  const chapterProficiency = (ch: typeof CHAPTERS[0]) => {
    const count = ch.termIds.filter(id => cleared.has(id)).length;
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
                          <span style={{ color: isProficient ? "#7aaa7a" : "rgba(252,250,247,0.3)", fontSize: "0.65rem", fontWeight: "700", whiteSpace: "nowrap" as const }}>
                            {Math.round(prof * 100)}%
                          </span>
                        </div>
                      </button>
                      {isProficient && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/chapter-summary/${ch.num}`); }}
                          style={{ position: "absolute", top: "6px", right: "6px", backgroundColor: "rgba(60,130,80,0.3)", border: "1px solid rgba(80,160,100,0.3)", borderRadius: "4px", color: "#7aaa7a", fontSize: "0.6rem", fontWeight: "700", padding: "2px 5px", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Summary
                        </button>
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

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <button onClick={exportDeck} style={{ padding: "8px 14px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(252,250,247,0.7)", border: "1px solid rgba(252,250,247,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>Export Deck</button>
            </div>

            {currentCard && <FlashCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onCorrect={handleCorrect} onMiss={handleMiss} index={cardIndex} total={currentTerms.length} critEntry={critEntry} />}
          </>
        )}

        {tab === "critical" && (
          <>
            <div style={{ backgroundColor: "rgba(160,70,70,0.2)", border: "1px solid rgba(200,90,90,0.25)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
              <div style={{ color: "#e09090", fontWeight: "700", marginBottom: "4px" }}>Critical Review</div>
              <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem" }}>
                Terms added automatically when missed. Spaced repetition schedules reviews at increasing intervals. Answer correctly to advance toward removal.
              </div>
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
                <div style={{ marginBottom: "12px", color: "rgba(252,250,247,0.45)", fontSize: "0.85rem" }}>
                  {allCritTerms.length} term{allCritTerms.length !== 1 ? "s" : ""} tracked
                  {dueTerms.length > 0 && ` - reviewing ${cardIndex + 1} of ${currentTerms.length}`}
                </div>
                {currentCard && <FlashCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onCorrect={handleCorrect} onMiss={handleMiss} index={cardIndex} total={currentTerms.length} critEntry={critEntry} />}
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
                <button onClick={() => { if (newDeckName.trim()) { addDeck(newDeckName.trim(), []); setNewDeckName(""); } }}
                  style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
                  Create
                </button>
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

function FlashCard({ card, flipped, onFlip, onNext, onPrev, onCorrect, onMiss, index, total, critEntry }: {
  card: typeof ALL_TERMS[0]; flipped: boolean; onFlip: () => void;
  onNext: () => void; onPrev: () => void; onCorrect: () => void; onMiss: () => void;
  index: number; total: number; critEntry?: any;
}) {
  const TYPE_COLORS: Record<string, string> = {
    prefix: "#5a4a3e", suffix: "#394d62", root: "#3d5a47",
    condition: "#4a3d62", procedure: "#424242", word: "#2e4e58",
  };
  const color = TYPE_COLORS[card.type] ?? "#394d62";
  const nextReviewDays = critEntry
    ? Math.max(0, Math.round((critEntry.nextReview - Date.now()) / 86_400_000))
    : null;

  return (
    <div>
      <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.8rem", textAlign: "center", marginBottom: "12px" }}>
        {index + 1} / {total}
        {critEntry && (
          <span style={{ color: "#e09090", marginLeft: "12px" }}>
            {critEntry.correctStreak} correct - next review in {nextReviewDays === 0 ? "less than 1" : nextReviewDays} day{nextReviewDays !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div onClick={onFlip} style={{ backgroundColor: color, borderRadius: "16px", padding: "40px 32px", minHeight: "220px", cursor: "pointer", textAlign: "center", marginBottom: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", userSelect: "none", transition: "transform 0.15s", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        {!flipped ? (
          <>
            <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{card.type} - {card.system}</div>
            <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{card.term}</div>
            <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.85rem", marginTop: "16px" }}>Tap to reveal definition</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{card.term}</div>
            <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "10px" }}>{card.meaning}</div>
            <div style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "400px" }}>{card.definition}</div>
            {card.casualMeaning && (
              <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.8rem", marginTop: "10px", fontStyle: "italic" }}>{card.casualMeaning}</div>
            )}
          </>
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
