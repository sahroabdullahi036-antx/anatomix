import { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import Avatar, { AvatarConfig, DEFAULT_AVATAR, loadAvatar, saveAvatar } from "@/components/Avatar";

interface Props { onClose: () => void; }

const BG = "#1e2028";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(252,250,247,0.08)";
const TEXT = "#fcfaf7";
const MUTED = "rgba(252,250,247,0.45)";
const ACCENT = "#4a6080";

const PASTEL_SKINS = ["#f5e6d3","#e8c49a","#d4a574","#b8845a","#8b5e3c","#5c3a1e","#f0d5b8","#c8956c","#fde9d0","#dab896"];
const PASTEL_HAIRS = ["#3d2b1f","#6b4423","#8b6914","#c4a35a","#d4c5b0","#2c2c2c","#1a1a2e","#8b0000","#4a0080","#006080","#c084fc","#f0a8b8","#e0e0e0"];
const PASTEL_CLOTHES = ["#4a6080","#5a7a5a","#7a5a5a","#5a5a7a","#7a6a4a","#4a7a7a","#3d4a5c","#6a4a6a","#4a5c3d","#5c4a3d"];
const PASTEL_SHOES = ["#2d3748","#4a3728","#3d4a2d","#2d3d4a","#4a4a2d","#5a3a3a","#1a1a2a","#3a2a4a"];

type ClosetTab = "hair" | "face" | "clothes" | "colors" | "accessories";

const HAIR_STYLES = [
  { id: "bob", label: "Bob" },
  { id: "curls", label: "Curls" },
  { id: "buns", label: "Space Buns" },
  { id: "ponytail", label: "Ponytail" },
  { id: "afro", label: "Afro" },
  { id: "twists", label: "Twists" },
  { id: "fade", label: "Fade" },
  { id: "buzz", label: "Buzz Cut" },
  { id: "dreads", label: "Locs" },
  { id: "braids", label: "Box Braids" },
  { id: "cornrows", label: "Cornrows" },
  { id: "waves", label: "Waves" },
  { id: "hijab", label: "Hijab" },
];

const EXPRESSIONS = [
  { id: "happy", label: "Happy" },
  { id: "focused", label: "Focused" },
  { id: "reading", label: "Reading" },
  { id: "wink", label: "Wink" },
];

const EYEBROWS = [
  { id: "normal", label: "Normal" },
  { id: "raised", label: "Raised" },
  { id: "flat", label: "Flat" },
];

const FEATURES = [
  { id: "none", label: "None" },
  { id: "freckles", label: "Freckles" },
  { id: "mole", label: "Mole" },
  { id: "dimples", label: "Dimples" },
  { id: "bridge", label: "Nose Bridge" },
];

const TOPS = [
  { id: "vneck", label: "V-Neck" },
  { id: "jacket", label: "Jacket" },
  { id: "vest", label: "Utility Vest" },
  { id: "tunic", label: "Tunic" },
  { id: "cardigan", label: "Cardigan" },
  { id: "dustcoat", label: "Dust Coat" },
];

const SHOES_OPTS = [
  { id: "sneakers", label: "Cloud Sneakers" },
  { id: "clogs", label: "Clogs" },
];

const ACCESSORIES = [
  { id: "none", label: "None" },
  { id: "headset", label: "Headset" },
  { id: "cap", label: "Cap" },
  { id: "glasses", label: "Glasses" },
  { id: "badge", label: "ID Badge" },
];

function ChipGrid({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            padding: "7px 14px", borderRadius: "8px", border: `1px solid ${value === o.id ? ACCENT : BORDER}`,
            backgroundColor: value === o.id ? `${ACCENT}33` : "transparent",
            color: value === o.id ? TEXT : MUTED,
            cursor: "pointer", fontFamily: "inherit", fontWeight: value === o.id ? "700" : "500", fontSize: "0.82rem",
            transition: "all 0.12s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorSwatch({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
      {colors.map(c => (
        <div
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: "28px", height: "28px", borderRadius: "50%", backgroundColor: c, cursor: "pointer",
            border: value === c ? "3px solid #fcfaf7" : "2px solid rgba(255,255,255,0.15)",
            boxSizing: "border-box", transition: "transform 0.1s, border 0.1s",
            transform: value === c ? "scale(1.18)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

function HexInput({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: "pointer", padding: "0", backgroundColor: "transparent" }} />
      <input
        type="text"
        value={value}
        maxLength={7}
        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
        style={{ width: "90px", padding: "6px 10px", borderRadius: "6px", fontSize: "0.82rem", backgroundColor: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`, color: TEXT, outline: "none", fontFamily: "monospace" }}
      />
      <span style={{ color: MUTED, fontSize: "0.78rem" }}>{label}</span>
    </div>
  );
}

export default function AvatarCloset({ onClose }: Props) {
  const { user } = useUser();
  const [config, setConfig] = useState<AvatarConfig>(() => loadAvatar(user?.username ?? ""));
  const [activeTab, setActiveTab] = useState<ClosetTab>("hair");
  const [saved, setSaved] = useState(false);

  const set = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    if (user?.username) saveAvatar(user.username, config);
    setSaved(true);
    setTimeout(onClose, 600);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_AVATAR });
    setSaved(false);
  };

  const TABS: { id: ClosetTab; label: string }[] = [
    { id: "hair", label: "Hair" },
    { id: "face", label: "Face" },
    { id: "clothes", label: "Clothes" },
    { id: "colors", label: "Colors" },
    { id: "accessories", label: "Accessories" },
  ];

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px" }}
    >
      <div style={{ backgroundColor: BG, borderRadius: "20px", width: "100%", maxWidth: "780px", maxHeight: "92vh", display: "flex", flexDirection: "column", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ color: TEXT, fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>My Profile Look</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontFamily: "inherit", fontSize: "1.3rem", lineHeight: 1, padding: "2px 8px" }}>x</button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Avatar preview */}
          <div style={{ width: "200px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", borderRight: `1px solid ${BORDER}`, backgroundColor: "rgba(0,0,0,0.2)" }}>
            <Avatar config={config} size={150} />
            <div style={{ color: MUTED, fontSize: "0.78rem", marginTop: "12px", textAlign: "center" }}>{user?.username}</div>
          </div>

          {/* Customizer */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${BORDER}`, padding: "0 16px" }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontWeight: activeTab === t.id ? "700" : "500", fontSize: "0.85rem",
                    color: activeTab === t.id ? TEXT : MUTED,
                    borderBottom: activeTab === t.id ? `2px solid ${ACCENT}` : "2px solid transparent",
                    transition: "all 0.12s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
              {activeTab === "hair" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Hair Style</div>
                    <ChipGrid options={HAIR_STYLES} value={config.hairStyle} onChange={v => set("hairStyle", v)} />
                  </div>
                </div>
              )}

              {activeTab === "face" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Expression</div>
                    <ChipGrid options={EXPRESSIONS} value={config.expression} onChange={v => set("expression", v)} />
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Eyebrows</div>
                    <ChipGrid options={EYEBROWS} value={config.eyebrowStyle} onChange={v => set("eyebrowStyle", v)} />
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Face Marks</div>
                    <ChipGrid options={FEATURES} value={config.feature} onChange={v => set("feature", v)} />
                  </div>
                </div>
              )}

              {activeTab === "clothes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Top</div>
                    <ChipGrid options={TOPS} value={config.top} onChange={v => set("top", v)} />
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Shoes</div>
                    <ChipGrid options={SHOES_OPTS} value={config.shoes} onChange={v => set("shoes", v)} />
                  </div>
                </div>
              )}

              {activeTab === "colors" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Skin Tone</div>
                    <ColorSwatch colors={PASTEL_SKINS} value={config.skinColor} onChange={c => set("skinColor", c)} />
                    <HexInput label="Custom" value={config.skinColor} onChange={c => set("skinColor", c)} />
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Hair Color</div>
                    <ColorSwatch colors={PASTEL_HAIRS} value={config.hairColor} onChange={c => set("hairColor", c)} />
                    <HexInput label="Custom" value={config.hairColor} onChange={c => set("hairColor", c)} />
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Clothing Color</div>
                    <ColorSwatch colors={PASTEL_CLOTHES} value={config.clothingColor} onChange={c => set("clothingColor", c)} />
                    <HexInput label="Custom" value={config.clothingColor} onChange={c => set("clothingColor", c)} />
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Shoe Color</div>
                    <ColorSwatch colors={PASTEL_SHOES} value={config.shoeColor} onChange={c => set("shoeColor", c)} />
                    <HexInput label="Custom" value={config.shoeColor} onChange={c => set("shoeColor", c)} />
                  </div>
                </div>
              )}

              {activeTab === "accessories" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Accessory</div>
                    <ChipGrid options={ACCESSORIES} value={config.accessory} onChange={v => set("accessory", v)} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: "10px", padding: "16px 20px", borderTop: `1px solid ${BORDER}` }}>
              <button onClick={handleReset} style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", color: MUTED, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontSize: "0.85rem" }}>Reset</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "10px 18px", borderRadius: "8px", backgroundColor: saved ? "rgba(60,130,80,0.4)" : ACCENT, color: TEXT, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.9rem", transition: "background 0.2s" }}>
                {saved ? "Saved!" : "Save Look"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
