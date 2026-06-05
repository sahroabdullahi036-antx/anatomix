import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTerms } from "@/hooks/useTerms";
import { normalizeAnswer } from "@/lib/answerUtils";

export default function Hangman() {
  const { allTerms } = useTerms();
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [currentTerm, setCurrentTerm] = useState<any>(null);

  useEffect(() => {
    if (allTerms.length > 0) {
      const studied = allTerms.filter((t: any) => (t as any).studied);
      const terms = studied.length > 0 ? studied : allTerms;
      const term = terms[Math.floor(Math.random() * terms.length)];
      setCurrentTerm(term);
      setWord(normalizeAnswer(term.term).toUpperCase());
      setGuessed([]);
      setWrong(0);
      setGameState("playing");
    }
  }, [allTerms.length]);

  const guessLetter = (letter: string) => {
    if (guessed.includes(letter) || gameState !== "playing") return;
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= 6) setGameState("lost");
    }

    const isWon = word.split("").every(l => newGuessed.includes(l));
    if (isWon) setGameState("won");
  };

  const display = word.split("").map(l => (guessed.includes(l) ? l : "_")).join(" ");
  const hangmanStages = ["", "HEAD", "BODY", "LEFT ARM", "RIGHT ARM", "LEFT LEG", "RIGHT LEG"];

  const resetGame = () => {
    if (allTerms.length > 0) {
      const studied = allTerms.filter((t: any) => (t as any).studied);
      const terms = studied.length > 0 ? studied : allTerms;
      const term = terms[Math.floor(Math.random() * terms.length)];
      setCurrentTerm(term);
      setWord(normalizeAnswer(term.term).toUpperCase());
      setGuessed([]);
      setWrong(0);
      setGameState("playing");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Medical Hangman</h1>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="p-8 bg-white shadow-lg border-2 border-orange-200 text-center">
            <div className="text-6xl font-bold text-orange-600 mb-4">{hangmanStages[wrong]}</div>
            <p className="text-gray-600">Wrong guesses: {wrong}/6</p>
          </Card>

          <Card className="p-8 bg-white shadow-lg border-2 border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Definition:</p>
            <p className="text-lg font-semibold text-gray-900 mb-6">{currentTerm?.meaning}</p>
            <p className="text-4xl font-mono font-bold text-center text-orange-600 mb-2">{display}</p>
            <p className="text-xs text-gray-500 text-center">{currentTerm?.category}</p>
          </Card>
        </div>

        <Card className="p-6 bg-white shadow-lg border-2 border-orange-200 mb-8">
          <p className="text-sm text-gray-600 mb-4">Click letters to guess:</p>
          <div className="grid grid-cols-7 gap-2">
            {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter => (
              <Button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={guessed.includes(letter) || gameState !== "playing"}
                className={`p-2 text-sm font-bold ${guessed.includes(letter) ? "bg-gray-300" : "bg-orange-600 hover:bg-orange-700 text-white"}`}
              >
                {letter}
              </Button>
            ))}
          </div>
        </Card>

        {gameState !== "playing" && (
          <Card className={`p-8 bg-white shadow-lg border-2 text-center mb-8 ${gameState === "won" ? "border-green-200" : "border-red-200"}`}>
            <p className={`text-3xl font-bold mb-4 ${gameState === "won" ? "text-green-600" : "text-red-600"}`}>
              {gameState === "won" ? "🎉 You Won!" : "💀 Game Over!"}
            </p>
            <p className="text-lg text-gray-900 mb-4">The word was: <span className="font-bold">{word}</span></p>
            <p className="text-gray-600 mb-6">{currentTerm?.meaning}</p>
            <Button onClick={resetGame} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 mx-auto">
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
