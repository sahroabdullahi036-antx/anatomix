import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Play, Pause, RotateCcw, Lightbulb } from "lucide-react";

export default function StudyTips() {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"work" | "break">("work");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play notification sound
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(
                sessionType === "work" ? "Work session complete! Take a break." : "Break time over! Ready to work?"
              );
              window.speechSynthesis.speak(utterance);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime, sessionType]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPomodoroTime(sessionType === "work" ? 25 * 60 : 5 * 60);
  };

  const handleSwitchSession = () => {
    setIsRunning(false);
    setSessionType(sessionType === "work" ? "break" : "work");
    setPomodoroTime(sessionType === "work" ? 5 * 60 : 25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const studyTechniques = [
    {
      title: "Spaced Repetition",
      description: "Review material at increasing intervals to move it from short-term to long-term memory.",
      tips: ["Review after 1 day", "Review after 3 days", "Review after 7 days", "Review after 14 days"]
    },
    {
      title: "Active Recall",
      description: "Test yourself on material instead of passively re-reading. This strengthens memory pathways.",
      tips: ["Use flashcards", "Take practice quizzes", "Teach someone else", "Write from memory"]
    },
    {
      title: "Mnemonics & Memory Tricks",
      description: "Create memorable associations to remember complex medical terms and their meanings.",
      tips: ["Use acronyms (e.g., PEMDAS)", "Create visual images", "Link to personal experiences", "Use rhymes or songs"]
    },
    {
      title: "Chunking",
      description: "Break down large amounts of information into smaller, manageable chunks.",
      tips: ["Group by category", "Learn roots/prefixes/suffixes first", "Build complex terms from parts", "Study one system at a time"]
    },
    {
      title: "Interleaving",
      description: "Mix different topics during study sessions instead of studying one topic at a time.",
      tips: ["Alternate between roots and full terms", "Mix different categories", "Vary quiz types", "Switch between study modes"]
    },
    {
      title: "Elaboration",
      description: "Connect new information to existing knowledge to deepen understanding.",
      tips: ["Explain why terms are named this way", "Connect to body systems", "Compare similar terms", "Create real-world examples"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/main-menu">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Study Tips & Pomodoro</h1>
          <div className="w-24"></div>
        </div>

        {/* Pomodoro Timer */}
        <Card className="p-12 bg-white shadow-xl border-2 border-teal-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pomodoro Timer</h2>
          
          <div className="flex flex-col items-center gap-8">
            {/* Timer Display */}
            <div className={`text-8xl font-bold font-mono ${sessionType === "work" ? "text-teal-600" : "text-green-600"}`}>
              {formatTime(pomodoroTime)}
            </div>

            {/* Session Type */}
            <div className="text-xl font-semibold text-gray-700">
              {sessionType === "work" ? "🎯 Work Session" : "☕ Break Time"}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button 
                onClick={handleStartPause}
                className="flex items-center gap-2 px-8 py-6 text-lg"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Start
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-6"
              >
                <RotateCcw className="w-5 h-5" /> Reset
              </Button>
            </div>

            {/* Session Switch */}
            <Button 
              variant="outline"
              onClick={handleSwitchSession}
              className="w-full"
            >
              Switch to {sessionType === "work" ? "Break" : "Work"} Session
            </Button>

            {/* Info */}
            <div className="text-sm text-gray-600 text-center">
              <p>Standard Pomodoro: 25 min work + 5 min break</p>
              <p>After 4 cycles, take a 15-30 min longer break</p>
            </div>
          </div>
        </Card>

        {/* Study Techniques */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" /> Evidence-Based Study Techniques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyTechniques.map((technique, idx) => (
              <Card key={idx} className="p-6 bg-white shadow-lg border-2 border-teal-100 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-teal-700 mb-2">{technique.title}</h3>
                <p className="text-gray-600 mb-4">{technique.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">How to apply:</p>
                  <ul className="space-y-1">
                    {technique.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-teal-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="p-8 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-lg border-2 border-teal-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Study Tips</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-bold text-gray-900">Set Clear Goals</p>
                  <p className="text-sm text-gray-600">Decide what you want to learn before each session.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-bold text-gray-900">Understand, Don't Memorize</p>
                  <p className="text-sm text-gray-600">Learn WHY terms are named the way they are.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-bold text-gray-900">Write It Down</p>
                  <p className="text-sm text-gray-600">Handwriting engages more brain regions than typing.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-bold text-gray-900">Say It Out Loud</p>
                  <p className="text-sm text-gray-600">Pronunciation helps with retention and recall.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-2xl">😴</span>
                <div>
                  <p className="font-bold text-gray-900">Get Enough Sleep</p>
                  <p className="text-sm text-gray-600">Sleep consolidates memories and improves retention.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-bold text-gray-900">Review Regularly</p>
                  <p className="text-sm text-gray-600">Consistent review prevents forgetting and builds mastery.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
