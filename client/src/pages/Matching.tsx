import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useTerms } from "@/hooks/useTerms";

export default function Matching() {
  const { allTerms } = useTerms();
  const [pairs, setPairs] = useState<any[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (allTerms.length > 0) {
      const shuffled = allTerms.sort(() => Math.random() - 0.5).slice(0, 6);
      setPairs(shuffled);
      setMatched([]);
      setSelected(null);
    }
  }, [allTerms.length]);

  const handleSelect = (id: string) => {
    if (matched.includes(id) || selected === id) return;
    if (!selected) {
      setSelected(id);
    } else {
      if (selected === id) {
        setMatched([...matched, id]);
        setSelected(null);
      } else {
        setSelected(id);
      }
    }
  };

  const terms = pairs.map(p => ({ id: p.id, text: p.term }));
  const defs = pairs.map(p => ({ id: p.id, text: p.meaning }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/game-hub">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Games
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Matching Game</h1>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-4 font-semibold">Terms</p>
            <div className="space-y-2">
              {terms.map(term => (
                <button
                  key={term.id}
                  onClick={() => handleSelect(term.id)}
                  disabled={matched.includes(term.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left font-semibold transition ${
                    matched.includes(term.id)
                      ? "bg-green-100 border-green-400 text-green-800"
                      : selected === term.id
                      ? "bg-yellow-600 text-white border-yellow-600"
                      : "bg-white border-yellow-200 text-gray-900 hover:border-yellow-600"
                  }`}
                >
                  {term.text}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-4 font-semibold">Definitions</p>
            <div className="space-y-2">
              {defs.sort(() => Math.random() - 0.5).map(def => (
                <button
                  key={def.id}
                  onClick={() => handleSelect(def.id)}
                  disabled={matched.includes(def.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left font-semibold transition ${
                    matched.includes(def.id)
                      ? "bg-green-100 border-green-400 text-green-800"
                      : selected === def.id
                      ? "bg-yellow-600 text-white border-yellow-600"
                      : "bg-white border-yellow-200 text-gray-900 hover:border-yellow-600"
                  }`}
                >
                  {def.text}
                </button>
              ))}
            </div>
          </div>
        </div>
        {matched.length === pairs.length && (
          <Card className="p-6 bg-green-100 border-2 border-green-400 text-center">
            <p className="text-2xl font-bold text-green-800">🎉 Perfect Match!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
