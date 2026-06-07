export interface AvatarConfig {
  skinColor: string;
  hairColor: string;
  clothingColor: string;
  shoeColor: string;
  hairStyle: string;
  top: string;
  shoes: string;
  expression: string;
  eyebrowStyle: string;
  feature: string;
  accessory: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: "#e8c49a",
  hairColor: "#3d2b1f",
  clothingColor: "#4a6080",
  shoeColor: "#2d3748",
  hairStyle: "bob",
  top: "vneck",
  shoes: "sneakers",
  expression: "happy",
  eyebrowStyle: "normal",
  feature: "none",
  accessory: "none",
};

export const AVATAR_STORAGE_KEY = (username: string) =>
  `anatomix_avatar_${username.toLowerCase().replace(/\s+/g, "_")}`;

export function loadAvatar(username: string): AvatarConfig {
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY(username));
    return raw ? { ...DEFAULT_AVATAR, ...JSON.parse(raw) } : { ...DEFAULT_AVATAR };
  } catch { return { ...DEFAULT_AVATAR }; }
}

export function saveAvatar(username: string, config: AvatarConfig) {
  localStorage.setItem(AVATAR_STORAGE_KEY(username), JSON.stringify(config));
}

function Hair({ style, color }: { style: string; color: string }) {
  const c = color;
  switch (style) {
    case "afro":
      return <ellipse cx="60" cy="45" rx="38" ry="36" fill={c} />;
    case "curls":
      return <>
        <ellipse cx="60" cy="42" rx="35" ry="28" fill={c} />
        <circle cx="35" cy="52" r="10" fill={c} />
        <circle cx="85" cy="52" r="10" fill={c} />
        <circle cx="50" cy="28" r="8" fill={c} />
        <circle cx="70" cy="26" r="8" fill={c} />
      </>;
    case "buns":
      return <>
        <rect x="27" y="28" width="72" height="28" rx="14" fill={c} />
        <circle cx="32" cy="32" r="14" fill={c} />
        <circle cx="88" cy="32" r="14" fill={c} />
      </>;
    case "ponytail":
      return <>
        <rect x="30" y="26" width="60" height="24" rx="12" fill={c} />
        <rect x="55" y="20" width="14" height="40" rx="7" fill={c} />
        <ellipse cx="62" cy="58" rx="8" ry="14" fill={c} />
      </>;
    case "twists":
    case "dreads":
      return <>
        <rect x="30" y="26" width="60" height="20" rx="10" fill={c} />
        {[35, 48, 61, 74].map(x => <rect key={x} x={x} y="44" width="8" height="30" rx="4" fill={c} />)}
      </>;
    case "braids":
    case "cornrows":
      return <>
        <rect x="30" y="26" width="60" height="18" rx="9" fill={c} />
        {[33, 45, 57, 69, 81].map(x => <rect key={x} x={x} y="42" width="6" height="36" rx="3" fill={c} />)}
      </>;
    case "fade":
    case "buzz":
      return <rect x="30" y="28" width="60" height="18" rx="9" fill={c} />;
    case "waves":
      return <>
        <rect x="28" y="26" width="64" height="22" rx="11" fill={c} />
        <path d={`M28 40 Q38 34 48 40 Q58 46 68 40 Q78 34 88 40 Q92 43 92 46`} fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" />
      </>;
    case "hijab":
      return <>
        <ellipse cx="60" cy="50" rx="38" ry="34" fill={c} />
        <rect x="22" y="66" width="76" height="40" rx="8" fill={c} />
      </>;
    default: // bob
      return <>
        <rect x="28" y="26" width="64" height="32" rx="14" fill={c} />
        <rect x="28" y="44" width="10" height="20" rx="5" fill={c} />
        <rect x="82" y="44" width="10" height="20" rx="5" fill={c} />
      </>;
  }
}

function Eyes({ expression }: { expression: string }) {
  if (expression === "wink") return <>
    <circle cx="48" cy="62" r="4" fill="#2d2d2d" />
    <path d="M 58 62 Q 64 58 70 62" fill="none" stroke="#2d2d2d" strokeWidth="2.5" strokeLinecap="round" />
  </>;
  if (expression === "reading") return <>
    <rect x="43" y="59" width="12" height="5" rx="2.5" fill="#2d2d2d" />
    <rect x="61" y="59" width="12" height="5" rx="2.5" fill="#2d2d2d" />
  </>;
  return <>
    <circle cx="48" cy="62" r="4.5" fill="#2d2d2d" />
    <circle cx="72" cy="62" r="4.5" fill="#2d2d2d" />
    <circle cx="50" cy="60" r="1.2" fill="white" />
    <circle cx="74" cy="60" r="1.2" fill="white" />
  </>;
}

function Eyebrows({ style }: { style: string }) {
  const base = style === "raised" ? 50 : style === "flat" ? 55 : 53;
  return <>
    <rect x="42" y={base} width="13" height="4" rx="2" fill="#2d2d2d" transform={style === "normal" ? "rotate(-5,48,52)" : style === "raised" ? "rotate(-8,48,50)" : ""} />
    <rect x="65" y={base} width="13" height="4" rx="2" fill="#2d2d2d" transform={style === "normal" ? "rotate(5,72,52)" : style === "raised" ? "rotate(8,72,50)" : ""} />
  </>;
}

function Mouth({ expression }: { expression: string }) {
  if (expression === "happy" || expression === "wink") return <path d="M 50 76 Q 60 84 70 76" fill="none" stroke="#2d2d2d" strokeWidth="2.5" strokeLinecap="round" />;
  if (expression === "focused") return <line x1="52" y1="78" x2="68" y2="78" stroke="#2d2d2d" strokeWidth="2.5" strokeLinecap="round" />;
  return <path d="M 50 78 Q 60 76 70 78" fill="none" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />;
}

function Feature({ type, skinColor }: { type: string; skinColor: string }) {
  if (type === "freckles") return <>
    {[44, 52, 64, 72].map((x, i) => <circle key={i} cx={x} cy={72 + (i % 2) * 3} r="1.5" fill="rgba(0,0,0,0.18)" />)}
  </>;
  if (type === "mole") return <circle cx="72" cy="76" r="2" fill="rgba(0,0,0,0.3)" />;
  if (type === "dimples") return <>
    <circle cx="44" cy="78" r="2.5" fill="rgba(0,0,0,0.08)" />
    <circle cx="76" cy="78" r="2.5" fill="rgba(0,0,0,0.08)" />
  </>;
  if (type === "bridge") return <rect x="56" y="66" width="8" height="3" rx="1.5" fill="rgba(0,0,0,0.12)" />;
  return null;
}

function Clothing({ top, color }: { top: string; color: string }) {
  const dark = color + "dd";
  switch (top) {
    case "jacket":
      return <>
        <rect x="28" y="108" width="64" height="62" rx="10" fill={color} />
        <rect x="56" y="108" width="8" height="62" fill={dark} />
        <rect x="28" y="108" width="20" height="62" rx="10" fill={dark} />
      </>;
    case "vest":
      return <>
        <rect x="28" y="108" width="64" height="62" rx="10" fill={color} />
        <rect x="36" y="112" width="48" height="54" rx="8" fill={dark} />
        <rect x="44" y="116" width="6" height="6" rx="1" fill="rgba(255,255,255,0.2)" />
        <rect x="44" y="128" width="6" height="6" rx="1" fill="rgba(255,255,255,0.2)" />
      </>;
    case "tunic":
      return <>
        <rect x="24" y="108" width="72" height="66" rx="12" fill={color} />
        <circle cx="60" cy="130" r="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="60" cy="144" r="3" fill="rgba(255,255,255,0.2)" />
      </>;
    case "cardigan":
      return <>
        <rect x="28" y="108" width="64" height="62" rx="10" fill={color} />
        <path d="M60 108 L50 170" stroke={dark} strokeWidth="6" strokeLinecap="round" />
        <path d="M60 108 L70 170" stroke={dark} strokeWidth="6" strokeLinecap="round" />
      </>;
    case "dustcoat":
      return <>
        <rect x="22" y="108" width="76" height="70" rx="10" fill={color} />
        <rect x="56" y="108" width="8" height="70" fill={dark} />
        <rect x="22" y="108" width="16" height="70" rx="8" fill={dark} />
        <rect x="82" y="108" width="16" height="70" rx="8" fill={dark} />
      </>;
    default: // vneck
      return <>
        <rect x="28" y="108" width="64" height="62" rx="10" fill={color} />
        <path d="M60 108 L50 124 L60 136 L70 124 Z" fill={dark} />
      </>;
  }
}

function Shoes({ style, color }: { style: string; color: string }) {
  if (style === "clogs") return <>
    <rect x="30" y="172" width="22" height="18" rx="6" fill={color} />
    <rect x="68" y="172" width="22" height="18" rx="6" fill={color} />
    <rect x="30" y="183" width="22" height="10" rx="5" fill={color + "aa"} />
    <rect x="68" y="183" width="22" height="10" rx="5" fill={color + "aa"} />
  </>;
  return <>
    <rect x="28" y="174" width="26" height="14" rx="7" fill={color} />
    <rect x="66" y="174" width="26" height="14" rx="7" fill={color} />
    <rect x="28" y="174" width="26" height="7" rx="3" fill={color + "bb"} />
    <rect x="66" y="174" width="26" height="7" rx="3" fill={color + "bb"} />
  </>;
}

function Accessory({ type, color }: { type: string; color: string }) {
  if (type === "headset") return <>
    <path d="M28 55 Q28 20 60 20 Q92 20 92 55" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <rect x="22" y="52" width="12" height="16" rx="6" fill={color} />
    <rect x="86" y="52" width="12" height="16" rx="6" fill={color} />
  </>;
  if (type === "cap") return <>
    <ellipse cx="60" cy="30" rx="36" ry="12" fill={color} />
    <rect x="24" y="30" width="72" height="14" rx="7" fill={color} />
    <rect x="16" y="34" width="22" height="8" rx="4" fill={color} />
  </>;
  if (type === "glasses") return <>
    <rect x="38" y="59" width="18" height="12" rx="6" fill="none" stroke={color} strokeWidth="2.5" />
    <rect x="64" y="59" width="18" height="12" rx="6" fill="none" stroke={color} strokeWidth="2.5" />
    <line x1="56" y1="65" x2="64" y2="65" stroke={color} strokeWidth="2" />
    <line x1="28" y1="65" x2="38" y2="65" stroke={color} strokeWidth="2" />
    <line x1="82" y1="65" x2="92" y2="65" stroke={color} strokeWidth="2" />
  </>;
  if (type === "badge") return <>
    <rect x="50" y="110" width="20" height="14" rx="3" fill={color} />
    <rect x="53" y="113" width="14" height="3" rx="1" fill="rgba(255,255,255,0.5)" />
    <rect x="53" y="118" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
  </>;
  return null;
}

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  bobbing?: boolean;
}

export default function Avatar({ config, size = 120, bobbing = false }: AvatarProps) {
  return (
    <svg
      viewBox="0 0 120 200"
      width={size}
      height={(size * 200) / 120}
      style={bobbing ? { animation: "avatar-bob 2s ease-in-out infinite" } : undefined}
    >
      {/* Arms */}
      <rect x="10" y="112" width="20" height="44" rx="10" fill={config.clothingColor} />
      <rect x="90" y="112" width="20" height="44" rx="10" fill={config.clothingColor} />
      {/* Hands */}
      <ellipse cx="20" cy="158" rx="9" ry="7" fill={config.skinColor} />
      <ellipse cx="100" cy="158" rx="9" ry="7" fill={config.skinColor} />
      {/* Legs */}
      <rect x="36" y="168" width="18" height="24" rx="9" fill="#2d3748" />
      <rect x="66" y="168" width="18" height="24" rx="9" fill="#2d3748" />
      {/* Clothing */}
      <Clothing top={config.top} color={config.clothingColor} />
      {/* Neck */}
      <rect x="50" y="90" width="20" height="22" rx="10" fill={config.skinColor} />
      {/* Head */}
      <circle cx="60" cy="60" r="42" fill={config.skinColor} />
      {/* Hair (behind face on sides) */}
      <Hair style={config.hairStyle} color={config.hairColor} />
      {/* Face features */}
      <Eyebrows style={config.eyebrowStyle} />
      <Eyes expression={config.expression} />
      <Mouth expression={config.expression} />
      <Feature type={config.feature} skinColor={config.skinColor} />
      {/* Accessory */}
      <Accessory type={config.accessory} color={config.hairColor} />
      {/* Shoes */}
      <Shoes style={config.shoes} color={config.shoeColor} />
    </svg>
  );
}
