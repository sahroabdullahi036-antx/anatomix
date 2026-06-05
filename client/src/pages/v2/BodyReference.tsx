import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ALL_TERMS, SYSTEMS as DATA_SYSTEMS } from "@/data/medicalData";

const SYSTEMS = [
  { id: "cardiovascular",  label: "Cardiovascular",  color: "#c04848", region: { type: "ellipse", cx: 80, cy: 90, rx: 14, ry: 15 }, desc: "Heart, arteries, veins, and blood circulation" },
  { id: "respiratory",     label: "Respiratory",     color: "#4870b0", region: { type: "twoEllipse", cx1: 63, cy1: 90, rx1: 10, ry1: 18, cx2: 97, cy2: 90, rx2: 10, ry2: 18 }, desc: "Airways, lungs, and gas exchange" },
  { id: "digestive",       label: "Digestive",       color: "#a07040", region: { type: "rect", x: 56, y: 115, w: 48, h: 50 }, desc: "Esophagus, stomach, intestines, liver, and accessory organs" },
  { id: "nervous",         label: "Nervous",         color: "#9060c0", region: { type: "head", cx: 80, cy: 28, r: 21 }, desc: "Brain, spinal cord, nerves, and sensory processing" },
  { id: "musculoskeletal", label: "Musculoskeletal", color: "#507050", region: { type: "full" }, desc: "Bones, muscles, tendons, ligaments, and joints" },
  { id: "urinary",         label: "Urinary",         color: "#4080a0", region: { type: "ellipse", cx: 80, cy: 158, rx: 22, ry: 16 }, desc: "Kidneys, ureters, bladder, and urethra" },
  { id: "endocrine",       label: "Endocrine",       color: "#a08030", region: { type: "glands" }, desc: "Hormone-producing glands throughout the body" },
  { id: "integumentary",   label: "Integumentary",   color: "#7a6050", region: { type: "outline" }, desc: "Skin, hair, nails, and associated glands" },
  { id: "lymphatic",       label: "Lymphatic",       color: "#508080", region: { type: "lymph" }, desc: "Lymph nodes, vessels, spleen, thymus, and immune response" },
  { id: "reproductive",    label: "Reproductive",    color: "#804060", region: { type: "ellipse", cx: 80, cy: 178, rx: 18, ry: 12 }, desc: "Gonads, ducts, and accessory reproductive organs" },
  { id: "special-senses",  label: "Special Senses",  color: "#508868", region: { type: "senses" }, desc: "Eyes, ears, nose, tongue, and vestibular system" },
];


function SystemDiagram({ id }: { id: string }) {
  switch (id) {
    case "cardiovascular": return <CardioSVG />;
    case "respiratory":    return <RespiratorySVG />;
    case "digestive":      return <DigestiveSVG />;
    case "nervous":        return <NervousSVG />;
    case "musculoskeletal":return <MusculoskeletalSVG />;
    case "urinary":        return <UrinarySVG />;
    case "endocrine":      return <EndocrineSVG />;
    case "integumentary":  return <IntegumentarySVG />;
    case "lymphatic":      return <LymphaticSVG />;
    case "reproductive":   return <ReproductiveSVG />;
    case "special-senses": return <SpecialSensesSVG />;
    default:               return null;
  }
}

function Label({ x, y, text, anchor = "middle", small = false }: { x: number; y: number; text: string; anchor?: string; small?: boolean }) {
  return <text x={x} y={y} fill="rgba(252,250,247,0.75)" fontSize={small ? 8 : 9.5} fontFamily="monospace" textAnchor={anchor as any}>{text}</text>;
}
function Line({ x1, y1, x2, y2, color = "rgba(252,250,247,0.25)" }: any) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} />;
}

function CardioSVG() {
  return (
    <svg viewBox="0 0 300 210" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="210" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Heart outline */}
      <path d="M150,50 C145,32 118,28 105,45 C90,28 60,32 55,55 C45,85 80,120 150,165 C220,120 255,85 245,55 C240,32 210,28 195,45 C182,28 155,32 150,50Z" fill="rgba(160,50,50,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      {/* Vertical septum */}
      <path d="M150,55 L150,155" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      {/* Horizontal divider (AV valves) */}
      <path d="M80,105 Q150,95 220,105" stroke="rgba(252,250,247,0.2)" strokeWidth={1.2} fill="none" />
      {/* Chamber labels */}
      <text x="103" y="90" fill="rgba(252,250,247,0.9)" fontSize={10} fontFamily="monospace" textAnchor="middle" fontWeight="bold">RA</text>
      <text x="103" y="140" fill="rgba(252,250,247,0.9)" fontSize={10} fontFamily="monospace" textAnchor="middle" fontWeight="bold">RV</text>
      <text x="197" y="90" fill="rgba(252,250,247,0.9)" fontSize={10} fontFamily="monospace" textAnchor="middle" fontWeight="bold">LA</text>
      <text x="197" y="140" fill="rgba(252,250,247,0.9)" fontSize={10} fontFamily="monospace" textAnchor="middle" fontWeight="bold">LV</text>
      {/* Aorta */}
      <path d="M185,70 C195,45 205,30 210,20" stroke="rgba(220,100,100,0.8)" strokeWidth={3} fill="none" />
      <Label x={215} y={17} text="Aorta" anchor="start" small />
      {/* Pulmonary trunk */}
      <path d="M115,75 C108,52 105,35 100,22" stroke="rgba(100,140,210,0.8)" strokeWidth={3} fill="none" />
      <Label x={95} y={19} text="PA" anchor="end" small />
      {/* SVC */}
      <path d="M128,62 L128,18" stroke="rgba(100,140,210,0.6)" strokeWidth={2} fill="none" />
      <Label x={128} y={14} text="SVC" anchor="middle" small />
      {/* IVC */}
      <path d="M128,148 L128,180" stroke="rgba(100,140,210,0.6)" strokeWidth={2} fill="none" />
      <Label x={128} y={193} text="IVC" anchor="middle" small />
      {/* Legend */}
      <rect x="8" y="188" width="8" height="8" fill="rgba(220,100,100,0.8)" rx="2" />
      <text x="20" y="195" fill="rgba(252,250,247,0.5)" fontSize={7.5} fontFamily="monospace">Systemic (arterial)</text>
      <rect x="110" y="188" width="8" height="8" fill="rgba(100,140,210,0.8)" rx="2" />
      <text x="122" y="195" fill="rgba(252,250,247,0.5)" fontSize={7.5} fontFamily="monospace">Pulmonary (venous)</text>
    </svg>
  );
}

function RespiratorySVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Larynx */}
      <rect x="136" y="15" width="28" height="18" rx="4" fill="rgba(60,90,160,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={150} y={28} text="Larynx" />
      {/* Trachea */}
      <rect x="140" y="32" width="20" height="40" rx="3" fill="rgba(60,90,160,0.45)" stroke="rgba(252,250,247,0.18)" strokeWidth={1} />
      <Label x={150} y={58} text="Trachea" />
      {/* Carina */}
      <path d="M140,72 L100,88 M160,72 L200,88" stroke="rgba(252,250,247,0.3)" strokeWidth={2} fill="none" />
      {/* Bronchi */}
      <rect x="75" y="88" width="50" height="12" rx="3" fill="rgba(60,90,160,0.4)" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <rect x="175" y="88" width="50" height="12" rx="3" fill="rgba(60,90,160,0.4)" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <Label x={100} y={98} text="L. Bronchus" small />
      <Label x={200} y={98} text="R. Bronchus" small />
      {/* Left lung */}
      <path d="M65,100 Q40,115 38,150 Q38,185 70,192 Q100,195 115,175 L115,100 Z" fill="rgba(60,80,150,0.35)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      {/* Right lung (2 lobes, wider) */}
      <path d="M185,100 Q260,115 262,150 Q262,185 230,192 Q200,195 185,175 L185,100 Z" fill="rgba(60,80,150,0.35)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      {/* Lobe fissure right lung */}
      <path d="M200,120 Q240,145 230,175" stroke="rgba(252,250,247,0.15)" strokeWidth={1} fill="none" />
      <Label x={80} y={155} text="Left Lung" />
      <Label x={222} y={150} text="Right Lung" />
      {/* Diaphragm */}
      <path d="M30,195 Q100,210 150,202 Q200,210 270,195" stroke="rgba(252,250,247,0.4)" strokeWidth={2.5} fill="none" />
      <Label x={150} y={212} text="Diaphragm" />
      {/* Alveolus */}
      <circle cx="75" cy="165" r="7" fill="rgba(120,160,220,0.3)" stroke="rgba(252,250,247,0.2)" strokeWidth={0.8} />
      <Label x={75} y={183} text="alveolus" small />
    </svg>
  );
}

function DigestiveSVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Pharynx / Throat */}
      <path d="M128,1 Q150,-1 172,1 L169,10 Q150,13 131,10 Z" fill="rgba(160,100,50,0.32)" stroke="rgba(252,250,247,0.14)" strokeWidth={1} />
      <Label x={150} y={7} text="Pharynx" small />
      {/* Esophagus */}
      <rect x="138" y="11" width="24" height="31" rx="4" fill="rgba(160,100,50,0.4)" stroke="rgba(252,250,247,0.18)" strokeWidth={1} />
      <Label x={150} y={27} text="Esophagus" small />
      {/* Liver (right, large) */}
      <path d="M168,45 Q205,45 218,60 Q225,75 210,90 Q190,98 168,88 Z" fill="rgba(130,80,40,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={196} y={72} text="Liver" />
      {/* Gallbladder */}
      <ellipse cx="178" cy="96" rx="8" ry="5" fill="rgba(100,140,50,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={178} y={107} text="Gallbladder" small />
      {/* Stomach */}
      <path d="M140,43 Q120,45 108,58 Q100,75 110,92 Q125,108 148,108 L155,88 L155,43Z" fill="rgba(160,100,50,0.45)" stroke="rgba(252,250,247,0.18)" strokeWidth={1} />
      <Label x={122} y={80} text="Stomach" />
      {/* Pancreas (dotted, behind) */}
      <path d="M118,100 Q145,95 168,98" stroke="rgba(180,140,60,0.6)" strokeWidth={5} strokeDasharray="3,2" fill="none" />
      <Label x={143} y={110} text="Pancreas" small />
      {/* Small intestine (coiled center) */}
      <path d="M125,118 Q90,122 88,138 Q86,155 105,160 Q128,165 135,148 Q140,132 122,128 Q105,128 108,142 Q112,156 128,154 Q144,150 142,138" stroke="rgba(160,100,50,0.6)" strokeWidth={7} fill="none" strokeLinecap="round" />
      <Label x={115} y={172} text="Small intestine" small />
      {/* Large intestine */}
      <path d="M145,118 L145,110 L240,110 L240,185 L60,185 L60,160 L88,160" stroke="rgba(180,120,60,0.6)" strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Label x={240} y={148} text="Colon" anchor="end" small />
      {/* Rectum */}
      <path d="M85,185 L95,205" stroke="rgba(180,120,60,0.6)" strokeWidth={6} fill="none" />
      <Label x={95} y={212} text="Rectum" small />
    </svg>
  );
}

function NervousSVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Brain outline (lateral view, left) */}
      <path d="M80,30 Q100,15 125,15 Q165,15 185,38 Q205,60 200,88 Q196,108 175,115 Q165,118 155,130 Q148,140 145,148 Q125,148 110,145 Q90,140 82,128 Q65,108 65,88 Q65,60 80,30Z" fill="rgba(90,50,130,0.45)" stroke="rgba(252,250,247,0.25)" strokeWidth={1.5} />
      {/* Frontal lobe label */}
      <Label x={98} y={55} text="Frontal" />
      {/* Parietal lobe */}
      <Label x={148} y={45} text="Parietal" />
      {/* Temporal lobe */}
      <Label x={88} y={110} text="Temporal" />
      {/* Occipital lobe */}
      <Label x={180} y={95} text="Occipital" />
      {/* Central sulcus (rough divider) */}
      <path d="M120,22 Q118,40 115,55 Q112,70 108,80" stroke="rgba(252,250,247,0.18)" strokeWidth={1} fill="none" />
      {/* Lateral sulcus */}
      <path d="M75,80 Q100,90 130,92 Q150,92 175,88" stroke="rgba(252,250,247,0.18)" strokeWidth={1} fill="none" />
      {/* Cerebellum */}
      <path d="M145,150 Q145,140 155,132 Q170,125 185,130 Q210,140 208,165 Q205,180 185,182 Q160,183 148,168 Z" fill="rgba(80,45,120,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.2} />
      {/* Cerebellum folds */}
      <path d="M152,155 Q175,148 198,155 M150,162 Q175,156 200,162 M155,170 Q180,163 202,170" stroke="rgba(252,250,247,0.12)" strokeWidth={1} fill="none" />
      <Label x={178} y={160} text="Cerebellum" />
      {/* Brain stem */}
      <path d="M128,148 L128,178 Q128,190 132,198 Q136,205 140,205" stroke="rgba(252,250,247,0.4)" strokeWidth={8} strokeLinecap="round" fill="none" />
      <Label x={148} y={200} text="Brainstem" anchor="start" small />
      {/* Spinal cord */}
      <path d="M134,205 L134,215" stroke="rgba(252,250,247,0.35)" strokeWidth={5} fill="none" />
      {/* Neuron illustration */}
      <circle cx="252" cy="80" r="10" fill="rgba(120,70,160,0.4)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <path d="M252,70 L252,55 M244,76 L234,70 M260,76 L270,70" stroke="rgba(252,250,247,0.35)" strokeWidth={1} fill="none" />
      <path d="M252,90 L252,120 M248,100 L240,105 M256,100 L264,105" stroke="rgba(252,250,247,0.35)" strokeWidth={1} fill="none" />
      <Label x={252} y={132} text="Neuron" />
    </svg>
  );
}

function MusculoskeletalSVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Long bone cross-section (femur-like) */}
      {/* Outer bone cortex */}
      <path d="M95,12 Q80,18 78,35 L78,175 Q80,192 95,198 L205,198 Q220,192 222,175 L222,35 Q220,18 205,12 Z" fill="rgba(200,180,140,0.35)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      {/* Compact bone outer (thicker at diaphysis) */}
      <path d="M95,12 Q80,18 88,35 L100,35 L100,175 L88,175 Q80,192 95,198 L205,198 Q220,192 212,175 L200,175 L200,35 L212,35 Q220,18 205,12 Z" fill="rgba(220,200,160,0.4)" />
      {/* Periosteum (outer line) */}
      <Label x={150} y={9} text="Periosteum" />
      <Line x1={110} y1={11} x2={110} y2={15} />
      {/* Spongy bone (ends) */}
      <path d="M100,35 L200,35 Q190,50 170,55 L130,55 Q110,50 100,35Z" fill="rgba(200,170,120,0.5)" />
      <path d="M100,175 L200,175 Q190,162 170,157 L130,157 Q110,162 100,175Z" fill="rgba(200,170,120,0.5)" />
      {/* Trabeculae lines (spongy bone texture) */}
      {[0,1,2,3,4].map(i => <line key={i} x1={108+i*16} y1={40} x2={115+i*16} y2={53} stroke="rgba(252,250,247,0.15)" strokeWidth={0.8} />)}
      {[0,1,2,3,4].map(i => <line key={i+5} x1={108+i*16} y1={170} x2={115+i*16} y2={157} stroke="rgba(252,250,247,0.15)" strokeWidth={0.8} />)}
      <Label x={150} y={47} text="Spongy bone" small />
      {/* Medullary cavity (yellow marrow) */}
      <rect x="100" y="55" width="100" height="102" fill="rgba(200,170,80,0.2)" />
      <Label x={150} y={108} text="Medullary cavity" />
      <Label x={150} y={120} text="(yellow marrow)" small />
      {/* Compact bone label */}
      <Label x={80} y={108} text="Compact" anchor="end" small />
      <Label x={80} y={118} text="bone" anchor="end" small />
      <Line x1={81} y1={113} x2={100} y2={113} />
      {/* Endosteum */}
      <Label x={220} y={108} text="Endosteum" anchor="start" small />
      <Line x1={219} y1={108} x2={200} y2={108} />
      {/* Articular cartilage */}
      <rect x="95" y="198" width="110" height="10" rx="3" fill="rgba(60,160,120,0.4)" />
      <rect x="95" y="2" width="110" height="12" rx="3" fill="rgba(60,160,120,0.4)" />
      <Label x={212} y={205} text="Articular cartilage" anchor="start" small />
    </svg>
  );
}

function UrinarySVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Left kidney */}
      <path d="M68,35 Q45,40 40,65 Q38,90 52,105 Q65,115 80,110 Q95,105 98,90 Q100,70 90,50 Q82,35 68,35Z" fill="rgba(160,80,40,0.5)" stroke="rgba(252,250,247,0.22)" strokeWidth={1.5} />
      {/* Kidney hilum left */}
      <path d="M98,72 Q92,70 88,75 Q92,80 98,78" fill="rgba(0,0,0,0.3)" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <Label x={60} y={75} text="Left Kidney" />
      {/* Right kidney */}
      <path d="M232,35 Q255,40 260,65 Q262,90 248,105 Q235,115 220,110 Q205,105 202,90 Q200,70 210,50 Q218,35 232,35Z" fill="rgba(160,80,40,0.5)" stroke="rgba(252,250,247,0.22)" strokeWidth={1.5} />
      <Label x={240} y={75} text="Right Kidney" />
      {/* Renal pelvis / ureter left */}
      <path d="M98,75 L140,75 L140,158" stroke="rgba(120,160,200,0.7)" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* Renal pelvis / ureter right */}
      <path d="M202,75 L160,75 L160,158" stroke="rgba(120,160,200,0.7)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Label x={115} y={115} text="Ureter" small />
      <Label x={185} y={115} text="Ureter" small />
      {/* Bladder */}
      <path d="M105,158 Q95,175 100,190 Q110,208 150,210 Q190,208 200,190 Q205,175 195,158 Z" fill="rgba(60,100,160,0.45)" stroke="rgba(252,250,247,0.22)" strokeWidth={1.5} />
      <Label x={150} y={188} text="Urinary bladder" />
      {/* Urethra */}
      <path d="M150,210 L150,215" stroke="rgba(120,160,200,0.6)" strokeWidth={4} fill="none" />
      <Label x={155} y={214} text="Urethra" anchor="start" small />
      {/* Adrenal gland indicator */}
      <path d="M72,33 Q68,22 75,18 Q82,15 85,22" fill="rgba(180,140,40,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={75} y={14} text="Adrenal" small />
      <path d="M228,33 Q232,22 225,18 Q218,15 215,22" fill="rgba(180,140,40,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={224} y={14} text="Adrenal" small />
    </svg>
  );
}

function EndocrineSVG() {
  const glands = [
    { cx: 150, cy: 28,  r: 7,  color: "#9060c0", label: "Hypothalamus", ly: 18 },
    { cx: 150, cy: 42,  r: 5,  color: "#7048a0", label: "Pituitary",    ly: 56 },
    { cx: 150, cy: 65,  r: 6,  color: "#4090b0", label: "Thyroid",      ly: 80 },
    { cx: 150, cy: 100, r: 5,  color: "#6080a0", label: "Thymus",       ly: 114 },
    { cx: 115, cy: 128, r: 5,  color: "#c07030", label: "Pancreas",     ly: 142 },
    { cx: 115, cy: 155, r: 4,  color: "#a06030", label: "Adrenal (L)",  ly: 168 },
    { cx: 185, cy: 155, r: 4,  color: "#a06030", label: "Adrenal (R)",  ly: 168 },
    { cx: 120, cy: 188, r: 5,  color: "#a04870", label: "Ovary (L)",    ly: 202 },
    { cx: 180, cy: 188, r: 5,  color: "#a04870", label: "Ovary (R)",    ly: 202 },
  ];
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Body outline */}
      <path d="M150,8 C148,8 136,10 130,15 L130,40 Q110,45 105,60 L90,60 L90,180 L210,180 L210,60 L195,60 Q190,45 170,40 L170,15 Q164,10 152,8Z" fill="rgba(255,255,255,0.04)" stroke="rgba(252,250,247,0.12)" strokeWidth={1} />
      {glands.map(g => (
        <g key={g.label}>
          <circle cx={g.cx} cy={g.cy} r={g.r} fill={g.color + "99"} stroke="rgba(252,250,247,0.3)" strokeWidth={1} />
          <text x={g.cx + g.r + 4} y={g.cy + 3} fill="rgba(252,250,247,0.7)" fontSize={8} fontFamily="monospace">{g.label}</text>
        </g>
      ))}
      <text x="8" y="212" fill="rgba(252,250,247,0.3)" fontSize={7.5} fontFamily="monospace">Note: Parathyroids (behind thyroid) and pineal gland also shown</text>
    </svg>
  );
}

function IntegumentarySVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Skin surface */}
      <rect x="15" y="20" width="270" height="195" fill="rgba(255,255,255,0.03)" rx="6" />
      {/* Epidermis layer */}
      <rect x="15" y="20" width="270" height="32" fill="rgba(200,160,100,0.45)" rx="4" />
      <Label x={150} y={38} text="Epidermis" />
      {/* Dermis layer */}
      <rect x="15" y="52" width="270" height="80" fill="rgba(180,130,80,0.3)" />
      <Label x={150} y={68} text="Dermis" />
      {/* Hypodermis */}
      <rect x="15" y="132" width="270" height="83" fill="rgba(220,190,100,0.2)" />
      <Label x={150} y={150} text="Hypodermis (subcutaneous)" />
      {/* Fat cells in hypodermis */}
      {[0,1,2,3,4,5,6,7].map(i => <ellipse key={i} cx={35+i*33} cy={170} rx={12} ry={8} fill="rgba(220,190,60,0.2)" stroke="rgba(252,250,247,0.1)" strokeWidth={0.8} />)}
      {/* Hair follicle */}
      <path d="M85,20 L85,120 Q85,130 90,135 Q95,140 100,135 Q105,130 105,120 L105,20" fill="rgba(100,70,40,0.4)" stroke="rgba(252,250,247,0.15)" strokeWidth={0.8} />
      <path d="M90,20 Q95,14 100,20" fill="rgba(80,60,30,0.6)" />
      <Label x={95} y={12} text="Hair" />
      {/* Sebaceous gland */}
      <ellipse cx={108} cy={90} rx={10} ry={7} fill="rgba(180,160,60,0.4)" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <Label x={125} y={92} text="Sebaceous gland" anchor="start" small />
      {/* Sweat gland (eccrine) - coiled at bottom */}
      <path d="M180,132 L180,165 Q180,178 188,182 Q196,186 196,178 Q196,165 188,160 L188,132" stroke="rgba(100,160,200,0.6)" strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={188} cy={182} r={6} fill="rgba(100,160,200,0.3)" stroke="rgba(100,160,200,0.5)" strokeWidth={1} />
      <Label x={200} y={178} text="Sweat gland" anchor="start" small />
      {/* Blood vessel */}
      <path d="M220,60 L220,140" stroke="rgba(200,60,60,0.6)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Label x={228} y={100} text="Blood vessel" anchor="start" small />
      {/* Nerve ending */}
      <path d="M250,52 L250,80 M245,70 L240,75 M255,70 L260,75" stroke="rgba(200,150,220,0.6)" strokeWidth={1.5} fill="none" />
      <Label x={252} y={90} text="Sensory nerve" anchor="start" small />
      {/* Layer labels on left */}
      <line x1="15" y1="52" x2="8" y2="52" stroke="rgba(252,250,247,0.15)" strokeWidth={0.8} />
      <line x1="15" y1="132" x2="8" y2="132" stroke="rgba(252,250,247,0.15)" strokeWidth={0.8} />
    </svg>
  );
}

function LymphaticSVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      {/* Thoracic duct (main lymph trunk) */}
      <path d="M140,210 L140,120 L130,90 L135,55 L145,30 L150,18" stroke="rgba(100,180,180,0.5)" strokeWidth={3} fill="none" strokeDasharray="4,2" />
      <Label x={118} y={160} text="Thoracic duct" anchor="end" small />
      {/* Cervical lymph nodes */}
      <circle cx={130} cy={55} r={6} fill="rgba(80,160,160,0.5)" stroke="rgba(252,250,247,0.25)" strokeWidth={1} />
      <circle cx={168} cy={55} r={6} fill="rgba(80,160,160,0.5)" stroke="rgba(252,250,247,0.25)" strokeWidth={1} />
      <Label x={150} y={46} text="Cervical nodes" />
      {/* Axillary nodes (armpit) */}
      <circle cx={80} cy={95} r={7} fill="rgba(80,160,160,0.5)" stroke="rgba(252,250,247,0.25)" strokeWidth={1} />
      <circle cx={220} cy={95} r={7} fill="rgba(80,160,160,0.5)" stroke="rgba(252,250,247,0.25)" strokeWidth={1} />
      <Label x={62} y={95} text="Axillary" anchor="end" small />
      <Label x={238} y={95} text="Axillary" anchor="start" small />
      {/* Spleen */}
      <ellipse cx={210} cy={130} rx={22} ry={18} fill="rgba(140,60,100,0.45)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      <Label x={210} y={132} text="Spleen" />
      {/* Thymus */}
      <path d="M132,80 Q140,75 148,80 L148,95 Q140,100 132,95 Z" fill="rgba(80,140,130,0.4)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={140} y={108} text="Thymus" />
      {/* Inguinal nodes */}
      <circle cx={120} cy={185} r={5} fill="rgba(80,160,160,0.5)" stroke="rgba(252,250,247,0.25)" strokeWidth={1} />
      <circle cx={180} cy={185} r={5} fill="rgba(80,160,160,0.5)" stroke="rgba(252,250,247,0.25)" strokeWidth={1} />
      <Label x={150} y={200} text="Inguinal nodes" />
      {/* Lymph vessels (simplified lines) */}
      <path d="M80,95 L120,185 M220,95 L180,185" stroke="rgba(100,180,180,0.3)" strokeWidth={1.5} fill="none" strokeDasharray="3,2" />
      <path d="M130,55 L80,95 M168,55 L220,95" stroke="rgba(100,180,180,0.3)" strokeWidth={1.5} fill="none" strokeDasharray="3,2" />
      {/* Lymph node enlarged diagram */}
      <ellipse cx={40} cy={165} rx={22} ry={32} fill="rgba(80,160,160,0.2)" stroke="rgba(80,160,160,0.4)" strokeWidth={1.2} />
      {[0,1,2].map(i => <path key={i} d={`M18,${148+i*9} Q40,${144+i*9} 62,${148+i*9}`} stroke="rgba(100,180,180,0.25)" strokeWidth={0.8} fill="none" />)}
      <Label x={40} y={205} text="Lymph node" small />
    </svg>
  );
}

function ReproductiveSVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      <text x="150" y="25" fill="rgba(252,250,247,0.6)" fontSize={11} fontFamily="monospace" textAnchor="middle" fontWeight="bold">Female Reproductive</text>
      {/* Uterus */}
      <path d="M110,80 Q100,82 95,95 Q90,112 100,128 Q115,148 150,152 Q185,148 200,128 Q210,112 205,95 Q200,82 190,80 Q180,78 170,82 L170,78 L150,72 L130,78 L130,82 Q120,78 110,80Z" fill="rgba(160,60,100,0.45)" stroke="rgba(252,250,247,0.22)" strokeWidth={1.5} />
      <Label x={150} y={118} text="Uterus" />
      {/* Cervix */}
      <path d="M135,152 L135,175 Q150,180 165,175 L165,152" fill="rgba(140,50,85,0.4)" stroke="rgba(252,250,247,0.18)" strokeWidth={1} />
      <Label x={175} y={170} text="Cervix" anchor="start" small />
      {/* Vagina label */}
      <path d="M140,175 L140,205 Q150,210 160,205 L160,175" fill="rgba(120,45,75,0.35)" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <Label x={165} y={195} text="Vagina" anchor="start" small />
      {/* Fallopian tubes */}
      <path d="M110,82 Q85,75 70,72 Q55,70 50,75 Q45,82 52,88" stroke="rgba(200,100,140,0.7)" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M190,82 Q215,75 230,72 Q245,70 250,75 Q255,82 248,88" stroke="rgba(200,100,140,0.7)" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Label x={60} y={68} text="Fallopian tube" small />
      {/* Fimbriae */}
      {[-4,-2,0,2,4].map(i => <line key={i} x1={52+i} y1={88} x2={50+i*1.5} y2={98} stroke="rgba(200,100,140,0.6)" strokeWidth={1} />)}
      {[-4,-2,0,2,4].map(i => <line key={i+5} x1={248+i} y1={88} x2={250+i*1.5} y2={98} stroke="rgba(200,100,140,0.6)" strokeWidth={1} />)}
      {/* Ovaries */}
      <ellipse cx={50} cy={92} rx={12} ry={9} fill="rgba(180,80,120,0.5)" stroke="rgba(252,250,247,0.22)" strokeWidth={1.2} />
      <ellipse cx={250} cy={92} rx={12} ry={9} fill="rgba(180,80,120,0.5)" stroke="rgba(252,250,247,0.22)" strokeWidth={1.2} />
      <Label x={38} y={105} text="Ovary" anchor="middle" small />
      <Label x={262} y={105} text="Ovary" anchor="middle" small />
      {/* Uterus cavity + endometrium label */}
      <Label x={55} y={128} text="Endometrium" anchor="end" small />
      <line x1={56} y1={125} x2={115} y2={118} stroke="rgba(252,250,247,0.15)" strokeWidth={0.8} />
    </svg>
  );
}

function SpecialSensesSVG() {
  return (
    <svg viewBox="0 0 300 215" style={{ width: "100%", maxWidth: 300 }}>
      <rect width="300" height="215" fill="rgba(0,0,0,0.2)" rx="8" />
      <text x="75" y="14" fill="rgba(252,250,247,0.55)" fontSize={9.5} fontFamily="monospace" textAnchor="middle">Eye</text>
      <text x="225" y="14" fill="rgba(252,250,247,0.55)" fontSize={9.5} fontFamily="monospace" textAnchor="middle">Ear</text>
      {/* Divider */}
      <line x1="150" y1="10" x2="150" y2="215" stroke="rgba(252,250,247,0.07)" strokeWidth={1} />

      {/* EYE cross-section */}
      <ellipse cx={75} cy={110} rx={60} ry={55} fill="rgba(255,255,255,0.05)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      {/* Sclera label */}
      <Label x={130} y={88} text="Sclera" anchor="end" small />
      {/* Choroid */}
      <ellipse cx={75} cy={110} rx={54} ry={49} fill="rgba(100,60,30,0.3)" stroke="rgba(252,250,247,0.1)" strokeWidth={1} />
      {/* Retina */}
      <ellipse cx={75} cy={110} rx={48} ry={43} fill="rgba(40,60,80,0.4)" stroke="rgba(252,250,247,0.12)" strokeWidth={1} />
      <Label x={40} y={145} text="Retina" small />
      {/* Vitreous */}
      <ellipse cx={75} cy={110} rx={42} ry={37} fill="rgba(100,140,180,0.15)" />
      <Label x={75} y={115} text="Vitreous" small />
      {/* Cornea (front dome) */}
      <path d="M22,90 Q15,110 22,130" stroke="rgba(200,230,250,0.5)" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Label x={10} y={110} text="Cornea" anchor="end" small />
      {/* Iris */}
      <ellipse cx={32} cy={110} rx={9} ry={14} fill="rgba(60,100,150,0.5)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      {/* Pupil */}
      <ellipse cx={32} cy={110} rx={4} ry={6} fill="rgba(0,0,0,0.8)" />
      {/* Lens */}
      <ellipse cx={43} cy={110} rx={7} ry={12} fill="rgba(220,220,180,0.3)" stroke="rgba(252,250,247,0.2)" strokeWidth={0.8} />
      <Label x={48} y={108} text="Lens" anchor="start" small />
      {/* Optic nerve */}
      <path d="M123,110 L143,110" stroke="rgba(252,250,247,0.4)" strokeWidth={4} strokeLinecap="round" fill="none" />
      <Label x={133} y={122} text="Optic nerve" small />

      {/* EAR cross-section */}
      {/* Outer ear (pinna) */}
      <path d="M165,58 Q158,65 158,90 Q158,110 165,118 Q175,128 180,120 L180,115 Q175,118 170,110 Q167,98 167,82 Q167,68 173,62 Z" fill="rgba(180,140,80,0.35)" stroke="rgba(252,250,247,0.2)" strokeWidth={1} />
      <Label x={157} y={62} text="Pinna" anchor="end" small />
      {/* External auditory canal */}
      <rect x="180" y="82" width="28" height="16" rx="4" fill="rgba(150,120,70,0.3)" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <Label x={194} y={108} text="Ext. canal" small />
      {/* Tympanic membrane */}
      <rect x="208" y="78" width="4" height="24" rx="1" fill="rgba(200,200,150,0.6)" />
      <Label x={213} y={74} text="Tympanic membrane" anchor="start" small />
      {/* Middle ear ossicles */}
      {/* Malleus */}
      <path d="M212,82 L222,78 L226,82" stroke="rgba(220,200,150,0.8)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* Incus */}
      <path d="M226,82 L234,86 L232,92" stroke="rgba(220,200,150,0.8)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* Stapes */}
      <path d="M232,92 L240,90 L245,96 L240,100 L232,98" stroke="rgba(220,200,150,0.7)" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Label x={228} y={75} text="Malleus Incus Stapes" anchor="middle" small />
      {/* Oval window / Cochlea */}
      <path d="M245,98 Q260,95 268,105 Q272,118 264,128 Q256,140 245,138 Q235,136 232,128 Q228,118 234,108Z" fill="rgba(60,100,150,0.4)" stroke="rgba(252,250,247,0.2)" strokeWidth={1.2} />
      {[0,1].map(i => <path key={i} d={`M240,${108+i*12} Q255,${104+i*12} 268,${108+i*12}`} stroke="rgba(252,250,247,0.1)" strokeWidth={0.8} fill="none" />)}
      <Label x={255} y={118} text="Cochlea" small />
      {/* Semicircular canals */}
      <path d="M255,98 Q275,82 285,100 Q285,115 268,115" stroke="rgba(100,150,200,0.5)" strokeWidth={3} fill="none" />
      <path d="M258,96 Q268,78 280,90 Q285,100 272,108" stroke="rgba(100,150,200,0.4)" strokeWidth={2} fill="none" />
      <Label x={283} y={88} text="Semicircular canals" anchor="end" small />
      {/* Eustachian tube */}
      <path d="M242,138 Q238,165 230,180 Q222,195 215,205" stroke="rgba(180,160,80,0.5)" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Label x={213} y={210} text="Eustachian tube" anchor="end" small />
    </svg>
  );
}

function BodyOverview({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <svg viewBox="0 0 160 360" style={{ width: "100%", maxWidth: 160, display: "block" }}>
      {/* Body fill */}
      <circle cx="80" cy="28" r="22" fill="#2a3040" stroke="rgba(252,250,247,0.2)" strokeWidth={1.5} />
      <rect x="70" y="49" width="20" height="10" fill="#2a3040" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <path d="M48,58 Q52,57 70,56 L90,56 Q108,57 112,58 L112,185 L48,185 Z" fill="#2a3040" stroke="rgba(252,250,247,0.18)" strokeWidth={1.2} />
      <path d="M30,62 L30,142 L48,142 L48,60" fill="#2a3040" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <path d="M130,62 L130,142 L112,142 L112,60" fill="#2a3040" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <rect x="48" y="185" width="28" height="110" fill="#2a3040" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />
      <rect x="84" y="185" width="28" height="110" fill="#2a3040" stroke="rgba(252,250,247,0.15)" strokeWidth={1} />

      {SYSTEMS.map(sys => {
        const isSelected = selected === sys.id;
        const opacity = isSelected ? 0.65 : 0.22;
        const region = sys.region;
        const fill = sys.color + Math.round(opacity * 255).toString(16).padStart(2, "0");
        const stroke = sys.color;
        const common: React.SVGProps<SVGElement> = { onClick: () => onSelect(sys.id), style: { cursor: "pointer" } };
        if (region.type === "ellipse") return <ellipse key={sys.id} {...common as any} cx={(region as any).cx} cy={(region as any).cy} rx={(region as any).rx} ry={(region as any).ry} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.5} />;
        if (region.type === "twoEllipse") return <g key={sys.id} {...common as any}><ellipse cx={(region as any).cx1} cy={(region as any).cy1} rx={(region as any).rx1} ry={(region as any).ry1} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.2} /><ellipse cx={(region as any).cx2} cy={(region as any).cy2} rx={(region as any).rx2} ry={(region as any).ry2} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.2} /></g>;
        if (region.type === "rect") return <rect key={sys.id} {...common as any} x={(region as any).x} y={(region as any).y} width={(region as any).w} height={(region as any).h} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.5} />;
        if (region.type === "head") return <circle key={sys.id} {...common as any} cx={(region as any).cx} cy={(region as any).cy} r={(region as any).r} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.5} />;
        if (region.type === "full") return <path key={sys.id} {...common as any} d="M48,58 L48,185 L30,142 L30,62 Z M112,58 L112,185 L130,142 L130,62 Z M48,185 L48,295 L84,295 L84,185 Z M84,185 L84,295 L112,295 L112,185 Z M48,60 L112,60 L112,185 L48,185 Z" fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.2} />;
        if (region.type === "glands") return <g key={sys.id}>{[{ cx: 80, cy: 28, r: 5 }, { cx: 80, cy: 56, r: 4 }, { cx: 66, cy: 135, r: 4 }, { cx: 94, cy: 135, r: 4 }, { cx: 80, cy: 105, r: 4 }].map((g, i) => <circle key={i} {...common as any} cx={g.cx} cy={g.cy} r={g.r} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1.2} />)}</g>;
        if (region.type === "outline") return <path key={sys.id} {...common as any} d="M80,6 Q102,6 102,28 Q102,50 80,50 Q58,6 58,28 Q58,6 80,6Z M48,58 Q52,57 70,56 L90,56 Q108,57 112,58 L112,185 L48,185 Z M30,62 L30,142 L48,142 L48,60 Z M130,62 L130,142 L112,142 L112,60 Z M48,185 L48,295 L76,295 L76,185 Z M84,185 L84,295 L112,295 L112,185 Z" fill={"transparent"} stroke={isSelected ? stroke : sys.color + "55"} strokeWidth={isSelected ? 3 : 1.5} />;
        if (region.type === "lymph") return <g key={sys.id}>{[{ cx: 70, cy: 55, r: 4 }, { cx: 90, cy: 55, r: 4 }, { cx: 45, cy: 95, r: 5 }, { cx: 115, cy: 95, r: 5 }, { cx: 62, cy: 180, r: 4 }, { cx: 98, cy: 180, r: 4 }, { cx: 95, cy: 120, r: 5 }].map((g, i) => <circle key={i} {...common as any} cx={g.cx} cy={g.cy} r={g.r} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1} />)}</g>;
        if (region.type === "senses") return <g key={sys.id}><ellipse {...common as any} cx={70} cy={24} rx={5} ry={3} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1} /><ellipse {...common as any} cx={90} cy={24} rx={5} ry={3} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1} /><circle {...common as any} cx={58} cy={28} r={4} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1} /><circle {...common as any} cx={102} cy={28} r={4} fill={fill} stroke={isSelected ? stroke : "transparent"} strokeWidth={1} /></g>;
        return null;
      })}
    </svg>
  );
}

function findStructureByPath(system: typeof DATA_SYSTEMS[0], structPath: string[]): any {
  let items: any[] = system.structures as any[];
  let found: any = null;
  for (const id of structPath) {
    found = items.find((s: any) => s.id === id);
    if (!found) return null;
    items = found.children ?? [];
  }
  return found;
}

function StructureCard({ structure, accentColor, onClick }: { structure: any; accentColor: string; onClick: () => void }) {
  const hasChildren = structure.children && structure.children.length > 0;
  const baseName = structure.officialName.split("(")[0].trim();
  const parenPart = structure.officialName.match(/\(([^)]+)\)/)?.[1];
  return (
    <button
      onClick={onClick}
      style={{ textAlign: "left", padding: "16px 18px", borderRadius: "13px", backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${accentColor}33`, color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", width: "100%", transition: "background 0.14s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = accentColor + "28"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.05)"; }}
    >
      <div style={{ fontWeight: "700", fontSize: "0.92rem", marginBottom: "1px" }}>{baseName}</div>
      {parenPart && <div style={{ color: "rgba(252,250,247,0.28)", fontSize: "0.73rem", marginBottom: "3px" }}>{parenPart}</div>}
      {structure.casualName && <div style={{ color: "rgba(252,250,247,0.38)", fontSize: "0.76rem", marginBottom: "6px" }}>{structure.casualName}</div>}
      {structure.combiningForm && (
        <div style={{ color: accentColor, fontFamily: "monospace", fontSize: "0.74rem", fontWeight: "700", marginBottom: "5px" }}>{structure.combiningForm}</div>
      )}
      <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", lineHeight: 1.4, marginBottom: "6px" }}>
        {structure.definition?.slice(0, 70)}{structure.definition?.length > 70 ? "..." : ""}
      </div>
      {hasChildren
        ? <div style={{ color: accentColor, fontSize: "0.73rem", fontWeight: "700" }}>{structure.children.length} parts inside ›</div>
        : <div style={{ color: "rgba(252,250,247,0.22)", fontSize: "0.72rem" }}>View details ›</div>
      }
    </button>
  );
}

function LeafDetail({ node, accentColor }: { node: any; accentColor: string }) {
  if (!node) return null;
  return (
    <div style={{ maxWidth: "580px" }}>
      <div style={{ backgroundColor: accentColor + "22", border: `1px solid ${accentColor}55`, borderRadius: "16px", padding: "26px 28px" }}>
        <div style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.25rem", marginBottom: "4px" }}>{node.officialName}</div>
        {node.casualName && <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.88rem", marginBottom: "14px" }}>{node.casualName}</div>}
        {node.combiningForm && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "4px" }}>Combining Form</div>
            <div style={{ color: accentColor, fontFamily: "monospace", fontSize: "1.05rem", fontWeight: "700" }}>{node.combiningForm}</div>
          </div>
        )}
        <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px" }}>Definition</div>
        <div style={{ color: "rgba(252,250,247,0.8)", fontSize: "0.92rem", lineHeight: 1.65 }}>{node.definition}</div>
        {node.homonymWarning && (
          <div style={{ marginTop: "16px", backgroundColor: "rgba(200,160,50,0.15)", border: "1px solid rgba(200,160,50,0.3)", borderRadius: "9px", padding: "11px 14px" }}>
            <div style={{ color: "#d4a830", fontSize: "0.75rem", fontWeight: "700", marginBottom: "3px" }}>Note</div>
            <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.8rem", lineHeight: 1.4 }}>{node.homonymWarning}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BodyReference() {
  const [, navigate] = useLocation();
  const [path, setPath] = useState<string[]>([]);
  const [animKey, setAnimKey] = useState(0);

  const drillInto = (id: string) => { setPath(p => [...p, id]); setAnimKey(k => k + 1); };
  const goToLevel = (idx: number) => { setPath(p => p.slice(0, idx)); setAnimKey(k => k + 1); };

  const currentSystem = path.length > 0 ? DATA_SYSTEMS.find(s => s.id === path[0]) : null;
  const uiSystem = path.length > 0 ? SYSTEMS.find(s => s.id === path[0]) : null;

  const getCurrentItems = (): any[] => {
    if (path.length === 0) return [];
    if (path.length === 1) return (currentSystem?.structures as any[]) ?? [];
    const node = findStructureByPath(currentSystem!, path.slice(1));
    return node?.children ?? [];
  };

  const currentNode = path.length >= 2 ? findStructureByPath(currentSystem!, path.slice(1)) : null;
  const items = getCurrentItems();
  const isLeaf = path.length >= 2 && items.length === 0;

  const crumbs: Array<{ label: string; idx: number }> = [{ label: "Body Explorer", idx: 0 }];
  if (path.length > 0 && currentSystem) {
    crumbs.push({ label: currentSystem.officialName.replace(" System", ""), idx: 1 });
  }
  for (let i = 1; i < path.length; i++) {
    const node = findStructureByPath(currentSystem!, path.slice(1, i + 1));
    if (node) crumbs.push({ label: node.officialName.split("(")[0].trim(), idx: i + 1 });
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @keyframes drillZoom {
          from { opacity: 0; transform: scale(0.93) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        .drill-anim { animation: drillZoom 0.22s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* Header / breadcrumb */}
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(252,250,247,0.07)", flexWrap: "wrap" as const }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem", flexShrink: 0 }}>Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" as const }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button onClick={() => goToLevel(c.idx)} style={{ background: "none", border: "none", cursor: i < crumbs.length - 1 ? "pointer" : "default", fontFamily: "inherit", fontSize: "0.88rem", padding: "0", color: i === crumbs.length - 1 ? "#fcfaf7" : "rgba(252,250,247,0.4)", fontWeight: i === crumbs.length - 1 ? "700" : "400" }}>
                {c.label}
              </button>
              {i < crumbs.length - 1 && <span style={{ color: "rgba(252,250,247,0.2)", fontSize: "0.8rem" }}>›</span>}
            </span>
          ))}
        </div>
      </div>

      <div key={animKey} className="drill-anim" style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Level 0: All 11 body systems ── */}
        {path.length === 0 && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ color: "#fcfaf7", fontSize: "1.5rem", fontWeight: "800", marginBottom: "4px" }}>Body Systems Explorer</h1>
              <p style={{ color: "rgba(252,250,247,0.38)", fontSize: "0.88rem" }}>Click any system to zoom in and explore its anatomy.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "13px" }}>
              {DATA_SYSTEMS.map(sys => {
                const ui = SYSTEMS.find(s => s.id === sys.id);
                const col = ui?.color ?? "#4a5a6a";
                return (
                  <button
                    key={sys.id}
                    onClick={() => drillInto(sys.id)}
                    style={{ textAlign: "left", padding: "20px 18px", borderRadius: "15px", backgroundColor: col + "22", border: `1px solid ${col}44`, color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", transition: "all 0.14s" }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = col + "44"; b.style.borderColor = col + "88"; b.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = col + "22"; b.style.borderColor = col + "44"; b.style.transform = "scale(1)"; }}
                  >
                    <div style={{ fontSize: "1.9rem", marginBottom: "9px", lineHeight: 1 }}>{sys.emoji}</div>
                    <div style={{ fontWeight: "800", fontSize: "0.98rem", marginBottom: "2px" }}>{sys.officialName.replace(" System", "")}</div>
                    <div style={{ color: "rgba(252,250,247,0.38)", fontSize: "0.75rem", marginBottom: "7px" }}>{sys.casualName}</div>
                    <div style={{ color: col, fontSize: "0.72rem", fontWeight: "700" }}>{sys.structures.length} structures › Explore</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Level 1: Inside a body system ── */}
        {path.length === 1 && currentSystem && uiSystem && (
          <div>
            <div style={{ display: "flex", gap: "28px", marginBottom: "28px", flexWrap: "wrap" as const }}>
              {/* SVG Diagram */}
              <div style={{ flex: "0 0 240px", minWidth: "180px" }}>
                <div style={{ color: "rgba(252,250,247,0.28)", fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "8px" }}>Diagram</div>
                <SystemDiagram id={path[0]} />
              </div>

              {/* System info + structure grid */}
              <div style={{ flex: 1, minWidth: "260px" }}>
                <h2 style={{ color: "#fcfaf7", fontSize: "1.35rem", fontWeight: "800", marginBottom: "3px" }}>{currentSystem.officialName}</h2>
                <div style={{ color: "rgba(252,250,247,0.38)", fontSize: "0.85rem", marginBottom: "18px" }}>{uiSystem.desc}</div>
                <div style={{ color: "rgba(252,250,247,0.28)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "10px" }}>Structures — click to explore inside</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "10px" }}>
                  {(currentSystem.structures as any[]).map((s: any) => (
                    <StructureCard key={s.id} structure={s} accentColor={uiSystem.color} onClick={() => drillInto(s.id)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Level 2+: Inside a structure ── */}
        {path.length >= 2 && currentSystem && uiSystem && (
          <div>
            {isLeaf ? (
              <LeafDetail node={currentNode} accentColor={uiSystem.color} />
            ) : (
              <>
                {/* Current node summary */}
                <div style={{ backgroundColor: uiSystem.color + "22", border: `1px solid ${uiSystem.color}44`, borderRadius: "13px", padding: "18px 22px", marginBottom: "20px" }}>
                  <div style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.1rem", marginBottom: "3px" }}>{currentNode?.officialName}</div>
                  {currentNode?.casualName && <div style={{ color: "rgba(252,250,247,0.38)", fontSize: "0.8rem", marginBottom: "6px" }}>{currentNode.casualName}</div>}
                  {currentNode?.combiningForm && <div style={{ color: uiSystem.color, fontFamily: "monospace", fontSize: "0.82rem", fontWeight: "700", marginBottom: "7px" }}>{currentNode.combiningForm}</div>}
                  <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.86rem", lineHeight: 1.55 }}>{currentNode?.definition}</div>
                </div>
                <div style={{ color: "rgba(252,250,247,0.28)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "10px" }}>
                  Inside {currentNode?.officialName?.split("(")[0].trim()} — click a part to zoom in
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                  {items.map((s: any) => (
                    <StructureCard key={s.id} structure={s} accentColor={uiSystem.color} onClick={() => drillInto(s.id)} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
