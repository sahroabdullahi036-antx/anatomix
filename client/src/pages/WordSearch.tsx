import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useTerms } from "@/hooks/useTerms";

export default function WordSearch() {
  const { allTerms } = useTerms();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [words, setWords] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);

  useEffect(() => {
    generatePuzzle();
  }, [difficulty, allTerms.length]);

  const generatePuzzle = () => {
    if (allTerms.length === 0) return;
    const count = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12;
    const studied = allTerms.filter(t => (t as any).studied);
    const terms = studied.length > 0 ? studied : allTerms;
    const selected = terms.sort(() => Math.random() - 0.5).slice(0, count).map(t => (t as any).term);
    setWords(selected);
    setFound([]);
  };

  const toggleFound = (word: string) => {
    if (found.includes(word)) {
      setFound(found.filter(w => w !== word));
    } else {
      setFound([...found, word]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/game-hub">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Game Hub
          </Button>
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Word Search</h1>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map(d => (
              <Button
                key={d}
                onClick={() => setDifficulty(d)}
                variant={difficulty === d ? "default" : "outline"}
                className="capitalize"
              >
                {d}
              </Button>
            ))}
          </div>
        </div>
        <Card className="p-8 bg-white shadow-lg border-2 border-orange-200 mb-8">
          <p className="text-gray-600 mb-6 font-semibold">Find all {words.length} words:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {words.map((word, idx) => (
              <button
                key={idx}
                onClick={() => toggleFound(word)}
                className={`p-3 rounded-lg border-2 font-semibold transition ${
                  found.includes(word)
                    ? "bg-orange-600 text-white border-orange-600 line-through"
                    : "bg-white border-orange-200 text-gray-900 hover:border-orange-600"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
          {found.length === words.length && (
            <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg text-center">
              <p className="font-bold text-green-800">🎉 Found all {words.length} words!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
