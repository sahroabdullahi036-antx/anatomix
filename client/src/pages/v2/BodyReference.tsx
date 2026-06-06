import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { SYSTEMS as DATA_SYSTEMS } from "@/data/medicalData";
import { ChevronRight, ArrowLeft, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

import bodyImg from "@assets/generated_images/systems/_body.png";
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

const SYSTEM_COLORS: Record<string, string> = {
  "cardiovascular": "var(--accent-coral)",
  "respiratory": "var(--accent-blue)",
  "digestive": "var(--accent-amber)",
  "nervous": "var(--accent-violet)",
  "musculoskeletal": "var(--fg-secondary)",
  "urinary": "var(--accent-teal)",
  "endocrine": "var(--accent-rose)",
  "integumentary": "var(--fg-muted)",
  "lymphatic": "#20c997",
  "reproductive": "#e83e8c",
  "blood": "#c0392b",
  "special-senses": "#fd7e14",
};

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

// Hotspot positions as percentages over the body illustration (_body.png),
// placed over the relevant region of the figure. Spaced so each is easy to tap.
const HOTSPOTS: { id: string; x: number; y: number }[] = [
  { id: "nervous", x: 50, y: 17 },
  { id: "special-senses", x: 44, y: 25 },
  { id: "endocrine", x: 52, y: 31 },
  { id: "respiratory", x: 58, y: 39 },
  { id: "cardiovascular", x: 46, y: 41 },
  { id: "musculoskeletal", x: 26, y: 39 },
  { id: "lymphatic", x: 16, y: 49 },
  { id: "urinary", x: 40, y: 48 },
  { id: "digestive", x: 53, y: 56 },
  { id: "reproductive", x: 50, y: 64 },
  { id: "integumentary", x: 84, y: 57 },
  { id: "blood", x: 62, y: 73 },
];

export default function BodyReference() {
  const [, setLocation] = useLocation();
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);

  const [drillPath, setDrillPath] = useState<any[]>([]);

  const activeSystem = useMemo(() => {
    return DATA_SYSTEMS.find((s) => s.id === activeSystemId);
  }, [activeSystemId]);

  const currentLevel = drillPath.length > 0 ? drillPath[drillPath.length - 1] : null;
  const listData = currentLevel ? currentLevel.children || [] : activeSystem ? activeSystem.structures : [];

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

        {!activeSystemId && (
          <div className="text-sm font-bold text-[var(--fg-muted)] hidden sm:block">
            Tap a glowing spot on the body
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div
          className={`flex-1 flex items-center justify-center p-4 transition-all duration-500 ${
            activeSystemId ? "md:w-1/2 opacity-30 md:opacity-100 scale-95 md:scale-100" : "w-full scale-100"
          } absolute inset-0 md:relative`}
        >
          <style>{`
            @keyframes hotspotPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 var(--hs-color); }
              50% { transform: translate(-50%, -50%) scale(1.12); box-shadow: 0 0 0 8px transparent; }
            }
            .hotspot-dot { animation: hotspotPulse 2.2s ease-in-out infinite; }
          `}</style>

          <div className="relative h-full max-h-[82vh] flex items-center justify-center">
            <div className="relative inline-block h-full">
              <img
                src={bodyImg}
                alt="Cartoon human body with internal organs"
                className="h-full max-h-[82vh] w-auto object-contain drop-shadow-2xl select-none pointer-events-none"
                draggable={false}
              />

              {HOTSPOTS.map((hs) => {
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
          className={`w-full md:w-1/2 h-full flex flex-col bg-[var(--bg-card)] border-l border-[var(--bg-surface)] shadow-2xl transition-all duration-300 ${
            activeSystemId
              ? "translate-x-0"
              : "translate-x-full md:translate-x-0 md:opacity-0 pointer-events-none absolute right-0"
          } z-20`}
        >
          {activeSystemId && activeSystem && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20 md:pb-6">
              <div className="flex items-center gap-4">
                {SYSTEM_IMAGES[activeSystem.id] && (
                  <img
                    src={SYSTEM_IMAGES[activeSystem.id]}
                    alt={activeSystem.officialName}
                    className="w-20 h-20 object-contain shrink-0 drop-shadow-md"
                    draggable={false}
                  />
                )}
                <div>
                  <h2 className="text-3xl font-black mb-1 tracking-tight" style={{ color: SYSTEM_COLORS[activeSystem.id] || "inherit" }}>
                    {activeSystem.casualName || activeSystem.officialName}
                  </h2>
                  <p className="text-[var(--fg-secondary)] font-medium text-lg">{activeSystem.officialName}</p>
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
                        <div>
                          <div className="font-extrabold text-lg text-[var(--fg-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                            {item.casualName || item.officialName}
                          </div>
                          <div className="text-sm text-[var(--fg-muted)] font-medium mt-1">{item.officialName}</div>
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
