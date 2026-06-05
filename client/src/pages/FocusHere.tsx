import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Trash2, Brain, Zap, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useDataExport } from "@/hooks/useDataExport";

export default function FocusHere() {
  const [problemTerms, setProblemTerms] = useState(() => {
    const saved = localStorage.getItem("problemTerms");
    return saved ? JSON.parse(saved) : [];
  });
  const { getStats } = useFlashcards(problemTerms as any);
  const { exportData, importData } = useDataExport();
  const [mode, setMode] = useState<"flashcard" | "quiz">("flashcard");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const stats = getStats();
    const mastered = problemTerms.filter((t: any) => {
      const state = stats.termStats.find((s: any) => s.id === t.id);
      return state && state.masteryPercentage >= 80;
    });
    if (mastered.length > 0) {
      const updated = problemTerms.filter((t: any) => !mastered.find((m: any) => m.id === t.id));
      setProblemTerms(updated);
      localStorage.setItem("problemTerms", JSON.stringify(updated));
      toast.success(`${mastered.length} term(s) mastered! Removed from Focus Here.`);
    }
  }, []);

  const saveProblems = (updated: any[]) => {
    setProblemTerms(updated);
    localStorage.setItem("problemTerms", JSON.stringify(updated));
  };

  const removeProblem = (id: string) => {
    saveProblems(problemTerms.filter((t: any) => t.id !== id));
    toast.success("Removed from Focus Here");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      toast.success("Data imported! Refresh to see changes.");
      window.location.reload();
    } catch (err) {
      toast.error("Import failed");
    }
  };

  const current = problemTerms[cardIndex];

  if (problemTerms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/main-menu">
            <Button variant="outline" className="mb-8 flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <Card className="p-12 bg-white shadow-lg border-2 border-red-200 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Focus Here</h1>
            <p className="text-gray-600 text-lg mb-6">All of your problem parts are stored here for extra practice</p>
            <p className="text-gray-500">No problem terms yet. Mark terms as difficult in Flashcards to add them here!</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Focus Here</h1>
            <p className="text-gray-600">All of your problem parts are stored here for extra practice</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportData} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer">
              <Upload className="w-4 h-4" /> Import
              <input type="file" onChange={handleImport} className="hidden" accept=".json" />
            </label>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => setMode("flashcard")}
            className={mode === "flashcard" ? "bg-red-600 text-white" : "bg-gray-200"}
          >
            <Brain className="w-4 h-4 mr-2" /> Flashcards
          </Button>
          <Button 
            onClick={() => setMode("quiz")}
            className={mode === "quiz" ? "bg-red-600 text-white" : "bg-gray-200"}
          >
            <Zap className="w-4 h-4 mr-2" /> Quiz
          </Button>
        </div>

        {mode === "flashcard" && current && (
          <Card className="p-12 bg-white shadow-lg border-2 border-red-200 mb-8 cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <p className="text-red-600 font-semibold mb-4 text-center">Click to flip</p>
            <div className="text-center">
              {!flipped ? (
                <>
                  <p className="text-5xl font-bold text-gray-900">{current.term}</p>
                  <p className="text-gray-600 mt-2">{current.category}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl text-gray-700 mb-4">{current.meaning}</p>
                  <p className="text-gray-600 italic">{current.phonetic}</p>
                </>
              )}
            </div>
          </Card>
        )}

        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => setCardIndex(Math.max(0, cardIndex - 1))}
            disabled={cardIndex === 0}
            className="flex-1"
          >
            ← Previous
          </Button>
          <span className="flex items-center px-4 text-gray-600">{cardIndex + 1} of {problemTerms.length}</span>
          <Button 
            onClick={() => setCardIndex(Math.min(problemTerms.length - 1, cardIndex + 1))}
            disabled={cardIndex === problemTerms.length - 1}
            className="flex-1"
          >
            Next →
          </Button>
        </div>

        <Card className="p-6 bg-white shadow-lg border-2 border-red-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Problem Terms ({problemTerms.length})</h3>
          <div className="space-y-2">
            {problemTerms.map((term: any, idx: number) => (
              <div key={term.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <button onClick={() => setCardIndex(idx)} className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{term.term}</p>
                  <p className="text-sm text-gray-600">{term.meaning}</p>
                </button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeProblem(term.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
