interface Props {
  src?: string | null;
  name: string;
  size?: number;
}

export default function ProfilePic({ src, name, size = 48 }: Props) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div
      data-testid={`pfp-${name}`}
      style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden",
        flexShrink: 0, backgroundColor: "#4a6080",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid rgba(255,255,255,0.18)", boxSizing: "border-box",
      }}
    >
      {src
        ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ color: "#fcfaf7", fontWeight: 800, fontSize: Math.round(size * 0.42), fontFamily: "inherit" }}>{initial}</span>}
    </div>
  );
}
