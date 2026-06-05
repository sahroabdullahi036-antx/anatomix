import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTerms } from "@/hooks/useTerms";
import { useFlashcards } from "@/hooks/useFlashcards";
import { BookOpen, Brain, Zap, BarChart3, Lightbulb, Layers, Search, Calendar, Home } from "lucide-react";

export default function MainMenu() {
  const { allTerms } = useTerms();
  const { getStats } = useFlashcards(allTerms as any);
  const stats = getStats();

  const menuItems = [
    {
      title: "Study Cards",
      description: "Interactive flashcards with spaced repetition",
      icon: Brain,
      href: "/flashcards",
      color: "from-blue-500 to-blue-600",
      stats: `${stats.total} terms`
    },
    {
      title: "Dictionary",
      description: "Searchable medical terminology database",
      icon: BookOpen,
      href: "/dictionary",
      color: "from-purple-500 to-purple-600",
      stats: `${stats.total} terms`
    },
    {
      title: "Word Building",
      description: "Learn roots, prefixes, and suffixes",
      icon: Layers,
      href: "/word-building",
      color: "from-orange-500 to-orange-600",
      stats: "Build medical terms"
    },
    {
      title: "Quizzes",
      description: "Test your knowledge with multiple modes",
      icon: Zap,
      href: "/quizzes",
      color: "from-red-500 to-red-600",
      stats: "Multiple choice & more"
    },
    {
      title: "Similar Terms",
      description: "Compare confusing medical term pairs",
      icon: Search,
      href: "/similar-terms",
      color: "from-cyan-500 to-cyan-600",
      stats: "8+ comparisons"
    },
    {
      title: "Anatomy Explorer",
      description: "Interactive body system explorer",
      icon: Lightbulb,
      href: "/anatomy",
      color: "from-green-500 to-green-600",
      stats: "11 body systems"
    },
    {
      title: "Progress Tracker",
      description: "Monitor your learning progress",
      icon: BarChart3,
      href: "/progress",
      color: "from-indigo-500 to-indigo-600",
      stats: `${stats.masteryPercentage}% mastery`
    },
    {
      title: "Study Tips",
      description: "Techniques and Pomodoro timer",
      icon: Calendar,
      href: "/study-tips",
      color: "from-teal-500 to-teal-600",
      stats: "6 techniques"
    },
    {
      title: "Study Schedule",
      description: "Upload syllabus and set daily goals",
      icon: Calendar,
      href: "/upload-syllabus",
      color: "from-emerald-500 to-emerald-600",
      stats: "Track progress"
    },
    {
      title: "Game Hub",
      description: "8 educational games with difficulty levels",
      icon: Zap,
      href: "/game-hub",
      color: "from-pink-500 to-pink-600",
      stats: "8 games"
    },
    {
      title: "Focus Here",
      description: "Extra practice on problem terms",
      icon: Brain,
      href: "/focus-here",
      color: "from-red-500 to-red-600",
      stats: "Problem terms"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Medical Knowledge Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master medical terminology with interactive study tools, spaced repetition, and evidence-based learning techniques.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 bg-white shadow-md border-2 border-blue-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Terms</p>
          </Card>
          <Card className="p-4 bg-white shadow-md border-2 border-green-100 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.mastered}</p>
            <p className="text-sm text-gray-600">Mastered</p>
          </Card>
          <Card className="p-4 bg-white shadow-md border-2 border-yellow-100 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.reviewing}</p>
            <p className="text-sm text-gray-600">Reviewing</p>
          </Card>
          <Card className="p-4 bg-white shadow-md border-2 border-red-100 text-center">
            <p className="text-3xl font-bold text-red-600">{stats.masteryPercentage}%</p>
            <p className="text-sm text-gray-600">Mastery</p>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="h-full p-6 bg-white shadow-lg hover:shadow-xl border-2 border-gray-100 hover:border-blue-300 transition-all cursor-pointer group overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {item.stats}
                      </span>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How to Use Study Sanctuary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-blue-600 mb-2">1. Learn Foundations</p>
              <p className="text-sm text-gray-600">Start with Word Building to understand roots, prefixes, and suffixes that form medical terms.</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600 mb-2">2. Study & Practice</p>
              <p className="text-sm text-gray-600">Use Study Cards and Quizzes to practice terms. The app tracks your progress automatically.</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600 mb-2">3. Review & Master</p>
              <p className="text-sm text-gray-600">Use the Progress Tracker to identify weak areas and focus your study time effectively.</p>
            </div>
          </div>
        </Card>

        {/* Offline Notice */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>✓ 100% Private & Offline • All data stored locally in your browser • No internet required</p>
        </div>
      </div>
    </div>
  );
}
