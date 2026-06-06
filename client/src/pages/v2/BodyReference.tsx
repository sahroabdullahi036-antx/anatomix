import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { SYSTEMS as DATA_SYSTEMS } from "@/data/medicalData";
import { ChevronRight, ArrowLeft, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  "special-senses": "#fd7e14",
};

type Gender = "male" | "female";

export default function BodyReference() {
  const [, setLocation] = useLocation();
  const [gender, setGender] = useState<Gender>("male");
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);
  
  const [drillPath, setDrillPath] = useState<any[]>([]);

  const activeSystem = useMemo(() => {
    return DATA_SYSTEMS.find(s => s.id === activeSystemId);
  }, [activeSystemId]);

  const currentLevel = drillPath.length > 0 ? drillPath[drillPath.length - 1] : null;
  const listData = currentLevel ? currentLevel.children || [] : (activeSystem ? activeSystem.structures : []);

  const handleBack = () => {
    if (drillPath.length > 0) {
      setDrillPath(prev => prev.slice(0, -1));
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
    setDrillPath(prev => [...prev, struct]);
  };

  const isDetailView = currentLevel && (!currentLevel.children || currentLevel.children.length === 0);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-base)] text-[var(--fg-primary)] overflow-hidden">
      <header className="px-4 py-4 flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--bg-card)] shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="btn-cartoon bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--fg-primary)]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-extrabold text-xl tracking-tight">
            {activeSystem ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-60 hidden md:inline cursor-pointer" onClick={() => { setActiveSystemId(null); setDrillPath([]); }}>
                  Explorer /
                </span>
                <span 
                  className="hidden md:inline"
                  style={{ color: SYSTEM_COLORS[activeSystem.id] || 'var(--fg-primary)', cursor: drillPath.length > 0 ? 'pointer' : 'default' }}
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
          <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-full border border-[rgba(0,0,0,0.05)] shadow-inner">
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${gender === "male" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--fg-primary)]" : "opacity-60 hover:opacity-100 text-[var(--fg-secondary)]"}`}
              onClick={() => setGender("male")}
            >
              Male
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${gender === "female" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--fg-primary)]" : "opacity-60 hover:opacity-100 text-[var(--fg-secondary)]"}`}
              onClick={() => setGender("female")}
            >
              Female
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div className={`flex-1 flex items-center justify-center p-4 transition-all duration-500 ${activeSystemId ? 'md:w-1/2 opacity-30 md:opacity-100 scale-95 md:scale-100' : 'w-full scale-100'} absolute inset-0 md:relative`}>
          <div className="relative w-full max-w-lg h-full max-h-[80vh] flex items-center justify-center">
            
            <style>{`
              @keyframes heartbeat {
                0%, 100% { transform: scale(1); }
                10%, 30% { transform: scale(1.05); }
                20% { transform: scale(0.95); }
              }
              @keyframes breathing {
                0%, 100% { transform: scaleY(1) scaleX(1); }
                50% { transform: scaleY(1.03) scaleX(1.02); }
              }
              .pulse-heart { animation: heartbeat 1.2s infinite; transform-origin: 50% 35%; }
              .breathe-lungs { animation: breathing 4s ease-in-out infinite; transform-origin: 50% 35%; }
              .system-path { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
              .system-path:hover { filter: brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.3)); transform: scale(1.01); transform-origin: center; }
              .system-inactive { opacity: 0.25; filter: grayscale(80%); pointer-events: none; }
              .system-active { opacity: 1; filter: drop-shadow(0 0 16px currentColor); transform: scale(1.08); transform-origin: center; z-index: 10; pointer-events: none; }
            `}</style>

            <svg viewBox="0 0 400 800" className="w-full h-full drop-shadow-2xl overflow-visible">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--bg-surface)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--bg-base)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="400" height="800" fill="url(#glow)" className="opacity-50" />

              {/* Musculoskeletal */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "musculoskeletal" ? 'system-inactive' : ''} ${activeSystemId === "musculoskeletal" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("musculoskeletal")}
                 onMouseEnter={() => setHoveredSystem("musculoskeletal")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["musculoskeletal"] }}
              >
                <circle cx="200" cy="80" r="45" fill="var(--fg-secondary)" stroke="var(--fg-primary)" strokeWidth="4" opacity="0.4" />
                <path d={gender === "male" ? "M150,130 C130,150 130,300 160,350 C180,380 220,380 240,350 C270,300 270,150 250,130 Z" : "M160,130 C140,160 140,300 150,350 C170,390 230,390 250,350 C260,300 260,160 240,130 Z"} fill="var(--fg-secondary)" stroke="var(--fg-primary)" strokeWidth="4" opacity="0.4" />
                <path d="M140,140 C110,160 90,250 80,320 C75,340 95,350 100,320 C110,260 130,160 140,140 Z" fill="var(--fg-secondary)" stroke="var(--fg-primary)" strokeWidth="4" opacity="0.4" />
                <path d="M260,140 C290,160 310,250 320,320 C325,340 305,350 300,320 C290,260 270,160 260,140 Z" fill="var(--fg-secondary)" stroke="var(--fg-primary)" strokeWidth="4" opacity="0.4" />
                <path d={gender === "male" ? "M165,350 C150,450 140,650 140,700 C140,720 170,720 170,700 C170,650 190,450 195,370 Z" : "M160,350 C145,450 135,650 140,700 C140,720 170,720 170,700 C170,650 190,450 195,370 Z"} fill="var(--fg-secondary)" stroke="var(--fg-primary)" strokeWidth="4" opacity="0.4" />
                <path d={gender === "male" ? "M235,350 C250,450 260,650 260,700 C260,720 230,720 230,700 C230,650 210,450 205,370 Z" : "M240,350 C255,450 265,650 260,700 C260,720 230,720 230,700 C230,650 210,450 205,370 Z"} fill="var(--fg-secondary)" stroke="var(--fg-primary)" strokeWidth="4" opacity="0.4" />
              </g>

              {/* Integumentary */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "integumentary" ? 'system-inactive' : ''} ${activeSystemId === "integumentary" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("integumentary")}
                 onMouseEnter={() => setHoveredSystem("integumentary")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["integumentary"] }}
              >
                <path d="M155,30 C180,10 220,10 245,30 C260,45 255,90 250,110 C270,120 300,140 310,180 C320,220 325,280 330,320 C332,340 310,345 305,320 C300,280 280,200 270,160 C275,220 270,300 255,350 C270,450 275,600 275,700 C275,730 240,730 235,700 C235,600 220,450 210,380 C200,450 180,600 180,700 C180,730 145,730 145,700 C145,600 150,450 165,350 C150,300 145,220 150,160 C140,200 120,280 115,320 C110,345 88,340 90,320 C95,280 100,220 110,180 C120,140 150,120 170,110 C165,90 160,45 155,30 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Nervous */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "nervous" ? 'system-inactive' : ''} ${activeSystemId === "nervous" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("nervous")}
                 onMouseEnter={() => setHoveredSystem("nervous")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["nervous"] }}
              >
                <path d="M175,60 C175,45 225,45 225,60 C235,70 230,90 200,95 C170,90 165,70 175,60 Z" fill="currentColor" />
                <path d="M200,95 L200,340" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M200,140 Q170,150 145,170 M200,140 Q230,150 255,170 M200,200 Q160,210 145,250 M200,200 Q240,210 255,250 M200,260 Q150,270 145,310 M200,260 Q250,270 255,310" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M195,340 Q170,380 160,450 T150,550 T150,680 M205,340 Q230,380 240,450 T250,550 T250,680" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="5,5" />
              </g>

              {/* Respiratory */}
              <g className={`system-path breathe-lungs ${activeSystemId && activeSystemId !== "respiratory" ? 'system-inactive' : ''} ${activeSystemId === "respiratory" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("respiratory")}
                 onMouseEnter={() => setHoveredSystem("respiratory")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["respiratory"] }}
              >
                <path d="M196,110 L196,150 M204,110 L204,150" stroke="currentColor" strokeWidth="4" />
                <path d="M196,150 Q180,160 170,170 M204,150 Q220,160 230,170" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M165,155 C140,160 145,230 155,250 C170,260 185,240 185,210 C185,180 180,165 165,155 Z" fill="currentColor" opacity="0.9" />
                <path d="M235,155 C260,160 255,230 245,250 C230,260 215,240 215,210 C215,180 220,165 235,155 Z" fill="currentColor" opacity="0.9" />
              </g>

              {/* Cardiovascular */}
              <g className={`system-path pulse-heart ${activeSystemId && activeSystemId !== "cardiovascular" ? 'system-inactive' : ''} ${activeSystemId === "cardiovascular" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("cardiovascular")}
                 onMouseEnter={() => setHoveredSystem("cardiovascular")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["cardiovascular"] }}
              >
                <path d="M200,185 C200,175 190,175 190,185 C190,195 200,205 200,205 C200,205 210,195 210,185 C210,175 200,175 200,185 Z" fill="currentColor" transform="scale(1.8) translate(-88, -80)" />
                <path d="M200,175 Q210,150 230,140 M200,175 Q190,150 170,140 M200,205 L200,320 M200,320 Q180,340 175,400 M200,320 Q220,340 225,400" stroke="currentColor" strokeWidth="3" fill="none" />
              </g>

              {/* Digestive */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "digestive" ? 'system-inactive' : ''} ${activeSystemId === "digestive" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("digestive")}
                 onMouseEnter={() => setHoveredSystem("digestive")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["digestive"] }}
              >
                <path d="M205,110 L205,210" stroke="currentColor" strokeWidth="5" />
                <path d="M205,210 C180,210 175,230 190,240 C210,250 230,225 215,215 Z" fill="currentColor" />
                <path d="M190,205 C220,200 240,215 235,235 C230,245 190,230 190,205 Z" fill="currentColor" opacity="0.9" style={{ color: '#b45309' }} />
                <path d="M175,260 C165,260 165,280 180,285 C195,290 190,305 175,305 C160,305 160,280 155,270 C155,250 245,250 245,270 C245,290 230,310 215,310 C195,310 190,290 210,280 C230,270 230,260 215,260 Z" fill="currentColor" opacity="0.8" />
                <path d="M185,270 Q195,265 200,275 T215,280 T200,295 T185,285" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
              </g>

              {/* Urinary */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "urinary" ? 'system-inactive' : ''} ${activeSystemId === "urinary" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("urinary")}
                 onMouseEnter={() => setHoveredSystem("urinary")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["urinary"] }}
              >
                <path d="M175,235 C170,225 185,225 185,240 C185,255 170,255 175,245 Z" fill="currentColor" />
                <path d="M225,235 C230,225 215,225 215,240 C215,255 230,255 225,245 Z" fill="currentColor" />
                <path d="M180,245 Q190,290 195,320 M220,245 Q210,290 205,320" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="200" cy="325" r="10" fill="currentColor" />
              </g>

              {/* Endocrine */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "endocrine" ? 'system-inactive' : ''} ${activeSystemId === "endocrine" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("endocrine")}
                 onMouseEnter={() => setHoveredSystem("endocrine")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["endocrine"] }}
              >
                <path d="M195,120 Q200,125 205,120 Q205,130 200,132 Q195,130 195,120 Z" fill="currentColor" />
                <path d="M175,220 L185,225 L180,230 Z" fill="currentColor" />
                <path d="M225,220 L215,225 L220,230 Z" fill="currentColor" />
                <rect x="195" y="240" width="15" height="5" rx="2" fill="currentColor" />
              </g>

              {/* Lymphatic */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "lymphatic" ? 'system-inactive' : ''} ${activeSystemId === "lymphatic" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("lymphatic")}
                 onMouseEnter={() => setHoveredSystem("lymphatic")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["lymphatic"] }}
              >
                <circle cx="180" cy="110" r="3" fill="currentColor" />
                <circle cx="220" cy="110" r="3" fill="currentColor" />
                <circle cx="140" cy="160" r="4" fill="currentColor" />
                <circle cx="260" cy="160" r="4" fill="currentColor" />
                <circle cx="170" cy="330" r="4" fill="currentColor" />
                <circle cx="230" cy="330" r="4" fill="currentColor" />
                <path d="M180,110 Q140,130 140,160 M220,110 Q260,130 260,160 M140,160 Q170,250 170,330 M260,160 Q230,250 230,330" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" fill="none" />
              </g>

              {/* Reproductive */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "reproductive" ? 'system-inactive' : ''} ${activeSystemId === "reproductive" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("reproductive")}
                 onMouseEnter={() => setHoveredSystem("reproductive")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["reproductive"] }}
              >
                {gender === "female" ? (
                  <>
                    <path d="M190,340 Q200,335 210,340 Q205,355 195,355 Z" fill="currentColor" />
                    <circle cx="180" cy="335" r="5" fill="currentColor" />
                    <circle cx="220" cy="335" r="5" fill="currentColor" />
                    <path d="M185,335 Q190,340 195,340 M215,335 Q210,340 205,340" stroke="currentColor" strokeWidth="2" fill="none" />
                  </>
                ) : (
                  <>
                    <path d="M195,345 L205,345 L200,365 Z" fill="currentColor" />
                    <circle cx="195" cy="365" r="6" fill="currentColor" />
                    <circle cx="205" cy="365" r="6" fill="currentColor" />
                  </>
                )}
              </g>

              {/* Special Senses */}
              <g className={`system-path ${activeSystemId && activeSystemId !== "special-senses" ? 'system-inactive' : ''} ${activeSystemId === "special-senses" ? 'system-active' : ''}`}
                 onClick={() => handleSystemClick("special-senses")}
                 onMouseEnter={() => setHoveredSystem("special-senses")}
                 onMouseLeave={() => setHoveredSystem(null)}
                 style={{ color: SYSTEM_COLORS["special-senses"] }}
              >
                <circle cx="185" cy="70" r="5" fill="currentColor" />
                <circle cx="215" cy="70" r="5" fill="currentColor" />
                <circle cx="185" cy="70" r="2" fill="var(--bg-base)" />
                <circle cx="215" cy="70" r="2" fill="var(--bg-base)" />
                <path d="M155,75 C150,70 145,85 155,90 Z" fill="currentColor" />
                <path d="M245,75 C250,70 255,85 245,90 Z" fill="currentColor" />
                <path d="M200,80 L195,85 L205,85 Z" fill="currentColor" opacity="0.6" />
              </g>

            </svg>

            {hoveredSystem && !activeSystemId && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-surface)] text-[var(--fg-primary)] px-6 py-3 rounded-2xl shadow-xl font-bold text-lg pointer-events-none border-2 border-[rgba(255,255,255,0.1)] transition-all animate-in slide-in-from-bottom-2 zoom-in-95 z-30">
                <span style={{ color: SYSTEM_COLORS[hoveredSystem] || 'inherit' }}>
                  {DATA_SYSTEMS.find(s => s.id === hoveredSystem)?.casualName || DATA_SYSTEMS.find(s => s.id === hoveredSystem)?.officialName || hoveredSystem}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={`w-full md:w-1/2 h-full flex flex-col bg-[var(--bg-card)] border-l border-[var(--bg-surface)] shadow-2xl transition-all duration-300 ${activeSystemId ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:opacity-0 pointer-events-none absolute right-0'} z-20`}>
          {activeSystemId && activeSystem && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-20 md:pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 
                    className="text-3xl font-black mb-1 tracking-tight"
                    style={{ color: SYSTEM_COLORS[activeSystem.id] || 'inherit' }}
                  >
                    {activeSystem.casualName || activeSystem.officialName}
                  </h2>
                  <p className="text-[var(--fg-secondary)] font-medium text-lg">
                    {activeSystem.officialName}
                  </p>
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
                          <div className="text-sm text-[var(--fg-muted)] font-medium mt-1">
                            {item.officialName}
                          </div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-2 rounded-full text-[var(--fg-muted)] group-hover:bg-[var(--accent-blue)] group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                    {listData.length === 0 && (
                      <div className="text-center py-8 text-[var(--fg-muted)] italic">
                        No sub-structures defined.
                      </div>
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
                    <div className="text-[var(--accent-blue)] font-bold text-lg mb-6 relative z-10">
                      {currentLevel.officialName}
                    </div>

                    {currentLevel.definition && (
                      <div className="bg-[var(--bg-base)] p-4 rounded-xl mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-[var(--fg-secondary)] font-bold">
                          <Info className="w-4 h-4" />
                          <span>Definition</span>
                        </div>
                        <p className="text-[var(--fg-primary)] leading-relaxed font-medium">
                          {currentLevel.definition}
                        </p>
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
                         setLocation(`/dictionary?q=${encodeURIComponent(currentLevel.combiningForm.replace(/-/g, ''))}`);
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
