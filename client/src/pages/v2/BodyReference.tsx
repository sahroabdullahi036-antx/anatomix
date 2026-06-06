import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { SYSTEMS as DATA_SYSTEMS } from "@/data/medicalData";
import { ChevronRight, ArrowLeft, Search, Info, Layers as LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePalette } from "@/contexts/ThemeContext";

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

// Aligned full-body layer illustrations (one consistent style, identical pose
// per gender), auto-loaded from the layers folder. Keyed by "{gender}_{layer}".
const LAYER_MODULES = import.meta.glob(
  "../../../../attached_assets/generated_images/layers/*.png",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const LAYER_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(LAYER_MODULES).map(([p, url]) => [
    p.split("/").pop()!.replace(/\.png$/, ""),
    url,
  ]),
);

// Peel order from outermost (skin) to innermost (nerves).
const LAYER_ORDER = ["skin", "muscle", "skeleton", "organs", "circulatory", "nervous"] as const;
type LayerId = (typeof LAYER_ORDER)[number];

const LAYER_META: Record<LayerId, { label: string; color: string }> = {
  skin: { label: "Skin", color: "#d9a07a" },
  muscle: { label: "Muscle", color: "#c0504d" },
  skeleton: { label: "Skeleton", color: "#d8c8a8" },
  organs: { label: "Organs", color: "#c2746a" },
  circulatory: { label: "Vessels", color: "#e5484d" },
  nervous: { label: "Nerves", color: "#8b5cf6" },
};

// Which layer each system lives in (used to auto-peel to it on tap).
const SYSTEM_LAYER: Record<string, LayerId> = {
  integumentary: "skin",
  musculoskeletal: "muscle",
  cardiovascular: "circulatory",
  lymphatic: "circulatory",
  blood: "circulatory",
  nervous: "nervous",
  "special-senses": "nervous",
  respiratory: "organs",
  digestive: "organs",
  urinary: "organs",
  endocrine: "organs",
  reproductive: "organs",
};

// Region of the figure (percentages) to zoom into / highlight per system,
// calibrated to the male and female layer figures respectively.
type Hotspot = { id: string; x: number; y: number };

const HOTSPOTS_MALE: Hotspot[] = [
  { id: "nervous", x: 50, y: 9 },
  { id: "special-senses", x: 46, y: 11 },
  { id: "endocrine", x: 50, y: 19 },
  { id: "respiratory", x: 43, y: 27 },
  { id: "cardiovascular", x: 51, y: 28 },
  { id: "musculoskeletal", x: 33, y: 30 },
  { id: "lymphatic", x: 58, y: 35 },
  { id: "urinary", x: 45, y: 40 },
  { id: "digestive", x: 49, y: 44 },
  { id: "reproductive", x: 50, y: 50 },
  { id: "integumentary", x: 62, y: 58 },
  { id: "blood", x: 30, y: 46 },
];

const HOTSPOTS_FEMALE: Hotspot[] = [
  { id: "nervous", x: 50, y: 9 },
  { id: "special-senses", x: 46, y: 11 },
  { id: "endocrine", x: 50, y: 19 },
  { id: "respiratory", x: 44, y: 28 },
  { id: "cardiovascular", x: 51, y: 28 },
  { id: "musculoskeletal", x: 34, y: 30 },
  { id: "lymphatic", x: 57, y: 36 },
  { id: "urinary", x: 45, y: 41 },
  { id: "digestive", x: 49, y: 45 },
  { id: "reproductive", x: 50, y: 52 },
  { id: "integumentary", x: 61, y: 59 },
  { id: "blood", x: 31, y: 47 },
];

export default function BodyReference() {
  const [, setLocation] = useLocation();
  const { inverseFilter } = usePalette();
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);
  const [drillPath, setDrillPath] = useState<any[]>([]);
  // Peel depth: continuous 0..LAYER_ORDER.length-1 for smooth fading.
  const [depth, setDepth] = useState<number>(0);

  const [gender, setGender] = useState<"male" | "female">(() => {
    try { return localStorage.getItem("anatomix_body_gender") === "female" ? "female" : "male"; } catch { return "male"; }
  });

  const changeGender = (g: "male" | "female") => {
    setGender(g);
    try { localStorage.setItem("anatomix_body_gender", g); } catch {}
  };

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
    const layer = SYSTEM_LAYER[id];
    if (layer) setDepth(LAYER_ORDER.indexOf(layer));
  };

  const handleStructureClick = (struct: any) => {
    setDrillPath((prev) => [...prev, struct]);
  };

  const isDetailView = currentLevel && (!currentLevel.children || currentLevel.children.length === 0);
  const labelFor = (id: string) => {
    const s = DATA_SYSTEMS.find((x) => x.id === id);
    return s?.casualName || s?.officialName || id;
  };

  const layerSrc = (lid: string) => LAYER_IMAGES[`${gender}_${lid}`];
  // Show only the current layer; adjacent layers crossfade while dragging the
  // slider so peeling reveals one layer at a time (no full stack at once).
  const opacityFor = (i: number) => Math.max(0, 1 - Math.abs(i - depth));
  const activeLayerIndex = Math.round(depth);
  // The first available layer is the in-flow size anchor, so the figure still
  // has dimensions even if an outer layer (e.g. skin) is ever missing.
  const anchorLayer = LAYER_ORDER.find((l) => layerSrc(l));

  // Zoom: tapping a system pans its region to the figure centre and scales up
  // so it fills the view; drilling into structures zooms in progressively more.
  const zoomScale = activeHotspot ? Math.min(5, 2.6 + drillPath.length * 0.9) : 1;
  const figureTransform = activeHotspot
    ? `scale(${zoomScale}) translate(${50 - activeHotspot.x}%, ${50 - activeHotspot.y}%)`
    : "none";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-base)] text-[var(--fg-primary)] overflow-hidden">
      <header className="px-4 py-4 flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--bg-card)] shadow-sm z-30 relative">
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
                <button
                  type="button"
                  className="opacity-60 hidden md:inline cursor-pointer"
                  onClick={() => {
                    setActiveSystemId(null);
                    setDrillPath([]);
                  }}
                >
                  Explorer /
                </button>
                <button
                  type="button"
                  className="hidden md:inline"
                  style={{
                    color: SYSTEM_COLORS[activeSystem.id] || "var(--fg-primary)",
                    filter: inverseFilter,
                    cursor: drillPath.length > 0 ? "pointer" : "default",
                  }}
                  onClick={() => setDrillPath([])}
                >
                  {activeSystem.casualName || activeSystem.officialName}
                </button>
                {drillPath.map((crumb, idx) => (
                  <span key={crumb.id} className="flex items-center gap-2">
                    <span className="opacity-40">/</span>
                    <button
                      type="button"
                      disabled={idx === drillPath.length - 1}
                      className={idx === drillPath.length - 1 ? "" : "opacity-60 cursor-pointer hover:opacity-100 transition-opacity"}
                      onClick={() => setDrillPath(drillPath.slice(0, idx + 1))}
                    >
                      {crumb.casualName || crumb.officialName}
                    </button>
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
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div className="flex-1 w-full flex items-center justify-center p-4 absolute inset-0 md:relative overflow-hidden">
          <style>{`
            @keyframes hotspotPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.14); }
            }
            @keyframes ringPulse {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
              70% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
              100% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
            }
            .hotspot-dot { animation: hotspotPulse 2.2s ease-in-out infinite; }
            .highlight-ring { animation: ringPulse 1.8s ease-out infinite; }
          `}</style>

          {/* Layer peel controls */}
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-3xl p-3 shadow-xl max-h-[90%]"
            data-testid="panel-layers"
          >
            <div className="flex items-center gap-2 px-1 pb-1 text-[var(--fg-muted)]">
              <LayersIcon className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Layers</span>
            </div>
            {LAYER_ORDER.map((lid, i) => {
              const isActive = activeLayerIndex === i;
              return (
                <button
                  key={lid}
                  type="button"
                  onClick={() => setDepth(i)}
                  aria-pressed={isActive}
                  data-testid={`button-layer-${lid}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-extrabold transition-all"
                  style={{
                    background: isActive ? "var(--accent-blue)" : "var(--bg-card)",
                    color: isActive ? "#ffffff" : "var(--fg-secondary)",
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: LAYER_META[lid].color, filter: inverseFilter }}
                  />
                  {LAYER_META[lid].label}
                </button>
              );
            })}
            <input
              type="range"
              min={0}
              max={LAYER_ORDER.length - 1}
              step={0.01}
              value={depth}
              onChange={(e) => setDepth(parseFloat(e.target.value))}
              aria-label="Peel depth"
              data-testid="slider-depth"
              className="w-full mt-1 accent-[var(--accent-blue)]"
            />
          </div>

          <div
            className={`relative h-full max-h-[82vh] flex items-center justify-center transition-transform duration-500 ${
              activeHotspot ? "md:-translate-x-1/4" : ""
            }`}
          >
            <div
              className="relative inline-block h-full"
              style={{
                transform: figureTransform,
                transformOrigin: "50% 50%",
                transition: "transform 0.5s ease",
                filter: inverseFilter,
              }}
            >
              {LAYER_ORDER.map((lid, i) => {
                const src = layerSrc(lid);
                if (!src) return null;
                const base = lid === anchorLayer;
                return (
                  <img
                    key={lid}
                    src={src}
                    alt={`${gender} ${LAYER_META[lid].label} layer`}
                    className={
                      base
                        ? "relative h-full max-h-[82vh] w-auto block select-none pointer-events-none drop-shadow-2xl"
                        : "absolute inset-0 h-full w-full object-contain select-none pointer-events-none"
                    }
                    style={{
                      opacity: opacityFor(i),
                      zIndex: LAYER_ORDER.length - i,
                      transition: "opacity 0.4s ease",
                    }}
                    draggable={false}
                  />
                );
              })}

              {/* Highlight ring on the selected region */}
              {activeHotspot && (
                <span
                  className="absolute pointer-events-none"
                  style={{ left: `${activeHotspot.x}%`, top: `${activeHotspot.y}%`, zIndex: 25 }}
                >
                  <span
                    className="highlight-ring absolute block rounded-full"
                    style={{
                      width: 60,
                      height: 60,
                      border: `4px solid ${SYSTEM_COLORS[activeHotspot.id] || "#ffffff"}`,
                    }}
                  />
                </span>
              )}

              {/* Pickable system dots (only before a system is chosen) */}
              {!activeSystemId && HOTSPOTS.map((hs) => {
                const color = SYSTEM_COLORS[hs.id] || "var(--accent-blue)";
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
                    data-testid={`hotspot-${hs.id}`}
                    className="absolute z-40 flex items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-blue)]"
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
                      className="hotspot-dot"
                      style={{
                        width: isHovered ? 22 : 16,
                        height: isHovered ? 22 : 16,
                        borderRadius: "9999px",
                        background: color,
                        border: "3px solid var(--bg-surface)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                        transition: "width 0.2s, height 0.2s",
                        display: "block",
                      }}
                    />
                    {isHovered && (
                      <span
                        className="absolute whitespace-nowrap px-3 py-1.5 rounded-xl shadow-xl font-bold text-sm pointer-events-none z-50"
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

          {!activeSystemId && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-[var(--fg-muted)] bg-[var(--bg-surface)] px-4 py-2 rounded-full shadow-md hidden md:block">
              Tap a glowing spot, or peel the layers on the left
            </div>
          )}
        </div>

        <div
          className={`absolute top-0 right-0 bottom-0 w-full md:w-1/2 flex flex-col bg-[var(--bg-card)] border-l border-[var(--bg-surface)] shadow-2xl transition-transform duration-300 ${
            activeSystemId ? "translate-x-0" : "translate-x-full pointer-events-none"
          } z-20`}
        >
          {activeSystemId && activeSystem && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20 md:pb-6">
              <div>
                <h2
                  className="text-3xl font-black mb-1 tracking-tight"
                  style={{ color: SYSTEM_COLORS[activeSystem.id] || "inherit", filter: inverseFilter }}
                >
                  {currentLevel ? currentLevel.casualName || currentLevel.officialName : activeSystem.casualName || activeSystem.officialName}
                </h2>
                <p className="text-[var(--fg-secondary)] font-medium text-lg">
                  {currentLevel ? currentLevel.officialName : activeSystem.officialName}
                </p>
              </div>

              {!isDetailView ? (
                <div className="space-y-4">
                  <div className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
                    {drillPath.length === 0 ? "Major Structures" : `Parts of ${currentLevel?.casualName || currentLevel?.officialName}`}
                  </div>

                  <div className="grid gap-3">
                    {listData.map((item: any) => (
                      <button
                        type="button"
                        key={item.id}
                        className="w-full text-left bg-[var(--bg-surface)] p-4 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group"
                        onClick={() => handleStructureClick(item)}
                        data-testid={`row-structure-${item.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ background: SYSTEM_COLORS[activeSystem.id], filter: inverseFilter }}
                          />
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
                      </button>
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
