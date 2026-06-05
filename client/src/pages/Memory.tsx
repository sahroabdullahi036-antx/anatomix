import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useTerms } from "@/hooks/useTerms";

export default function Memory() {
  const { allTerms } = useTerms();
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (allTerms.length > 0) {
      const shuffled = allTerms.sort(() => Math.random() - 0.5).slice(0, 6);
      const cardPairs = shuffled.flatMap(t => [
        { id: `${t.id}-t`, text: t.term, pair: `${t.id}-d` },
        { id: `${t.id}-d`, text: t.meaning, pair: `${t.id}-t` }
      ]).sort(() => Math.random() - 0.5);
      setCards(cardPairs);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
    }
  }, [allTerms.length]);

  const handleFlip = (idx: number) => {
    if (flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      if (cards[newFlipped[0]].pair === cards[newFlipped[1]].id) {
        setMatched([...matched, newFlipped[0], newFlipped[1]]);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/game-hub">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Games
          </Button>
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Memory Game</h1>
          <div className="text-2xl font-bold text-pink-600">Moves: {moves}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => handleFlip(idx)}
              disabled={matched.includes(idx)}
              className={`h-24 rounded-lg border-2 font-bold text-center p-2 transition ${
                matched.includes(idx)
                  ? "bg-green-100 border-green-400"
                  : flipped.includes(idx)
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white border-pink-200 hover:border-pink-600"
              }`}
            >
              {flipped.includes(idx) || matched.includes(idx) ? card.text : "?"}
            </button>
          ))}
        </div>
        {matched.length === cards.length && (
          <Card className="p-6 bg-green-100 border-2 border-green-400 text-center">
            <p className="text-2xl font-bold text-green-800">🎉 You won in {moves} moves!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
