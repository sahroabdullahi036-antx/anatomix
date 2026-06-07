import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  opacity: number;
  size: number;
}

interface BurstContextType {
  triggerBurst: (x: number, y: number) => void;
}

const BurstContext = createContext<BurstContextType>({ triggerBurst: () => {} });
export const useParticleBurst = () => useContext(BurstContext);

const COLORS = ["#a8c5f0", "#f0c5a8", "#c5f0a8", "#f0a8c5", "#c5a8f0", "#f0f0a8"];

let nextId = 0;

export function ParticleBurstProvider({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    setParticles(prev => {
      const updated = prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.18,
          opacity: p.opacity - 0.028,
        }))
        .filter(p => p.opacity > 0);
      if (updated.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
      return updated;
    });
  }, []);

  const triggerBurst = useCallback((x: number, y: number) => {
    const burst: Particle[] = Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.6;
      const speed = 3.5 + Math.random() * 2.5;
      return {
        id: nextId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 1,
        size: 6 + Math.random() * 5,
      };
    });
    setParticles(prev => [...prev, ...burst]);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <BurstContext.Provider value={{ triggerBurst }}>
      {children}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
        {particles.map(p => (
          <svg
            key={p.id}
            style={{
              position: "absolute",
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              opacity: p.opacity,
              pointerEvents: "none",
              overflow: "visible",
            }}
            width={p.size}
            height={p.size}
            viewBox="0 0 10 10"
          >
            <polygon
              points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.5 1.9,10 3.1,6.1 0,3.8 3.8,3.8"
              fill={p.color}
            />
          </svg>
        ))}
      </div>
    </BurstContext.Provider>
  );
}
