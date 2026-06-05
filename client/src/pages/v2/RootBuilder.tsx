import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ALL_TERMS, SYSTEMS } from "@/data/medicalData";

const PREFIXES = ALL_TERMS.filter(t => t.type === "prefix");
const ROOTS = ALL_TERMS.filter(t => t.type === "root");
const SUFFIXES = ALL_TERMS.filter(t => t.type === "suffix");

const VALID_COMBOS: Record<string, string> = {
  "cardi/o-logy": "Cardiology  -  the study of the heart",
  "cardi/o-itis": "Carditis  -  inflammation of the heart",
  "cardi/o-megaly": "Cardiomegaly  -  abnormal enlargement of the heart",
  "cardi/o-pathy": "Cardiomyopathy  -  disease of the heart muscle",
  "gastr/o-itis": "Gastritis  -  inflammation of the stomach lining",
  "gastr/o-scopy": "Gastroscopy  -  visual examination of the stomach",
  "gastr/o-ectomy": "Gastrectomy  -  surgical removal of all or part of the stomach",
  "gastr/o-algia": "Gastralgia  -  pain in the stomach",
  "hepat/o-itis": "Hepatitis  -  inflammation of the liver",
  "hepat/o-megaly": "Hepatomegaly  -  abnormal enlargement of the liver",
  "hepat/o-ectomy": "Hepatectomy  -  surgical removal of part of the liver",
  "nephr/o-itis": "Nephritis  -  inflammation of the kidneys",
  "nephr/o-logy": "Nephrology  -  the study of kidney diseases",
  "nephr/o-ectomy": "Nephrectomy  -  surgical removal of a kidney",
  "neur/o-logy": "Neurology  -  the study of the nervous system",
  "neur/o-itis": "Neuritis  -  inflammation of a nerve",
  "neur/o-pathy": "Neuropathy  -  disease of the nerves",
  "oste/o-itis": "Osteitis  -  inflammation of bone",
  "oste/o-logy": "Osteology  -  the study of bones",
  "arthr/o-itis": "Arthritis  -  inflammation of the joints",
  "arthr/o-scopy": "Arthroscopy  -  visual examination of the interior of a joint",
  "arthr/o-plasty": "Arthroplasty  -  surgical repair or replacement of a joint",
  "bronch/o-itis": "Bronchitis  -  inflammation of the bronchial tubes",
  "bronch/o-scopy": "Bronchoscopy  -  visual examination of the bronchi",
  "pulmon/o-logy": "Pulmonology  -  the study and treatment of lung diseases",
  "thromb/o-osis": "Thrombosis  -  formation of a blood clot inside a vessel",
  "thromb/o-lysis": "Thrombolysis  -  dissolution (breaking down) of a blood clot",
  "hem/o-stasis": "Hemostasis  -  stopping the flow of blood",
  "hem/o-lysis": "Hemolysis  -  destruction of red blood cells",
  "leuk/o-emia": "Leukemia  -  malignant disease with excessive white blood cells",
  "leuk/o-penia": "Leukopenia  -  deficiency of white blood cells",
  "erythr/o-cyte": "Erythrocyte  -  a red blood cell",
  "erythr/o-penia": "Erythropenia  -  deficiency of red blood cells",
  "col/o-scopy": "Colonoscopy  -  visual examination of the colon",
  "col/o-ectomy": "Colectomy  -  surgical removal of part or all of the colon",
  "col/o-itis": "Colitis  -  inflammation of the colon",
  "cyst/o-itis": "Cystitis  -  inflammation of the urinary bladder",
  "cyst/o-scopy": "Cystoscopy  -  visual examination of the bladder",
  "cyst/o-ectomy": "Cystectomy  -  surgical removal of the bladder",
  "derm/o-itis": "Dermatitis  -  inflammation of the skin",
  "derm/o-logy": "Dermatology  -  the study of skin diseases",
  "thyr/o-itis": "Thyroiditis  -  inflammation of the thyroid gland",
  "thyr/o-ectomy": "Thyroidectomy  -  surgical removal of the thyroid gland",
  "splen/o-megaly": "Splenomegaly  -  abnormal enlargement of the spleen",
  "splen/o-ectomy": "Splenectomy  -  surgical removal of the spleen",
  "mening/o-itis": "Meningitis  -  inflammation of the meninges (brain membranes)",
  "encephal/o-itis": "Encephalitis  -  inflammation of the brain",
  "hyster/o-ectomy": "Hysterectomy  -  surgical removal of the uterus",
  "mamm/o-graphy": "Mammography  -  X-ray imaging of breast tissue",
  "pancreat/o-itis": "Pancreatitis  -  inflammation of the pancreas",
  "prostat/o-itis": "Prostatitis  -  inflammation of the prostate gland",
  "trache/o-stomy": "Tracheostomy  -  surgical creation of an opening in the trachea",
  "trache/o-tomy": "Tracheotomy  -  surgical incision into the trachea",
};

export default function RootBuilder() {
  const [, navigate] = useLocation();
  const [prefix, setPrefix] = useState<string | null>(null);
  const [root, setRoot] = useState<string | null>(null);
  const [suffix, setSuffix] = useState<string | null>(null);
  const [systemFilter, setSystemFilter] = useState<string>("all");

  const filteredRoots = useMemo(() => {
    if (systemFilter === "all") return ROOTS;
    return ROOTS.filter(r => r.system.toLowerCase() === systemFilter.toLowerCase());
  }, [systemFilter]);

  const builtTerm = useMemo(() => {
    if (!root) return null;
    const key = suffix ? `${root}-${suffix.replace(/^-/, "")}` : null;
    if (key && VALID_COMBOS[key]) return VALID_COMBOS[key];
    if (root && suffix) {
      const rootTerm = ALL_TERMS.find(t => t.term === root);
      const suffTerm = ALL_TERMS.find(t => t.term === suffix);
      if (rootTerm && suffTerm) return `Possible term: ${root.replace("/o", "")}${suffix}  -  combining "${rootTerm.meaning}" + "${suffTerm.meaning}"`;
    }
    return null;
  }, [root, suffix]);

  const clear = () => { setPrefix(null); setRoot(null); setSuffix(null); };

  const slotStyle = (filled: boolean, color: string) => ({
    flex: 1, minWidth: "140px", padding: "16px", borderRadius: "12px", border: `2px dashed ${filled ? color : "rgba(252,250,247,0.2)"}`,
    backgroundColor: filled ? `${color}33` : "rgba(252,250,247,0.06)", textAlign: "center" as const,
    color: "#fcfaf7", transition: "all 0.2s",
  });

  const colBtn = (active: boolean, onClick: () => void, label: string, sub?: string) => (
    <button onClick={onClick} style={{ padding: "10px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, backgroundColor: active ? "rgba(252,250,247,0.25)" : "rgba(252,250,247,0.08)", color: "#fcfaf7", width: "100%", transition: "background 0.15s" }}>
      <div style={{ fontWeight: "700", fontSize: "0.88rem", fontFamily: "monospace" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.72rem", opacity: 0.65, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.1)" }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Root Builder Workspace</span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", marginBottom: "6px" }}>🔬 Dynamic Root Builder</h1>
        <p style={{ color: "rgba(252,250,247,0.6)", marginBottom: "24px" }}>Tap a fragment from each column to load it into its slot. A valid term will display below.</p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={slotStyle(!!prefix, "#9c6f5e")}>
            <div style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.6, marginBottom: "6px" }}>Active Prefix</div>
            <div style={{ fontWeight: "700", fontFamily: "monospace", fontSize: "1.1rem" }}>{prefix ?? " - "}</div>
            {prefix && <button onClick={() => setPrefix(null)} style={{ marginTop: "6px", fontSize: "0.7rem", color: "rgba(252,250,247,0.5)", background: "none", border: "none", cursor: "pointer" }}>✕ clear</button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "rgba(252,250,247,0.4)", fontSize: "1.5rem" }}>+</div>
          <div style={slotStyle(!!root, "#596e60")}>
            <div style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.6, marginBottom: "6px" }}>Active Root / Combining Form</div>
            <div style={{ fontWeight: "700", fontFamily: "monospace", fontSize: "1.1rem" }}>{root ?? " - "}</div>
            {root && <button onClick={() => setRoot(null)} style={{ marginTop: "6px", fontSize: "0.7rem", color: "rgba(252,250,247,0.5)", background: "none", border: "none", cursor: "pointer" }}>✕ clear</button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "rgba(252,250,247,0.4)", fontSize: "1.5rem" }}>+</div>
          <div style={slotStyle(!!suffix, "#4a5a6a")}>
            <div style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.6, marginBottom: "6px" }}>Active Suffix</div>
            <div style={{ fontWeight: "700", fontFamily: "monospace", fontSize: "1.1rem" }}>{suffix ?? " - "}</div>
            {suffix && <button onClick={() => setSuffix(null)} style={{ marginTop: "6px", fontSize: "0.7rem", color: "rgba(252,250,247,0.5)", background: "none", border: "none", cursor: "pointer" }}>✕ clear</button>}
          </div>
          <button onClick={clear} style={{ padding: "10px 16px", borderRadius: "10px", backgroundColor: "rgba(252,250,247,0.1)", color: "rgba(252,250,247,0.7)", border: "1px solid rgba(252,250,247,0.15)", cursor: "pointer", fontFamily: "inherit", alignSelf: "center" }}>Clear All</button>
        </div>

        {builtTerm ? (
          <div style={{ backgroundColor: "rgba(89,110,96,0.4)", border: "1px solid #596e60", borderRadius: "12px", padding: "18px 20px", marginBottom: "24px" }}>
            <div style={{ color: "#90e090", fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "6px" }}>✓ Valid Textbook Term</div>
            <div style={{ color: "#fcfaf7", fontSize: "1rem" }}>{builtTerm}</div>
          </div>
        ) : (root || suffix) ? (
          <div style={{ backgroundColor: "rgba(0,0,0,0.15)", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "rgba(252,250,247,0.5)", fontSize: "0.9rem" }}>
            Add a root + suffix combination to check for a valid term. Prefix is optional.
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Prefixes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
              {PREFIXES.map(p => colBtn(prefix === p.term, () => setPrefix(prefix === p.term ? null : p.term), p.term, p.meaning))}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Combining Forms / Roots</div>
              <select
                value={systemFilter}
                onChange={e => setSystemFilter(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(252,250,247,0.1)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", fontFamily: "inherit", fontSize: "0.82rem" }}
              >
                <option value="all">All Systems</option>
                {SYSTEMS.map(s => <option key={s.id} value={s.officialName}>{s.officialName}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "370px", overflowY: "auto" }}>
              {filteredRoots.map(r => colBtn(root === r.term, () => setRoot(root === r.term ? null : r.term), r.term, r.meaning))}
            </div>
          </div>

          <div>
            <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Suffixes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
              {SUFFIXES.map(s => colBtn(suffix === s.term, () => setSuffix(suffix === s.term ? null : s.term), s.term, s.meaning))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
