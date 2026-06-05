import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTerms } from "@/hooks/useTerms";
import { useFlashcards } from "@/hooks/useFlashcards";
import { ChevronLeft, TrendingUp, Target, BookOpen } from "lucide-react";

export default function Progress() {
  const { allTerms, getCategories } = useTerms();
  const { getStats } = useFlashcards(allTerms as any);
  const stats = getStats();
  const categories = getCategories();

  const categoryStats = categories.map(cat => {
    const termsInCat = (allTerms as any[]).filter(t => t.category === cat);
    return {
      category: cat,
      total: termsInCat.length,
      types: {
        roots: termsInCat.filter(t => (t.type as any) === "root").length,
        prefixes: termsInCat.filter(t => (t.type as any) === "prefix").length,
        suffixes: termsInCat.filter(t => (t.type as any) === "suffix").length,
        words: termsInCat.filter(t => (t.type as any) === "word").length
      }
    };
  });

  const masteryLevel = stats.masteryPercentage;
  let masteryColor = "text-red-600";
  let masteryBg = "bg-red-50";
  if (masteryLevel >= 75) {
    masteryColor = "text-green-600";
    masteryBg = "bg-green-50";
  } else if (masteryLevel >= 50) {
    masteryColor = "text-yellow-600";
    masteryBg = "bg-yellow-50";
  } else if (masteryLevel >= 25) {
    masteryColor = "text-orange-600";
    masteryBg = "bg-orange-50";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/main-menu">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracker</h1>
          <div className="w-24"></div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-600">Total Terms</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
          </Card>

          <Card className="p-6 bg-white shadow-lg border-2 border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-600">Mastered</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.mastered}</p>
          </Card>

          <Card className="p-6 bg-white shadow-lg border-2 border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-600">Reviewing</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.reviewing}</p>
          </Card>

          <Card className="p-6 bg-white shadow-lg border-2 border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-gray-600">Struggling</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.struggling}</p>
          </Card>
        </div>

        {/* Mastery Gauge */}
        <Card className={`p-8 bg-white shadow-lg border-2 ${masteryBg === "bg-green-50" ? "border-green-200" : masteryBg === "bg-yellow-50" ? "border-yellow-200" : masteryBg === "bg-orange-50" ? "border-orange-200" : "border-red-200"} mb-8`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Overall Mastery</h3>
          
          <div className="flex items-end gap-8">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    masteryLevel >= 75 ? "bg-green-500" :
                    masteryLevel >= 50 ? "bg-yellow-500" :
                    masteryLevel >= 25 ? "bg-orange-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${masteryLevel}%` }}
                ></div>
              </div>
            </div>
            
            <div className={`text-5xl font-bold ${masteryColor}`}>
              {masteryLevel}%
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600">Beginner</p>
              <p className="font-semibold">0-25%</p>
            </div>
            <div>
              <p className="text-gray-600">Intermediate</p>
              <p className="font-semibold">25-50%</p>
            </div>
            <div>
              <p className="text-gray-600">Advanced</p>
              <p className="font-semibold">50-75%</p>
            </div>
            <div>
              <p className="text-gray-600">Expert</p>
              <p className="font-semibold">75-100%</p>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-8 bg-white shadow-lg border-2 border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Terms by Category</h3>
          
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="border-2 border-indigo-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-900">{cat.category}</h4>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-sm">
                    {cat.total} terms
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-gray-600 text-xs">Roots</p>
                    <p className="font-bold text-blue-600">{cat.types.roots}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <p className="text-gray-600 text-xs">Prefixes</p>
                    <p className="font-bold text-green-600">{cat.types.prefixes}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded text-center">
                    <p className="text-gray-600 text-xs">Suffixes</p>
                    <p className="font-bold text-orange-600">{cat.types.suffixes}</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded text-center">
                    <p className="text-gray-600 text-xs">Words</p>
                    <p className="font-bold text-purple-600">{cat.types.words}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Study Recommendations */}
        <Card className="p-8 bg-white shadow-lg border-2 border-indigo-100 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Study Recommendations</h3>
          
          <div className="space-y-3">
            {stats.struggling > 0 && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="font-semibold text-red-900 mb-1">Focus on Struggling Terms</p>
                <p className="text-red-800 text-sm">You have {stats.struggling} term(s) marked as "Hard". Review these frequently to improve mastery.</p>
              </div>
            )}
            
            {stats.reviewing > 0 && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="font-semibold text-yellow-900 mb-1">Continue Reviewing</p>
                <p className="text-yellow-800 text-sm">You have {stats.reviewing} term(s) in review. Keep practicing these regularly.</p>
              </div>
            )}
            
            {stats.mastered > 0 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-semibold text-green-900 mb-1">Great Progress!</p>
                <p className="text-green-800 text-sm">You've mastered {stats.mastered} term(s). Keep up the excellent work!</p>
              </div>
            )}
            
            {stats.total === 0 && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-semibold text-blue-900 mb-1">Get Started</p>
                <p className="text-blue-800 text-sm">Add your first medical term in the Flashcards section to begin tracking progress.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
