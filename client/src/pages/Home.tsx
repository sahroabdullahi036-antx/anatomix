import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "#c85a54" }}>
            <span className="text-4xl">🫀</span>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: "#3d2817" }}>
          AnatomiX
        </h1>
        
        <p className="text-lg mb-2" style={{ color: "#5d4037" }}>
          Pathway to Success
        </p>
        
        <Button 
          onClick={() => navigate("/main-menu")}
          className="text-white px-8 py-6 text-lg rounded-lg transition-all font-semibold mt-6 mb-8"
          style={{ backgroundColor: "#9d3d35" }}
        >
          Get Started →
        </Button>

        <p className="text-sm font-semibold" style={{ color: "#5d4037" }}>
          Create an account • Completely Private
        </p>
      </div>
    </div>
  );
}
// Force rebuild
