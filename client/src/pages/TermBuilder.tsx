import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useTerms } from "@/hooks/useTerms";

export default function TermBuilder() {
  const { allTerms } = useTerms();
  const [current, setCurrent] = useState<any>(null);
  const [parts, setParts] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    nextTerm();
  }, [allTerms.length]);

  const nextTerm = () => {
    if (allTerms.length > 0) {
      const term = allTerms[Math.floor(Math.random() * allTerms.length)];
      setCurrent(term);
      const termParts = term.term.split(/[-\/]/).filter((p: string) => p.length > 0);
      const shuffled = [...termParts].sort(() => Math.random() - 0.5);
      setParts(shuffled);
      setSelected([]);
    }
  };

  const handleSelect = (part: string) => {
    setSelected([...selected, part]);
    setParts(parts.filter(p => p !== part));
  };

  const handleRemove = (idx: number) => {
    const part = selected[idx];
    setParts([...parts, part]);
    setSelected(selected.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    const built = selected.join("");
    const correct = current.term.replace(/[-\/]/g, "");
    if (built === correct) {
      setScore(score + 1);
      toast.success("Correct!");
      setTimeout(nextTerm, 1000);
    } else {
      toast.error("Try again!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/game-hub">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Games
          </Button>
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Term Builder</h1>
          <div className="text-2xl font-bold text-green-600">Score: {score}</div>
        </div>
        {current && (
          <Card className="p-8 bg-white shadow-lg border-2 border-green-200 mb-8">
            <p className="text-gray-600 mb-4">Definition:</p>
            <p className="text-2xl font-bold text-gray-900 mb-8">{current.meaning}</p>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mb-6">
              <p className="text-sm text-gray-600 mb-2">Build the term:</p>
              <div className="flex flex-wrap gap-2 min-h-12 items-center">
                {selected.length === 0 ? (
                  <span className="text-gray-400">Select parts below</span>
                ) : (
                  selected.map((part, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemove(idx)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold"
                    >
                      {part} ✕
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {parts.map((part, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(part)}
                  className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50"
                >
                  {part}
                </button>
              ))}
            </div>
            <Button onClick={checkAnswer} className="w-full bg-green-600 hover:bg-green-700 text-white">Check</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
