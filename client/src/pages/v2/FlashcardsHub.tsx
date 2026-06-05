import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, SYSTEMS } from "@/data/medicalData";

type Tab = "study" | "critical" | "decks";

export default function FlashcardsHub() {
  const [, navigate] = useLocation();
  const { user, recordCorrect, recordMiss, addDeck, removeDeck } = useUser();
  const [tab, setTab] = useState<Tab>("study");
  const [systemFilter, setSystemFilter] = useState("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const studyTerms = useMemo(() => {
    if (systemFilter === "all") return ALL_TERMS;
    return ALL_TERMS.filter(t => t.system.toLowerCase() === systemFilter || t.system === "General");
  }, [systemFilter]);

  const critTerms = useMemo(() => {
    return Object.values(user?.criticalReview ?? {}).map(e => {
      const term = ALL_TERMS.find(t => t.id === e.termId);
      return { ...e, termData: term };
    });
  }, [user?.criticalReview]);

  const currentTerms = tab === "critical" ? critTerms.map(c => c.termData).filter(Boolean) as typeof ALL_TERMS : studyTerms;
  const currentCard = currentTerms[cardIndex];

  const handleNext = () => { setCardIndex(i => (i + 1) % currentTerms.length); setFlipped(false); };
  const handlePrev = () => { setCardIndex(i => (i - 1 + currentTerms.length) % currentTerms.length); setFlipped(false); };

  const handleCorrect = () => {
    if (currentCard) recordCorrect(currentCard.id);
    handleNext();
  };

  const handleMiss = () => {
    if (currentCard) recordMiss(currentCard.id, currentCard.term);
    handleNext();
  };

  const exportDeck = () => {
    const text = currentTerms.map(t => `${t.term}: ${t.meaning}\n${t.definition}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    alert("Copied to clipboard!");
  };

  const tabBtn = (key: Tab, label: string, count?: number) => (
    <button
      onClick={() => { setTab(key); setCardIndex(0); setFlipped(false); }}
      style={{ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.9rem", backgroundColor: tab === key ? "#fcfaf7" : "rgba(252,250,247,0.12)", color: tab === key ? "#8b4f58" : "#fcfaf7", transition: "all 0.15s" }}
    >
      {label}{count !== undefined && count > 0 ? ` (${count})` : ""}
    </button>
  );

  const critEntry = currentCard ? (user?.criticalReview[currentCard.id]) : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.1)" }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Flashcards & Critical Review</span>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          {tabBtn("study", "📇 Study Deck")}
          {tabBtn("critical", "⚠️ Critical Review", Object.keys(user?.criticalReview ?? {}).length)}
          {tabBtn("decks", "📦 Custom Decks", user?.decks.length)}
        </div>

        {tab === "study" && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
              <select value={systemFilter} onChange={e => { setSystemFilter(e.target.value); setCardIndex(0); setFlipped(false); }}
                style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.1)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", fontFamily: "inherit" }}>
                <option value="all">All Systems ({ALL_TERMS.length} terms)</option>
                {SYSTEMS.map(s => <option key={s.id} value={s.id}>{s.officialName}</option>)}
              </select>
              <button onClick={exportDeck} style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.1)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>📋 Export</button>
            </div>
            {currentCard && <FlashCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onCorrect={handleCorrect} onMiss={handleMiss} index={cardIndex} total={currentTerms.length} critEntry={critEntry} />}
          </>
        )}

        {tab === "critical" && (
          <>
            <div style={{ backgroundColor: "rgba(180,80,80,0.2)", border: "1px solid rgba(220,100,100,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px" }}>
              <div style={{ color: "#f5a0a0", fontWeight: "700", marginBottom: "4px" }}>⚠️ Automatic Critical Review Deck</div>
              <div style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.85rem" }}>
                Terms are added automatically when you miss them in any quiz or game. Answer each term correctly <strong>twice in a row</strong> to remove it from this deck.
              </div>
            </div>
            {critTerms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(252,250,247,0.4)" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "6px" }}>Critical Review deck is empty!</div>
                <div>Play games or take quizzes to automatically add missed terms here.</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "12px", color: "rgba(252,250,247,0.6)", fontSize: "0.85rem" }}>{critTerms.length} term{critTerms.length !== 1 ? "s" : ""} need attention</div>
                {currentCard && <FlashCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onCorrect={handleCorrect} onMiss={handleMiss} index={cardIndex} total={currentTerms.length} critEntry={critEntry} />}
              </>
            )}
          </>
        )}

        {tab === "decks" && (
          <div>
            <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "12px" }}>Create New Custom Deck</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="Deck name..." style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.1)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", fontFamily: "inherit" }} />
                <button onClick={() => { if (newDeckName.trim()) { addDeck(newDeckName.trim(), []); setNewDeckName(""); } }}
                  style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
                  Create
                </button>
              </div>
            </div>
            {user?.decks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(252,250,247,0.4)" }}>No custom decks yet. Create one above!</div>
            ) : user?.decks.map(deck => (
              <div key={deck.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#fcfaf7", fontWeight: "700" }}>{deck.name}</div>
                  <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.82rem" }}>{deck.termIds.length} terms · Created {new Date(deck.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => removeDeck(deck.id)} style={{ backgroundColor: "rgba(200,80,80,0.3)", color: "#f5a0a0", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem" }}>Remove</button>
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
  const typeColors: Record<string, string> = { prefix: "#9c6f5e", suffix: "#4a5a6a", root: "#596e60", condition: "#5c4a6a", procedure: "#4f4f4f", word: "#3b5e66" };
  const color = typeColors[card.type] ?? "#596e60";
  return (
    <div>
      <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", textAlign: "center", marginBottom: "12px" }}>
        {index + 1} / {total}
        {critEntry && <span style={{ color: "#f5a0a0", marginLeft: "12px" }}>⚠️ {critEntry.correctStreak}/2 correct streak</span>}
      </div>
      <div onClick={onFlip} style={{ backgroundColor: color, borderRadius: "16px", padding: "40px 32px", minHeight: "220px", cursor: "pointer", textAlign: "center", marginBottom: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", userSelect: "none", transition: "transform 0.15s", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {!flipped ? (
          <>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.6)", marginBottom: "12px" }}>{card.type} · {card.system}</div>
            <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{card.term}</div>
            <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem", marginTop: "16px" }}>Tap to reveal definition →</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.6)", marginBottom: "12px" }}>{card.term}</div>
            <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "10px" }}>{card.meaning}</div>
            <div style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "400px" }}>{card.definition}</div>
            <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginTop: "10px" }}>💬 {card.casualMeaning}</div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={onPrev} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.1)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit" }}>◀ Prev</button>
        {flipped && (
          <>
            <button onClick={onMiss} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(200,80,80,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>✗ Missed</button>
            <button onClick={onCorrect} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(80,160,80,0.4)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>✓ Got It</button>
          </>
        )}
        <button onClick={onNext} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.1)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Next ▶</button>
      </div>
    </div>
  );
}
