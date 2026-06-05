import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTerms } from "@/hooks/useTerms";
import { useProblemTerms } from "@/hooks/useProblemTerms";
import { Volume2, Plus, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { toast } from "sonner";

const BODY_SYSTEMS = [
  "Prefixes", "Suffixes", "Cardiovascular", "Respiratory", "Digestive",
  "Urinary", "Musculoskeletal", "Nervous", "Endocrine", "Integumentary",
  "Sensory", "Immune"
];

export default function Flashcards() {
  const { allTerms } = useTerms();
  const { addProblem, isProblem } = useProblemTerms();
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const systemTerms = selectedSystem ? allTerms.filter(t => t.category === selectedSystem) : [];
  const currentCard = systemTerms[currentIndex];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < systemTerms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlagProblem = () => {
    if (currentCard) {
      addProblem(currentCard);
      toast.success("Added to Focus Here!");
    }
  };

  if (!selectedSystem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/main-menu">
            <Button variant="outline" className="mb-8 flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Cards</h1>
          <p className="text-gray-600 mb-8">Select a body system to study</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BODY_SYSTEMS.map(system => {
              const count = allTerms.filter(t => t.category === system).length;
              return (
                <Button
                  key={system}
                  onClick={() => {
                    setSelectedSystem(system);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg h-auto flex flex-col"
                >
                  <span>{system}</span>
                  <span className="text-xs opacity-80 mt-1">{count} terms</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (systemTerms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl mb-4">No terms in this system yet</p>
          <Button onClick={() => setSelectedSystem(null)}>← Back to Systems</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => setSelectedSystem(null)} variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedSystem}</h1>
          <div className="text-sm text-gray-600">{currentIndex + 1} of {systemTerms.length}</div>
        </div>

        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative h-96 w-full cursor-pointer mb-8"
        >
          <Card className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center p-8 bg-white shadow-xl border-2 border-blue-200 rounded-2xl ${isFlipped ? "hidden" : ""}`}>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">{currentCard.type}</span>
            <h2 className="text-5xl font-bold text-gray-900 mb-2 text-center">{currentCard.term}</h2>
            <p className="text-gray-500 italic mb-6 text-lg">{currentCard.phonetic}</p>
            <Button 
              variant="outline"
              size="sm" 
              onClick={(e) => { e.stopPropagation(); handleSpeak(currentCard.phonetic); }}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" /> Pronunciation
            </Button>
            <p className="text-xs text-gray-400 mt-8">Click to reveal definition</p>
          </Card>

          <Card className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center p-8 bg-gradient-to-b from-blue-50 to-indigo-50 shadow-xl border-2 border-blue-200 rounded-2xl text-center ${!isFlipped ? "hidden" : ""}`}>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Definition</span>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">{currentCard.meaning}</h3>
            {currentCard.mnemonic && (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg max-w-md mb-6">
                <p className="text-sm text-yellow-800">{currentCard.mnemonic}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-8">Click to see term</p>
          </Card>
        </div>

        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <Button 
            onClick={handleFlagProblem}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Flag className="w-4 h-4" /> {isProblem(currentCard.id) ? "In Focus" : "Flag"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNextCard}
            disabled={currentIndex === systemTerms.length - 1}
            className="flex items-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
