import { useLocation } from "wouter";

const SECTIONS = [
  {
    title: "Getting Around",
    items: [
      { name: "Dashboard", desc: "Your home base. Shows your progress, a daily term spotlight, and quick links to every study tool. Use the nav bar at the top to reach Chat, your Account, or switch users." },
      { name: "Back buttons", desc: "Every page has a back button in the top-left corner that takes you to the dashboard." },
    ],
  },
  {
    title: "Study Tools",
    items: [
      { name: "Dictionary", desc: "Search any medical term, prefix, root, or suffix. Filter by chapter, type, or body system. Click a term to see its full definition, example, and related words." },
      { name: "Root Builder", desc: "Pick a prefix, root, and suffix to build a medical word. The app shows you what the combination means and whether it forms a real term." },
      { name: "Flashcards", desc: "Flip through cards chapter by chapter. Answer correctly twice in a row to clear a term. Terms you miss get added to Critical Review. Once you clear 80% of a chapter, a summary sheet unlocks." },
      { name: "Practice Test", desc: "A timed 20-question test. Pick any chapter or mix all of them. Your score is saved to your profile." },
      { name: "Daily Challenge", desc: "One short challenge per day. Resets every 24 hours. Good for keeping a streak going." },
      { name: "Boss Round", desc: "The hardest mode. Pulls from all 13 chapters at once. No hints, no partial credit." },
      { name: "Spelling Bee", desc: "You are shown a definition and must type the correct medical term exactly. Spelling counts." },
      { name: "Body Explorer", desc: "Click on any body system to explore its structures. Click into a structure to see its parts, definitions, and combining forms." },
    ],
  },
  {
    title: "Games",
    items: [
      { name: "Multiple Choice", desc: "Pick the correct meaning from four options. Fast-paced." },
      { name: "Typing Quiz", desc: "Type the answer instead of picking it. Tests recall, not just recognition." },
      { name: "Linguistic Autopsy", desc: "Break down a medical word by identifying its prefix, root, and suffix." },
      { name: "Chart Triage", desc: "Read a short clinical note and identify the correct medical term being described." },
      { name: "Textbook Trap", desc: "One answer sounds right but is wrong. Find the trap." },
      { name: "Root Race", desc: "Match roots to their meanings as fast as you can." },
      { name: "Root Swap", desc: "Swap out parts of a word to change its meaning and match the new definition." },
      { name: "Structural Hole", desc: "A word has a blank where one component is missing. Fill it in." },
      { name: "Textbook Defender", desc: "Flag the incorrect term in a passage before the timer runs out." },
      { name: "Combining Form Linker", desc: "Connect combining forms to the correct body system." },
      { name: "Chart Auditor", desc: "Find the misspelled or incorrect term hidden in a clinical chart." },
      { name: "Ischemic Countdown", desc: "High-pressure timed rounds. Correct answers buy you more time." },
      { name: "Memory Match", desc: "Flip cards to find matching term and definition pairs." },
    ],
  },
  {
    title: "Multiplayer",
    items: [
      { name: "Create a Room", desc: "Go to Multiplayer and create a room. Share the room code with your classmates. Everyone joins and plays the same questions at the same time." },
      { name: "Join a Room", desc: "Enter the room code your teacher or classmate shared. You will be dropped straight into the game when it starts." },
    ],
  },
  {
    title: "Chat",
    items: [
      { name: "Channels", desc: "Class channels appear in the left sidebar under each class you belong to. Click a channel to read and send messages." },
      { name: "Direct Messages", desc: "Click the + next to Direct Messages in the sidebar to start a private conversation with anyone." },
    ],
  },
  {
    title: "Progress and Critical Review",
    items: [
      { name: "Clearing a term", desc: "Answer a flashcard correctly twice in a row and it is cleared. Cleared terms count toward chapter progress." },
      { name: "Critical Review", desc: "Any term you miss gets flagged. A red banner appears on the dashboard when you have terms in Critical Review. Go to Flashcards to work through them. Answer correctly once to remove the flag." },
      { name: "Chapter proficiency", desc: "Clear 80% of a chapter's study terms to mark it proficient. A summary sheet unlocks in Flashcards once you hit that threshold." },
      { name: "Streak", desc: "Study at least one term per day to keep your streak going. It appears in the top-right corner of the dashboard." },
    ],
  },
];

export default function Guide() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", color: "rgba(252,250,247,0.45)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit", padding: 0 }}
        >
          Back
        </button>
        <span style={{ color: "#fcfaf7", fontWeight: 800, fontSize: "1.05rem" }}>How to Use AnatomiX</span>
      </header>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 60px" }}>
        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: "40px" }}>
            <h2 style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
              {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {section.items.map(item => (
                <div
                  key={item.name}
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(252,250,247,0.07)", borderRadius: "12px", padding: "16px 20px" }}
                >
                  <div style={{ color: "#fcfaf7", fontWeight: 700, fontSize: "0.92rem", marginBottom: "5px" }}>{item.name}</div>
                  <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
