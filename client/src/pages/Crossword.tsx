import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useTerms } from "@/hooks/useTerms";

export default function Crossword() {
  const { allTerms } = useTerms();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [puzzle, setPuzzle] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    generatePuzzle();
  }, [difficulty, allTerms.length]);

  const generatePuzzle = () => {
    if (allTerms.length === 0) return;
    const count = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12;
    const studied = allTerms.filter(t => (t as any).studied);
    const selected = studied.length > 0 ? studied : allTerms.sort(() => Math.random() - 0.5).slice(0, count);
    setPuzzle(selected);
    setAnswers({});
  };

  const handleAnswer = (idx: number, val: string) => {
    setAnswers({ ...answers, [idx]: val });
  };

  const checkAnswers = () => {
    let correct = 0;
    puzzle.forEach((p, idx) => {
      if (answers[idx]?.toLowerCase() === p.term.toLowerCase()) correct++;
    });
    setScore(correct);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/game-hub">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Game Hub
          </Button>
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Crossword</h1>
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
        <Card className="p-8 bg-white shadow-lg border-2 border-purple-200 mb-8">
          <div className="space-y-4 mb-8">
            {puzzle.map((p, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="w-32">
                  <p className="text-sm text-gray-600 font-semibold">{idx + 1}. {p.meaning}</p>
                </div>
                <input
                  type="text"
                  placeholder="Answer"
                  value={answers[idx] || ""}
                  onChange={(e) => handleAnswer(idx, e.target.value)}
                  className="flex-1 p-2 border-2 border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
          <Button onClick={checkAnswers} className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-4">
            Check Answers
          </Button>
          {score > 0 && (
            <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg text-center">
              <p className="font-bold text-green-800">Score: {score}/{puzzle.length}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
