import { useLocation, useParams } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { CHAPTERS, getTermsByChapter } from "@/data/medicalData";

const PROFICIENCY_THRESHOLD = 0.8;

export default function ChapterSummary() {
  const [, navigate] = useLocation();
  const { num } = useParams<{ num: string }>();
  const { user } = useUser();
  const chapterNum = parseInt(num ?? "1", 10);
  const chapter = CHAPTERS.find(c => c.num === chapterNum);
  const terms = getTermsByChapter(chapterNum);
  const cleared = new Set(user?.clearedTermIds ?? []);
  const clearedCount = chapter?.termIds.filter(id => cleared.has(id)).length ?? 0;
  const total = chapter?.termIds.length ?? 0;
  const pct = total > 0 ? clearedCount / total : 0;
  const isProficient = pct >= PROFICIENCY_THRESHOLD;

  const headerStyle = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  if (!chapter) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={headerStyle}>
          <button onClick={() => navigate("/flashcards")} style={backBtn}>← Back</button>
        </div>
        <div style={{ textAlign: "center", padding: "80px 24px", color: "rgba(252,250,247,0.4)" }}>Chapter not found.</div>
      </div>
    );
  }

  if (!isProficient) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={headerStyle}>
          <button onClick={() => navigate("/flashcards")} style={backBtn}>← Flashcards</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{chapter.title} Summary</span>
        </div>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ color: "rgba(252,250,247,0.2)", fontSize: "48px", marginBottom: "20px" }}>[ ]</div>
          <h2 style={{ color: "#fcfaf7", fontWeight: "800", marginBottom: "8px" }}>Summary Locked</h2>
          <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "32px" }}>
            Clear at least {Math.ceil(total * PROFICIENCY_THRESHOLD)} of {total} terms in this chapter to unlock the summary sheet.
          </p>
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(252,250,247,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>Progress</span>
              <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{clearedCount} / {total}</span>
            </div>
            <div style={{ backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
              <div style={{ backgroundColor: "#4a6080", height: "100%", width: `${Math.round(pct * 100)}%`, borderRadius: "6px", transition: "width 0.3s" }} />
            </div>
            <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.78rem", marginTop: "8px" }}>{Math.round(pct * 100)}% complete - need 80% to unlock</div>
          </div>
          <button onClick={() => navigate("/flashcards")} style={{ marginTop: "24px", padding: "12px 28px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
            Continue Studying
          </button>
        </div>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    prefix: "#5a4a3e", suffix: "#394d62", root: "#3d5a47",
    condition: "#4a3d62", procedure: "#424242", word: "#2e4e58",
  };

  const byType = ["prefix", "root", "suffix", "condition", "procedure"];
  const grouped: Record<string, typeof terms> = {};
  byType.forEach(t => {
    const g = terms.filter(x => x.type === t);
    if (g.length) grouped[t] = g;
  });

  const printSheet = () => {
    const lines = terms.map(t => `${t.term.padEnd(28)} [${t.type}]  ${t.meaning}`).join("\n");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap;padding:24px;">${chapter.title}: ${chapter.subtitle}\n${"=".repeat(60)}\n\n${lines}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...headerStyle, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/flashcards")} style={backBtn}>← Flashcards</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{chapter.title} Summary</span>
        </div>
        <button onClick={printSheet} style={{ ...backBtn, cursor: "pointer" }}>Print / Export</button>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", marginBottom: "4px" }}>{chapter.title}</h1>
          <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.9rem", marginBottom: "8px" }}>{chapter.subtitle}</div>
          <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.78rem" }}>{terms.length} terms - proficiency unlocked</div>
        </div>

        {Object.entries(grouped).map(([type, group]) => (
          <div key={type} style={{ marginBottom: "32px" }}>
            <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              {type === "root" ? "Combining Forms" : type === "condition" ? "Conditions" : type === "procedure" ? "Procedures" : type.charAt(0).toUpperCase() + type.slice(1) + "es"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {group.map(t => {
                const isClear = cleared.has(t.id);
                return (
                  <div key={t.id} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px 18px", border: `1px solid ${isClear ? "rgba(120,180,120,0.2)" : "rgba(252,250,247,0.05)"}`, display: "flex", gap: "16px" }}>
                    <div style={{ minWidth: "8px", marginTop: "4px" }}>
                      {isClear && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#7aaa7a" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" as const }}>
                        <span style={{ color: "#fcfaf7", fontWeight: "700", fontFamily: "monospace", fontSize: "0.95rem" }}>{t.term}</span>
                        <span style={{ backgroundColor: typeColors[t.type] ?? "#394d62", color: "#fcfaf7", fontSize: "0.65rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" as const }}>{t.type}</span>
                      </div>
                      <div style={{ color: "rgba(252,250,247,0.75)", fontSize: "0.85rem", marginBottom: "4px" }}>{t.meaning}</div>
                      <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem", lineHeight: 1.5 }}>{t.definition}</div>
                      {t.wordParts && t.wordParts.length > 0 && (
                        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap" as const, gap: "5px" }}>
                          {t.wordParts.map((wp, i) => (
                            <span key={i} style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "4px", padding: "2px 7px", fontSize: "0.72rem", color: "rgba(252,250,247,0.5)", fontFamily: "monospace" }}>
                              {wp.part} ({wp.meaning})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
