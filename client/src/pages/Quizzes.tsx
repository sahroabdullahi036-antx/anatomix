import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTerms } from "@/hooks/useTerms";
import { ChevronLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const BODY_SYSTEMS = [
  "Prefixes", "Suffixes", "Cardiovascular", "Respiratory", "Digestive",
  "Urinary", "Musculoskeletal", "Nervous", "Endocrine", "Integumentary",
  "Sensory", "Immune"
];

type QuizMode = "multiple-choice" | "fill-blank";

export default function Quizzes() {
  const { allTerms } = useTerms();
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>("multiple-choice");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);

  const quizTerms = useMemo(() => {
    if (!selectedSystem) return [];
    return allTerms.filter(t => t.category === selectedSystem);
  }, [allTerms, selectedSystem]);

  const currentQuestion = quizTerms[currentIndex];

  const isAnswerCorrect = (userAnswer: string, correctTerm: string) => {
    const normalized = userAnswer
      .toLowerCase()
      .trim()
      .replace(/[\/\-\s]/g, "");
    const correctNormalized = correctTerm
      .toLowerCase()
      .trim()
      .replace(/[\/\-\s]/g, "");

    // Exact match
    if (normalized === correctNormalized) {
      return true;
    }

    // Handle a/an variations
    if (
      (correctNormalized === "a" || correctNormalized === "an") &&
      (normalized === "a" || normalized === "an")
    ) {
      return true;
    }

    return false;
  };

  const normalizeAnswer = (text: string) => {
    return text.toLowerCase().trim().replace(/[\/\-\s]/g, "");
  };

  const generateMultipleChoice = () => {
    if (!currentQuestion) return [];
    const correct = currentQuestion.meaning;
    const incorrect = quizTerms
      .filter(t => t.id !== currentQuestion.id)
      .slice(0, 3)
      .map(t => t.meaning);
    
    const options = [correct, ...incorrect].sort(() => Math.random() - 0.5);
    return options;
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    
    if (answer === currentQuestion.meaning) {
      setScore(score + 1);
    }
  };

  const handleFillBlank = () => {
    setAnswered(true);
    if (isAnswerCorrect(userInput, currentQuestion.term)) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizTerms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setUserInput("");
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setUserInput("");
    setQuizStarted(false);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AnatomiX Quizzes</h1>
          <p className="text-gray-600 mb-8">Select a body system to quiz yourself</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BODY_SYSTEMS.map(system => {
              const count = allTerms.filter(t => t.category === system).length;
              return (
                <Button
                  key={system}
                  onClick={() => {
                    setSelectedSystem(system);
                    setCurrentIndex(0);
                    setScore(0);
                    setQuizStarted(false);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg h-auto flex flex-col"
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

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Button onClick={() => setSelectedSystem(null)} variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          
          <Card className="p-8 bg-white shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Quiz Mode</h2>
            
            <div className="space-y-4">
              <Button 
                onClick={() => { setQuizMode("multiple-choice"); setQuizStarted(true); }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
              >
                Multiple Choice
              </Button>
              <Button 
                onClick={() => { setQuizMode("fill-blank"); setQuizStarted(true); }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
              >
                Fill in the Blank
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (quizTerms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl mb-4">No terms in this system</p>
          <Button onClick={() => setSelectedSystem(null)}>← Back</Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= quizTerms.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="p-8 bg-white shadow-lg text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
            <p className="text-5xl font-bold text-purple-600 mb-4">{score}/{quizTerms.length}</p>
            <p className="text-gray-600 mb-8">You got {Math.round((score / quizTerms.length) * 100)}% correct</p>
            <Button onClick={handleRestart} className="bg-purple-600 hover:bg-purple-700 text-white py-3">
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const options = generateMultipleChoice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => setSelectedSystem(null)} variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <span className="text-sm text-gray-600">Question {currentIndex + 1} of {quizTerms.length}</span>
        </div>

        <Card className="p-8 bg-white shadow-lg mb-8">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">What is the definition of:</p>
            <h2 className="text-3xl font-bold text-gray-900">{currentQuestion.term}</h2>
            <p className="text-gray-500 italic mt-2">{currentQuestion.phonetic}</p>
          </div>

          {quizMode === "multiple-choice" ? (
            <div className="space-y-3">
              {options.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`w-full text-left py-3 ${
                    selectedAnswer === option
                      ? option === currentQuestion.meaning
                        ? "bg-green-600 hover:bg-green-600"
                        : "bg-red-600 hover:bg-red-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } text-gray-900`}
                >
                  {selectedAnswer === option && (
                    option === currentQuestion.meaning ? (
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2 inline" />
                    )
                  )}
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Input 
                placeholder="Type your answer..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={answered}
                onKeyPress={(e) => e.key === "Enter" && !answered && handleFillBlank()}
              />
              <Button 
                onClick={handleFillBlank}
                disabled={answered}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit Answer
              </Button>
              {answered && (
                <div className={`p-4 rounded-lg ${isAnswerCorrect(userInput, currentQuestion.term) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {isAnswerCorrect(userInput, currentQuestion.term) ? (
                    <>
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Correct!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Incorrect. The answer is: <strong>{currentQuestion.term}</strong>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {answered && (
          <Button 
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {currentIndex === quizTerms.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        )}
      </div>
    </div>
  );
}
