import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useTerms } from "@/hooks/useTerms";

export default function SpellingBee() {
  const { allTerms } = useTerms();
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    nextTerm();
  }, [allTerms.length]);

  const nextTerm = () => {
    if (allTerms.length > 0) {
      setCurrentTerm(allTerms[Math.floor(Math.random() * allTerms.length)]);
      setInput("");
      setFeedback("");
    }
  };

  const checkSpelling = () => {
    if (!input.trim()) {
      toast.error("Enter a spelling");
      return;
    }
    const correct = input.toLowerCase().trim() === currentTerm.term.toLowerCase();
    setAnswered(answered + 1);
    if (correct) {
      setScore(score + 1);
      setFeedback("✓ Correct!");
      setTimeout(nextTerm, 1500);
    } else {
      setFeedback(`✗ Wrong! It's "${currentTerm.term}"`);
      setTimeout(nextTerm, 2000);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && currentTerm) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentTerm.term);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sections = currentTerm?.term.split(/[-\/]/).filter((s: string) => s.length > 0) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Spelling Bee</h1>
          <div className="text-2xl font-bold text-green-600">{score}/{answered}</div>
        </div>

        {currentTerm && (
          <Card className="p-8 bg-white shadow-lg border-2 border-green-200 mb-8">
            <p className="text-gray-600 mb-4">Definition:</p>
            <p className="text-2xl font-semibold text-gray-900 mb-6">{currentTerm.meaning}</p>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mb-6">
              <p className="text-sm text-gray-600 mb-2">Sections (click to hear):</p>
              <div className="flex flex-wrap gap-2">
                {sections.map((section: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(section);
                        utterance.lang = 'en-US';
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" /> {section}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSpeak} className="w-full mb-6 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5" /> Hear Full Word
            </Button>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Type the spelling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && checkSpelling()}
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-lg"
                autoFocus
              />
              <Button onClick={checkSpelling} className="bg-green-600 hover:bg-green-700 text-white px-6">Check</Button>
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
