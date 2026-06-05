import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-cyan-400 mb-4">
          Medical Knowledge Assistant
        </h1>
        
        <p className="text-lg text-blue-100 mb-2">
          This tool was made to help you study efficiently, please use this as much as you can
        </p>
        
        <p className="text-sm text-blue-300 mb-8">
          (ask the developer if you get confused)
        </p>
        
        <Button 
          onClick={() => navigate("/main-menu")}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg rounded-lg transition-all"
        >
          Get Started →
        </Button>

        <p className="text-sm text-blue-200 mt-6">
          Create an account to get started • Completely Private
        </p>
      </div>
    </div>
  );
}
