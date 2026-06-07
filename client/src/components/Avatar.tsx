import { usePalette } from "@/contexts/ThemeContext";

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
  skinColor: "#FFE0B2",
  hairColor: "#8b0000",
  clothingColor: "#5a7a5a",
  shoeColor: "#4a3b63",
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

const OUT = "#1E1E24";
const stroke = { stroke: OUT, strokeWidth: 1.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// Volume layer drawn BEHIND the head for styles that need a silhouette.
function HairBack({ style, color }: { style: string; color: string }) {
  const c = color;
  switch (style) {
    case "afro":
      return <circle cx="50" cy="26" r="22" fill={c} {...stroke} />;
    case "curls":
      return <ellipse cx="50" cy="26" rx="22" ry="20" fill={c} {...stroke} />;
    case "hijab":
      return <path d="M28,30 C26,8 74,8 72,30 C72,46 60,50 50,50 C40,50 28,46 28,30 Z" fill={c} {...stroke} />;
    case "ponytail":
      return <ellipse cx="71" cy="32" rx="5" ry="12" fill={c} {...stroke} />;
    case "buns":
      return <>
        <circle cx="32" cy="14" r="7" fill={c} {...stroke} />
        <circle cx="68" cy="14" r="7" fill={c} {...stroke} />
      </>;
    default:
      return <path d="M30,30 C26,12 74,12 70,30 C70,34 30,34 30,30 Z" fill={c} {...stroke} />;
  }
}

// Fringe / top layer drawn in FRONT of the head but behind the face.
function HairFront({ style, color }: { style: string; color: string }) {
  const c = color;
  switch (style) {
    case "afro":
      return <path d="M32,22 C34,14 66,14 68,22 C68,26 60,22 50,22 C40,22 32,26 32,22 Z" fill={c} {...stroke} />;
    case "curls":
      return <>
        <circle cx="40" cy="14" r="5" fill={c} {...stroke} />
        <circle cx="50" cy="11" r="5" fill={c} {...stroke} />
        <circle cx="60" cy="14" r="5" fill={c} {...stroke} />
      </>;
    case "ponytail":
      return <path d="M32,22 C35,13 65,13 68,22 C66,18 56,16 50,18 C44,16 34,18 32,22 Z" fill={c} {...stroke} />;
    case "buns":
      return <path d="M33,20 C36,12 64,12 67,20 C65,17 35,17 33,20 Z" fill={c} {...stroke} />;
    case "twists":
    case "dreads":
      return <>
        <path d="M32,20 C34,12 66,12 68,20 Z" fill={c} {...stroke} />
        {[34, 43, 52, 61].map(x => <rect key={x} x={x} y="16" width="4" height="16" rx="2" fill={c} {...stroke} />)}
      </>;
    case "braids":
    case "cornrows":
      return <>
        <path d="M33,19 C36,12 64,12 67,19 Z" fill={c} {...stroke} />
        {[35, 42, 49, 56, 63].map(x => <rect key={x} x={x} y="15" width="3" height="18" rx="1.5" fill={c} {...stroke} />)}
      </>;
    case "fade":
    case "buzz":
      return <path d="M34,23 C34,13 66,13 66,23 Z" fill={c} {...stroke} />;
    case "waves":
      return <>
        <path d="M33,22 C33,12 67,12 67,22 Z" fill={c} {...stroke} />
        <path d="M35,19 Q42,15 50,19 Q58,23 65,19" fill="none" stroke={OUT} strokeWidth="1" />
      </>;
    case "hijab":
      return null;
    default: // bob = fluffy
      return <path d="M32,21 C35,11 65,11 68,21 C70,27 62,24 58,22 C53,20 47,26 42,22 C38,20 30,25 32,21 Z" fill={c} {...stroke} />;
  }
}

function Eyebrows({ style }: { style: string }) {
  const y = style === "raised" ? 19.5 : style === "flat" ? 22 : 21;
  const lift = style === "raised" ? 1 : 0;
  return <>
    <path d={`M40,${y} L46,${y - lift}`} stroke={OUT} strokeWidth="1.5" strokeLinecap="round" />
    <path d={`M54,${y - lift} L60,${y}`} stroke={OUT} strokeWidth="1.5" strokeLinecap="round" />
  </>;
}

function Eyes({ expression }: { expression: string }) {
  if (expression === "happy") return <>
    <path d="M40,27 Q43,24 46,27" fill="none" stroke={OUT} strokeWidth="2" strokeLinecap="round" />
    <path d="M54,27 Q57,24 60,27" fill="none" stroke={OUT} strokeWidth="2" strokeLinecap="round" />
  </>;
  if (expression === "wink") return <>
    <circle cx="43" cy="26" r="2.3" fill={OUT} />
    <path d="M54,27 Q57,24 60,27" fill="none" stroke={OUT} strokeWidth="2" strokeLinecap="round" />
  </>;
  if (expression === "focused" || expression === "reading") return <>
    <path d="M40,26 L46,26" stroke={OUT} strokeWidth="2" strokeLinecap="round" />
    <path d="M54,26 L60,26" stroke={OUT} strokeWidth="2" strokeLinecap="round" />
  </>;
  return <>
    <circle cx="43" cy="26" r="2.4" fill={OUT} />
    <circle cx="57" cy="26" r="2.4" fill={OUT} />
    <circle cx="44" cy="25.1" r="0.7" fill="#fff" />
    <circle cx="58" cy="25.1" r="0.7" fill="#fff" />
  </>;
}

function Mouth({ expression }: { expression: string }) {
  if (expression === "happy" || expression === "wink") return <path d="M44,34 Q50,39 56,34" fill="none" stroke={OUT} strokeWidth="1.8" strokeLinecap="round" />;
  if (expression === "focused") return <path d="M45,35 L55,35" stroke={OUT} strokeWidth="1.8" strokeLinecap="round" />;
  return <path d="M45,34 Q50,37 55,34" fill="none" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" />;
}

function Feature({ type }: { type: string }) {
  if (type === "freckles") return <>
    {[[40, 31], [42, 32.5], [58, 31], [60, 32.5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.75" fill="#8B4513" opacity="0.6" />)}
  </>;
  if (type === "mole") return <circle cx="58" cy="35.5" r="1" fill="rgba(0,0,0,0.35)" />;
  if (type === "dimples") return <>
    <circle cx="42" cy="35" r="1.2" fill="rgba(0,0,0,0.1)" />
    <circle cx="58" cy="35" r="1.2" fill="rgba(0,0,0,0.1)" />
  </>;
  if (type === "bridge") return <path d="M50,28 L50,31" stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" strokeLinecap="round" />;
  return null;
}

function Torso({ top, color }: { top: string; color: string }) {
  const dark = color + "cc";
  const base = "M30,55 C30,48 40,46 50,46 C60,46 70,48 70,55 L70,81 C70,83 68,85 65,85 L35,85 C32,85 30,83 30,81 Z";
  return <>
    <path d={base} fill={color} {...stroke} />
    {top === "vneck" && <path d="M42,46 L50,54 L58,46" fill="none" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
    {top === "jacket" && <>
      <line x1="50" y1="47" x2="50" y2="85" stroke={OUT} strokeWidth="1.4" />
      <path d="M44,47 L50,53 L41,57 Z" fill={dark} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
      <path d="M56,47 L50,53 L59,57 Z" fill={dark} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
    </>}
    {top === "vest" && <>
      <path d="M40,48 L40,84 L60,84 L60,48 L50,54 Z" fill={dark} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
      <circle cx="50" cy="64" r="1.2" fill="rgba(255,255,255,0.4)" />
      <circle cx="50" cy="72" r="1.2" fill="rgba(255,255,255,0.4)" />
    </>}
    {top === "tunic" && <>
      <circle cx="50" cy="58" r="1.4" fill="rgba(255,255,255,0.35)" />
      <circle cx="50" cy="66" r="1.4" fill="rgba(255,255,255,0.35)" />
      <circle cx="50" cy="74" r="1.4" fill="rgba(255,255,255,0.35)" />
    </>}
    {top === "cardigan" && <>
      <path d="M50,47 L43,85" stroke={dark} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50,47 L57,85" stroke={dark} strokeWidth="2.5" strokeLinecap="round" />
    </>}
    {top === "dustcoat" && <>
      <line x1="50" y1="47" x2="50" y2="85" stroke={OUT} strokeWidth="1.4" />
      <path d="M30,55 C30,51 33,49 38,48 L38,85 L35,85 C32,85 30,83 30,81 Z" fill={dark} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
      <path d="M70,55 C70,51 67,49 62,48 L62,85 L65,85 C68,85 70,83 70,81 Z" fill={dark} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
    </>}
  </>;
}

function Shoes({ style, color }: { style: string; color: string }) {
  if (style === "clogs") return <>
    <path d="M33,85 L31,92 C31,94 41,94 42,92 L42,85 Z" fill={color} {...stroke} />
    <path d="M58,85 L58,92 C59,94 69,94 69,92 L67,85 Z" fill={color} {...stroke} />
  </>;
  return <>
    <path d="M33,85 L30,92 C30,94.5 34,95 38,93 L42,85 Z" fill={color} {...stroke} />
    <path d="M58,85 L58,93 C62,95 66,94.5 67,92 L67,85 Z" fill={color} {...stroke} />
    <path d="M31,92 C31,94 35,94.5 38,93" fill="none" stroke="#fff" strokeWidth="0.7" opacity="0.45" />
    <path d="M59,93 C62,94.5 66,94 67,92" fill="none" stroke="#fff" strokeWidth="0.7" opacity="0.45" />
  </>;
}

function Accessory({ type, color }: { type: string; color: string }) {
  if (type === "headset") return <>
    <path d="M33,28 Q33,10 50,10 Q67,10 67,28" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <rect x="29" y="25" width="5" height="8" rx="2.5" fill={color} stroke={OUT} strokeWidth="0.8" />
    <rect x="66" y="25" width="5" height="8" rx="2.5" fill={color} stroke={OUT} strokeWidth="0.8" />
    <path d="M34,32 Q40,40 47,38" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </>;
  if (type === "cap") return <>
    <path d="M31,18 C31,8 69,8 69,18 C60,15 40,15 31,18 Z" fill={color} stroke={OUT} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M31,18 L22,20 L33,16 Z" fill={color} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
  </>;
  if (type === "glasses") return <>
    <circle cx="43" cy="26" r="4.2" fill="none" stroke={color} strokeWidth="1.4" />
    <circle cx="57" cy="26" r="4.2" fill="none" stroke={color} strokeWidth="1.4" />
    <line x1="47.2" y1="26" x2="52.8" y2="26" stroke={color} strokeWidth="1.2" />
    <line x1="33" y1="25" x2="38.8" y2="26" stroke={color} strokeWidth="1.2" />
    <line x1="61.2" y1="26" x2="67" y2="25" stroke={color} strokeWidth="1.2" />
  </>;
  if (type === "badge") return <>
    <rect x="55" y="58" width="9" height="7" rx="1.5" fill={color} stroke={OUT} strokeWidth="0.8" />
    <line x1="57" y1="61" x2="62" y2="61" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" />
    <line x1="57" y1="63" x2="60" y2="63" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
  </>;
  return null;
}

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  bobbing?: boolean;
}

export default function Avatar({ config, size = 120, bobbing = false }: AvatarProps) {
  const { inverseFilter } = usePalette();
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{
        // Keep the avatar palette strictly independent of the global app theme filter.
        filter: inverseFilter,
        ...(bobbing ? { animation: "avatar-bob 2s ease-in-out infinite" } : {}),
      }}
    >
      {/* Hair volume behind the head */}
      <HairBack style={config.hairStyle} color={config.hairColor} />

      {/* Noodle arms (behind torso so the joint is hidden) */}
      <path d="M30,56 Q17,63 23,70" fill="none" stroke={OUT} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M70,56 Q83,63 77,70" fill="none" stroke={OUT} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M30,56 Q17,63 23,70" fill="none" stroke={config.clothingColor} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M70,56 Q83,63 77,70" fill="none" stroke={config.clothingColor} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="23" cy="70" r="3" fill={config.skinColor} stroke={OUT} strokeWidth="1.2" />
      <circle cx="77" cy="70" r="3" fill={config.skinColor} stroke={OUT} strokeWidth="1.2" />

      {/* Footwear */}
      <Shoes style={config.shoes} color={config.shoeColor} />

      {/* Torso + outfit details */}
      <Torso top={config.top} color={config.clothingColor} />

      {/* Oversized head */}
      <circle cx="50" cy="28" r="18" fill={config.skinColor} {...stroke} />

      {/* Hair fringe in front of head, behind face */}
      <HairFront style={config.hairStyle} color={config.hairColor} />

      {/* Face */}
      <Eyebrows style={config.eyebrowStyle} />
      <Eyes expression={config.expression} />
      <Feature type={config.feature} />
      <Mouth expression={config.expression} />

      {/* Accessory on top */}
      <Accessory type={config.accessory} color={config.hairColor} />
    </svg>
  );
}
