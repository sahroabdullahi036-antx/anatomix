import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const BASE_COMPARISONS = {
  "Prefix": [
    { t1: "Hyper-", t2: "Hypo-", d1: "Excessive", d2: "Deficient" },
    { t1: "Tachy-", t2: "Brady-", d1: "Fast", d2: "Slow" },
    { t1: "Macro-", t2: "Micro-", d1: "Large", d2: "Small" },
    { t1: "Poly-", t2: "Oligo-", d1: "Many", d2: "Few" },
  ],
  "Suffix": [
    { t1: "-itis", t2: "-osis", d1: "Inflammation", d2: "Condition/disease" },
    { t1: "-ectomy", t2: "-ostomy", d1: "Removal", d2: "Opening" },
    { t1: "-plasty", t2: "-plassia", d1: "Surgical repair", d2: "Formation/growth" },
    { t1: "-penia", t2: "-emia", d1: "Deficiency", d2: "In blood" },
  ],
  "Root": [
    { t1: "Cardi/o", t2: "Angi/o", d1: "Heart", d2: "Vessel" },
    { t1: "Hepat/o", t2: "Gastr/o", d1: "Liver", d2: "Stomach" },
    { t1: "Nephr/o", t2: "Ureter/o", d1: "Kidney", d2: "Kidney tube" },
    { t1: "Pulmon/o", t2: "Pneum/o", d1: "Lung", d2: "Air/lung" },
  ],
  "Confusing": [
    { t1: "Ileum", t2: "Ilium", d1: "Small intestine", d2: "Hip bone" },
    { t1: "-phagia", t2: "-phasia", d1: "Swallowing", d2: "Speech" },
    { t1: "Aphagia", t2: "Aphasia", d1: "Cannot swallow", d2: "Cannot speak" },
    { t1: "Peroneal", t2: "Peritoneal", d1: "Fibula nerve", d2: "Abdominal lining" },
  ]
};

export default function SimilarTermsQuiz() {
  const [allComparisons, setAllComparisons] = useState(() => {
    const saved = localStorage.getItem("similarTerms");
    return saved ? { ...BASE_COMPARISONS, ...JSON.parse(saved) } : BASE_COMPARISONS;
  });
  const comparisons = Object.values(allComparisons).flat();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const current = comparisons[currentIdx] as any;
  const options = [
    { term: current.t1, def: current.d1 },
    { term: current.t2, def: current.d2 },
  ].sort(() => Math.random() - 0.5);

  const handleAnswer = (term: string) => {
    setSelected(term);
    const isCorrect = (term === current.t1 && current.d1 === current.d1) || (term === current.t2 && current.d2 === current.d2);
    if (term === current.t1 || term === current.t2) {
      setScore(score + 1);
      setFeedback("✓ Correct!");
    } else {
      setFeedback("✗ Wrong!");
    }
    setAnswered(answered + 1);
    setTimeout(() => {
      if (currentIdx < comparisons.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelected(null);
        setFeedback("");
      } else {
        setFeedback(`Quiz complete! Score: ${score + 1}/${answered + 1}`);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/similar-terms">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Similar Terms Quiz</h1>
          <div className="text-2xl font-bold text-indigo-600">{score}/{answered}</div>
        </div>

        <Card className="p-8 bg-white shadow-lg border-2 border-indigo-200 mb-8">
          <p className="text-gray-600 mb-2">Which term matches this definition?</p>
          <p className="text-3xl font-bold text-gray-900 mb-8">{current.d1 || current.d2}</p>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.term)}
                disabled={selected !== null}
                className={`p-4 text-lg font-semibold rounded-lg border-2 transition ${
                  selected === opt.term
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-indigo-200 text-gray-900 hover:border-indigo-600"
                }`}
              >
                {opt.term}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-lg text-center font-bold text-lg ${feedback.includes("✓") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {feedback}
            </div>
          )}
        </Card>

        <div className="text-center text-gray-600">
          Question {currentIdx + 1} of {comparisons.length}
        </div>
      </div>
    </div>
  );
}
