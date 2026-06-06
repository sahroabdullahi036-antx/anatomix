import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { SYSTEMS as DATA_SYSTEMS } from "@/data/medicalData";
import { ChevronRight, ArrowLeft, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePalette } from "@/contexts/ThemeContext";

import bodyMale from "@assets/generated_images/systems/_body_male.png";
import bodyFemale from "@assets/generated_images/systems/_body_female.png";
import imgDigestive from "@assets/generated_images/systems/digestive.png";
import imgCardiovascular from "@assets/generated_images/systems/cardiovascular.png";
import imgRespiratory from "@assets/generated_images/systems/respiratory.png";
import imgNervous from "@assets/generated_images/systems/nervous.png";
import imgMusculoskeletal from "@assets/generated_images/systems/musculoskeletal.png";
import imgUrinary from "@assets/generated_images/systems/urinary.png";
import imgEndocrine from "@assets/generated_images/systems/endocrine.png";
import imgIntegumentary from "@assets/generated_images/systems/integumentary.png";
import imgLymphatic from "@assets/generated_images/systems/lymphatic.png";
import imgReproductive from "@assets/generated_images/systems/reproductive.png";
import imgBlood from "@assets/generated_images/systems/blood.png";
import imgSpecialSenses from "@assets/generated_images/systems/special-senses.png";

// Fixed per-system colors. These are intentionally hard-coded hex (not theme
// vars) and rendered with an inverse palette filter so the system colors stay
// identical no matter which palette / light mode the user picks.
const SYSTEM_COLORS: Record<string, string> = {
  "cardiovascular": "#e5484d",
  "respiratory": "#3b82c4",
  "digestive": "#d08a3a",
  "nervous": "#8b5cf6",
  "musculoskeletal": "#b8a888",
  "urinary": "#2bb3a3",
  "endocrine": "#d6649b",
  "integumentary": "#d9a07a",
  "lymphatic": "#3fb27f",
  "reproductive": "#c2407a",
  "blood": "#b3261e",
  "special-senses": "#ef7a23",
};

// Per-part detailed images, auto-loaded from the parts folder as they are
// generated. Keyed by structure id (filename without extension). Missing images
// gracefully fall back to the parent system image at render time.
const PART_IMAGE_MODULES = import.meta.glob(
  "../../../../attached_assets/generated_images/parts/*.png",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const PART_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(PART_IMAGE_MODULES).map(([p, url]) => [
    p.split("/").pop()!.replace(/\.png$/, ""),
    url,
  ]),
);

const SYSTEM_IMAGES: Record<string, string> = {
  "digestive": imgDigestive,
  "cardiovascular": imgCardiovascular,
  "respiratory": imgRespiratory,
  "nervous": imgNervous,
  "musculoskeletal": imgMusculoskeletal,
  "urinary": imgUrinary,
  "endocrine": imgEndocrine,
  "integumentary": imgIntegumentary,
  "lymphatic": imgLymphatic,
  "reproductive": imgReproductive,
  "blood": imgBlood,
  "special-senses": imgSpecialSenses,
};

// Hotspot positions as percentages over each body illustration, calibrated to
// the organ locations in the male and female figures respectively.
type Hotspot = { id: string; x: number; y: number };

const HOTSPOTS_MALE: Hotspot[] = [
  { id: "nervous", x: 50, y: 9 },
  { id: "special-senses", x: 46, y: 12 },
  { id: "endocrine", x: 50, y: 20 },
  { id: "respiratory", x: 43, y: 26 },
  { id: "cardiovascular", x: 51, y: 28 },
  { id: "musculoskeletal", x: 32, y: 27 },
  { id: "lymphatic", x: 59, y: 36 },
  { id: "urinary", x: 44, y: 35 },
  { id: "digestive", x: 48, y: 44 },
  { id: "reproductive", x: 50, y: 53 },
  { id: "integumentary", x: 61, y: 60 },
  { id: "blood", x: 30, y: 47 },
];

const HOTSPOTS_FEMALE: Hotspot[] = [
  { id: "nervous", x: 50, y: 10 },
  { id: "special-senses", x: 47, y: 13 },
  { id: "endocrine", x: 50, y: 20 },
  { id: "respiratory", x: 44, y: 27 },
  { id: "cardiovascular", x: 51, y: 28 },
  { id: "musculoskeletal", x: 33, y: 27 },
  { id: "lymphatic", x: 58, y: 37 },
  { id: "urinary", x: 44, y: 37 },
  { id: "digestive", x: 48, y: 45 },
  { id: "reproductive", x: 50, y: 55 },
  { id: "integumentary", x: 60, y: 62 },
  { id: "blood", x: 32, y: 48 },
];

export default function BodyReference() {
  const [, setLocation] = useLocation();
  const { inverseFilter } = usePalette();
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);

  const [drillPath, setDrillPath] = useState<any[]>([]);
  const [gender, setGender] = useState<"male" | "female">(() => {
    try { return localStorage.getItem("anatomix_body_gender") === "female" ? "female" : "male"; } catch { return "male"; }
  });

  const changeGender = (g: "male" | "female") => {
    setGender(g);
    try { localStorage.setItem("anatomix_body_gender", g); } catch {}
  };

  const bodyImg = gender === "male" ? bodyMale : bodyFemale;
  const HOTSPOTS = gender === "male" ? HOTSPOTS_MALE : HOTSPOTS_FEMALE;
  const activeHotspot = activeSystemId ? HOTSPOTS.find((h) => h.id === activeSystemId) ?? null : null;

  const activeSystem = useMemo(() => {
    return DATA_SYSTEMS.find((s) => s.id === activeSystemId);
  }, [activeSystemId]);

  const currentLevel = drillPath.length > 0 ? drillPath[drillPath.length - 1] : null;
  const rawList = currentLevel ? currentLevel.children || [] : activeSystem ? activeSystem.structures : [];
  const listData =
    activeSystem?.id === "reproductive" && !currentLevel
      ? rawList.filter((s: any) =>
          (gender === "male" ? ["testes", "prostate"] : ["ovaries", "uterus", "vagina"]).includes(s.id),
        )
      : rawList;

  const systemImage = activeSystem ? SYSTEM_IMAGES[activeSystem.id] : undefined;
  const headerImage = currentLevel ? PART_IMAGES[currentLevel.id] || systemImage : systemImage;
  const headerOfficial = currentLevel ? currentLevel.officialName : activeSystem?.officialName;
  const headerCasual = currentLevel
    ? currentLevel.casualName || currentLevel.officialName
    : activeSystem?.casualName || activeSystem?.officialName;

  const handleBack = () => {
    if (drillPath.length > 0) {
      setDrillPath((prev) => prev.slice(0, -1));
    } else if (activeSystemId) {
      setActiveSystemId(null);
    } else {
      setLocation("/");
    }
  };

  const handleSystemClick = (id: string) => {
    setActiveSystemId(id);
    setDrillPath([]);
  };

  const handleStructureClick = (struct: any) => {
    setDrillPath((prev) => [...prev, struct]);
  };

  const isDetailView = currentLevel && (!currentLevel.children || currentLevel.children.length === 0);
  const labelFor = (id: string) => {
    const s = DATA_SYSTEMS.find((x) => x.id === id);
    return s?.casualName || s?.officialName || id;
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-base)] text-[var(--fg-primary)] overflow-hidden">
      <header className="px-4 py-4 flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--bg-card)] shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="btn-cartoon bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--fg-primary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-extrabold text-xl tracking-tight">
            {activeSystem ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="opacity-60 hidden md:inline cursor-pointer"
                  onClick={() => {
                    setActiveSystemId(null);
                    setDrillPath([]);
                  }}
                >
                  Explorer /
                </span>
                <span
                  className="hidden md:inline"
                  style={{
                    color: SYSTEM_COLORS[activeSystem.id] || "var(--fg-primary)",
                    filter: inverseFilter,
                    cursor: drillPath.length > 0 ? "pointer" : "default",
                  }}
                  onClick={() => setDrillPath([])}
                >
                  {activeSystem.casualName || activeSystem.officialName}
                </span>
                {drillPath.map((crumb, idx) => (
                  <span key={crumb.id} className="flex items-center gap-2">
                    <span className="opacity-40">/</span>
                    <span
                      className={idx === drillPath.length - 1 ? "" : "opacity-60 cursor-pointer hover:opacity-100 transition-opacity"}
                      onClick={() => setDrillPath(drillPath.slice(0, idx + 1))}
                    >
                      {crumb.casualName || crumb.officialName}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              "Body Explorer"
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full p-1 bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)]" role="group" aria-label="Body figure">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => changeGender(g)}
                aria-pressed={gender === g}
                className="px-4 py-1.5 rounded-full text-sm font-extrabold transition-colors"
                style={{
                  background: gender === g ? "var(--accent-blue)" : "transparent",
                  color: gender === g ? "#ffffff" : "var(--fg-muted)",
                }}
                data-testid={`button-gender-${g}`}
              >
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
          {!activeSystemId && (
            <div className="text-sm font-bold text-[var(--fg-muted)] hidden lg:block">
              Tap a glowing spot
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div className="flex-1 w-full flex items-center justify-center p-4 absolute inset-0 md:relative overflow-hidden">
          <style>{`
            @keyframes hotspotPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 var(--hs-color); }
              50% { transform: translate(-50%, -50%) scale(1.12); box-shadow: 0 0 0 8px transparent; }
            }
            .hotspot-dot { animation: hotspotPulse 2.2s ease-in-out infinite; }
          `}</style>

          <div className="relative h-full max-h-[82vh] flex items-center justify-center">
            <div
              className="relative inline-block h-full"
              style={{
                transform: activeHotspot ? "scale(1.85)" : "scale(1)",
                transformOrigin: activeHotspot ? `${activeHotspot.x}% ${activeHotspot.y}%` : "center center",
                transition: "transform 0.5s ease",
                filter: inverseFilter,
              }}
            >
              <img
                src={bodyImg}
                alt="Human body reference with internal organs"
                className="h-full max-h-[82vh] w-auto object-contain drop-shadow-2xl select-none pointer-events-none"
                draggable={false}
              />

              {!activeSystemId && HOTSPOTS.map((hs) => {
                const color = SYSTEM_COLORS[hs.id] || "var(--accent-blue)";
                const isActive = activeSystemId === hs.id;
                const isHovered = hoveredSystem === hs.id;
                return (
                  <button
                    key={hs.id}
                    type="button"
                    aria-label={labelFor(hs.id)}
                    onClick={() => handleSystemClick(hs.id)}
                    onMouseEnter={() => setHoveredSystem(hs.id)}
                    onMouseLeave={() => setHoveredSystem(null)}
                    onFocus={() => setHoveredSystem(hs.id)}
                    onBlur={() => setHoveredSystem(null)}
                    className="absolute z-20 flex items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-blue)]"
                    style={{
                      left: `${hs.x}%`,
                      top: `${hs.y}%`,
                      width: 40,
                      height: 40,
                      transform: "translate(-50%, -50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <span
                      className={isActive ? "" : "hotspot-dot"}
                      style={
                        {
                          ["--hs-color" as any]: color,
                          width: isActive || isHovered ? 22 : 16,
                          height: isActive || isHovered ? 22 : 16,
                          borderRadius: "9999px",
                          background: color,
                          border: "3px solid var(--bg-surface)",
                          boxShadow: `0 2px 8px rgba(0,0,0,0.25)`,
                          transition: "width 0.2s, height 0.2s",
                          display: "block",
                        } as React.CSSProperties
                      }
                    />
                    {isHovered && !activeSystemId && (
                      <span
                        className="absolute whitespace-nowrap px-3 py-1.5 rounded-xl shadow-xl font-bold text-sm pointer-events-none z-30"
                        style={{
                          bottom: "calc(100% + 6px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--bg-surface)",
                          color,
                          border: "2px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        {labelFor(hs.id)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`absolute top-0 right-0 bottom-0 w-full md:w-1/2 flex flex-col bg-[var(--bg-card)] border-l border-[var(--bg-surface)] shadow-2xl transition-transform duration-300 ${
            activeSystemId ? "translate-x-0" : "translate-x-full pointer-events-none"
          } z-20`}
        >
          {activeSystemId && activeSystem && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20 md:pb-6">
              <div className="space-y-4">
                {headerImage && (
                  <div className="w-full rounded-3xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] p-4 flex items-center justify-center">
                    <img
                      src={headerImage}
                      alt={headerOfficial || ""}
                      className="h-44 w-auto object-contain drop-shadow-md"
                      style={{ filter: inverseFilter }}
                      draggable={false}
                    />
                  </div>
                )}
                <div>
                  <h2
                    className="text-3xl font-black mb-1 tracking-tight"
                    style={{ color: SYSTEM_COLORS[activeSystem.id] || "inherit", filter: inverseFilter }}
                  >
                    {headerCasual}
                  </h2>
                  <p className="text-[var(--fg-secondary)] font-medium text-lg">{headerOfficial}</p>
                </div>
              </div>

              {!isDetailView ? (
                <div className="space-y-4">
                  <div className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
                    {drillPath.length === 0 ? "Major Structures" : `Parts of ${currentLevel?.casualName || currentLevel?.officialName}`}
                  </div>

                  <div className="grid gap-3">
                    {listData.map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group"
                        onClick={() => handleStructureClick(item)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] flex items-center justify-center overflow-hidden shrink-0">
                            {PART_IMAGES[item.id] ? (
                              <img
                                src={PART_IMAGES[item.id]}
                                alt={item.officialName}
                                className="w-full h-full object-contain"
                                style={{ filter: inverseFilter }}
                                draggable={false}
                              />
                            ) : (
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ background: SYSTEM_COLORS[activeSystem.id], filter: inverseFilter }}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-lg text-[var(--fg-primary)] group-hover:text-[var(--accent-blue)] transition-colors truncate">
                              {item.casualName || item.officialName}
                            </div>
                            <div className="text-sm text-[var(--fg-muted)] font-medium mt-1 truncate">{item.officialName}</div>
                          </div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-2 rounded-full text-[var(--fg-muted)] group-hover:bg-[var(--accent-blue)] group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                    {listData.length === 0 && (
                      <div className="text-center py-8 text-[var(--fg-muted)] italic">No sub-structures defined.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[rgba(255,255,255,0.05)] shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-blue)] opacity-10 rounded-full blur-3xl"></div>

                    <h3 className="text-2xl font-black text-[var(--fg-primary)] mb-2 relative z-10">
                      {currentLevel.casualName || currentLevel.officialName}
                    </h3>
                    <div className="text-[var(--accent-blue)] font-bold text-lg mb-6 relative z-10">{currentLevel.officialName}</div>

                    {currentLevel.definition && (
                      <div className="bg-[var(--bg-base)] p-4 rounded-xl mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-[var(--fg-secondary)] font-bold">
                          <Info className="w-4 h-4" />
                          <span>Definition</span>
                        </div>
                        <p className="text-[var(--fg-primary)] leading-relaxed font-medium">{currentLevel.definition}</p>
                      </div>
                    )}

                    {currentLevel.combiningForm && (
                      <div className="flex items-center justify-between bg-[var(--bg-base)] p-4 rounded-xl border-l-4 border-[var(--accent-violet)] relative z-10">
                        <div>
                          <div className="text-sm text-[var(--fg-muted)] font-bold mb-1">Combining Form</div>
                          <div className="text-xl font-black text-[var(--fg-primary)] font-mono bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded inline-block">
                            {currentLevel.combiningForm}
                          </div>
                        </div>
                        <div className="opacity-20">
                          <Search className="w-10 h-10" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full btn-cartoon bg-[var(--bg-surface)] text-[var(--fg-secondary)] py-6 text-lg hover:bg-[var(--bg-base)] hover:text-[var(--fg-primary)] border-2"
                    onClick={() => {
                      if (currentLevel.combiningForm) {
                        setLocation(`/dictionary?q=${encodeURIComponent(currentLevel.combiningForm.replace(/-/g, ""))}`);
                      } else {
                        setLocation(`/dictionary?q=${encodeURIComponent(currentLevel.officialName)}`);
                      }
                    }}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Look up in Dictionary
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
