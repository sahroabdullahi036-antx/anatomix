import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTerms } from "@/hooks/useTerms";
import { ChevronLeft, Volume2, Lightbulb } from "lucide-react";

export default function WordBuilding() {
  const { allTerms } = useTerms();
  const [selectedType, setSelectedType] = useState<"root" | "prefix" | "suffix">("root");
  const [currentIndex, setCurrentIndex] = useState(0);

  const termsByType = useMemo(() => {
    return allTerms.filter(t => t.type === selectedType);
  }, [allTerms, selectedType]);

  const currentTerm = termsByType[currentIndex];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentIndex < termsByType.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTypeChange = (type: "root" | "prefix" | "suffix") => {
    setSelectedType(type);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/main-menu">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Word Building</h1>
          <div className="w-24"></div>
        </div>

        {/* Type Selector */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          {["root", "prefix", "suffix"].map(type => (
            <Button
              key={type}
              onClick={() => handleTypeChange(type as any)}
              variant={selectedType === type ? "default" : "outline"}
              className="capitalize"
            >
              {type}s
            </Button>
          ))}
        </div>

        {/* Main Content */}
        {currentTerm ? (
          <div className="space-y-8">
            {/* Progress */}
            <div className="text-center text-sm text-gray-600">
              {currentIndex + 1} of {termsByType.length}
            </div>

            {/* Term Card */}
            <Card className="p-12 bg-white shadow-xl border-2 border-orange-200 text-center">
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                {selectedType}
              </span>
              
              <h2 className="text-6xl font-bold text-gray-900 my-6">{currentTerm.term}</h2>
              
              <p className="text-lg text-gray-600 italic mb-6">{currentTerm.phonetic}</p>

              <Button 
                variant="outline"
                onClick={() => handleSpeak(currentTerm.term)}
                className="flex items-center gap-2 mx-auto mb-8"
              >
                <Volume2 className="w-5 h-5" /> Pronounce
              </Button>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Meaning</h3>
                <p className="text-orange-800 text-lg">{currentTerm.meaning}</p>
              </div>

              {currentTerm.example && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Example</h3>
                  <p className="text-blue-800">{currentTerm.example}</p>
                </div>
              )}

              {currentTerm.mnemonic && (
                <div className="flex items-start gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-bold text-yellow-900 mb-1">Memory Trick</h3>
                    <p className="text-yellow-800">{currentTerm.mnemonic}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                ← Previous
              </Button>
              <Button 
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === termsByType.length - 1}
              >
                Next →
              </Button>
            </div>

            {/* Related Terms */}
            <Card className="p-6 bg-white shadow-lg border-2 border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {termsByType.slice(0, 6).map((term, idx) => (
                  <button
                    key={term.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      idx === currentIndex
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    <div className="font-semibold">{term.term}</div>
                    <div className="text-sm opacity-75">{term.meaning}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center bg-white shadow-lg border-2 border-orange-100">
            <p className="text-gray-600 text-lg">No {selectedType}s available.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
