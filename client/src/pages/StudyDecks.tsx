import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTerms } from "@/hooks/useTerms";

const BODY_SYSTEMS = ["Prefixes", "Suffixes", "Cardiovascular", "Respiratory", "Digestive", "Urinary", "Musculoskeletal", "Nervous", "Endocrine", "Integumentary", "Sensory", "Immune"];

export default function StudyDecks() {
  const { allTerms } = useTerms();
  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem("customDecks");
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  const saveDeck = () => {
    if (!deckName.trim() || selectedSystems.length === 0) {
      toast.error("Enter deck name and select systems");
      return;
    }
    const deckTerms = allTerms.filter(t => selectedSystems.includes(t.category));
    const newDeck = { id: Date.now(), name: deckName, systems: selectedSystems, termCount: deckTerms.length };
    const updated = [...decks, newDeck];
    setDecks(updated);
    localStorage.setItem("customDecks", JSON.stringify(updated));
    setDeckName("");
    setSelectedSystems([]);
    setShowForm(false);
    toast.success("Deck created!");
  };

  const deleteDeck = (id: number) => {
    const updated = decks.filter((d: any) => d.id !== id);
    setDecks(updated);
    localStorage.setItem("customDecks", JSON.stringify(updated));
    toast.success("Deck deleted");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Custom Study Decks</h1>
          <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Deck
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 bg-white shadow-lg border-2 border-purple-200 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Deck</h3>
            <input placeholder="Deck name" value={deckName} onChange={(e) => setDeckName(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded-lg mb-4" />
            <p className="text-sm text-gray-600 mb-2">Select systems to include:</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {BODY_SYSTEMS.map(sys => (
                <label key={sys} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={selectedSystems.includes(sys)} onChange={(e) => setSelectedSystems(e.target.checked ? [...selectedSystems, sys] : selectedSystems.filter(s => s !== sys))} />
                  <span className="text-sm">{sys}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveDeck} className="bg-purple-600 hover:bg-purple-700 text-white flex-1">Create</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck: any) => (
            <Card key={deck.id} className="p-6 bg-white shadow-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{deck.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => deleteDeck(deck.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{deck.termCount} terms from {deck.systems.length} system(s)</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Study Deck</Button>
            </Card>
          ))}
        </div>

        {decks.length === 0 && !showForm && (
          <Card className="p-12 bg-white shadow-lg border-2 border-purple-200 text-center">
            <p className="text-gray-500">No custom decks yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
