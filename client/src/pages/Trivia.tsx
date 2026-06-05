import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useTerms } from "@/hooks/useTerms";

export default function Trivia() {
  const { allTerms } = useTerms();
  const [current, setCurrent] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    nextQuestion();
  }, [allTerms.length]);

  const nextQuestion = () => {
    if (allTerms.length > 0) {
      const term = allTerms[Math.floor(Math.random() * allTerms.length)];
      setCurrent(term);
      const wrong = allTerms.filter(t => t.id !== term.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [term, ...wrong].sort(() => Math.random() - 0.5);
      setOptions(opts);
      setFeedback("");
    }
  };

  const handleAnswer = (selected: any) => {
    const correct = selected.id === current.id;
    setAnswered(answered + 1);
    if (correct) {
      setScore(score + 1);
      setFeedback("✓ Correct!");
    } else {
      setFeedback(`✗ Wrong! It's ${current.term}`);
    }
    setTimeout(nextQuestion, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/game-hub">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Games
          </Button>
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Medical Trivia</h1>
          <div className="text-2xl font-bold text-cyan-600">{score}/{answered}</div>
        </div>
        {current && (
          <Card className="p-8 bg-white shadow-lg border-2 border-cyan-200 mb-8">
            <p className="text-2xl font-bold text-gray-900 mb-8">{current.meaning}</p>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== ""}
                  className="p-4 text-lg font-semibold rounded-lg border-2 bg-white border-cyan-200 text-gray-900 hover:border-cyan-600 disabled:opacity-50"
                >
                  {opt.term}
                </button>
              ))}
            </div>
            {feedback && (
              <div className={`p-4 rounded-lg text-center font-bold text-lg ${feedback.includes("✓") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {feedback}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
