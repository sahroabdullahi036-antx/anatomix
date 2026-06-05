import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const GAMES = [
  { title: "Hangman", desc: "Guess the medical term letter by letter", icon: "🎮", path: "/hangman" },
  { title: "Spelling Bee", desc: "Master spelling with pronunciation sections", icon: "🐝", path: "/spelling-bee" },
  { title: "Matching", desc: "Match terms to their definitions", icon: "🎯", path: "/matching" },
  { title: "Memory", desc: "Flip cards to find matching pairs", icon: "🧠", path: "/memory" },
  { title: "Trivia", desc: "Test your medical knowledge", icon: "❓", path: "/trivia" },
  { title: "Term Builder", desc: "Build terms from word parts", icon: "🔨", path: "/term-builder" },
  { title: "Crossword", desc: "Solve medical terminology crosswords", icon: "⬜", path: "/crossword" },
  { title: "Word Search", desc: "Find hidden medical terms", icon: "🔍", path: "/word-search" },
];

export default function GameHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Games</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map(game => (
            <Link key={game.path} href={game.path}>
              <Card className="p-6 bg-white shadow-lg border-2 border-indigo-200 hover:border-indigo-600 cursor-pointer transition h-full">
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{game.title}</h3>
                <p className="text-sm text-gray-600">{game.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
