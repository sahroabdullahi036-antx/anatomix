import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Plus } from "lucide-react";
import { toast } from "sonner";

const BASE_COMPARISONS = {
  "Prefix": [
    { t1: "Hyper-", t2: "Hypo-", d1: "Excessive", d2: "Deficient", diff: "HYPER = MORE. HYPO = LESS.", e1: "Hypertension", e2: "Hypotension" },
    { t1: "Tachy-", t2: "Brady-", d1: "Fast", d2: "Slow", diff: "TACHY = FAST. BRADY = SLOW.", e1: "Tachycardia", e2: "Bradycardia" },
    { t1: "Macro-", t2: "Micro-", d1: "Large", d2: "Small", diff: "MACRO = BIG. MICRO = TINY.", e1: "Macrophage", e2: "Microscope" },
    { t1: "Poly-", t2: "Oligo-", d1: "Many", d2: "Few", diff: "POLY = MANY. OLIGO = FEW.", e1: "Polydipsia", e2: "Oliguria" },
  ],
  "Suffix": [
    { t1: "-itis", t2: "-osis", d1: "Inflammation", d2: "Condition/disease", diff: "-itis = INFLAMMATION. -osis = CONDITION.", e1: "Arthritis", e2: "Arthrosis" },
    { t1: "-ectomy", t2: "-ostomy", d1: "Removal", d2: "Opening", diff: "-ectomy = REMOVE. -ostomy = OPEN.", e1: "Gastrectomy", e2: "Gastrostomy" },
    { t1: "-plasty", t2: "-plassia", d1: "Surgical repair", d2: "Formation/growth", diff: "-plasty = REPAIR. -plassia = GROWTH.", e1: "Rhinoplasty", e2: "Hyperplasia" },
    { t1: "-penia", t2: "-emia", d1: "Deficiency", d2: "In blood", diff: "-penia = LOW. -emia = IN BLOOD.", e1: "Leukopenia", e2: "Leukemia" },
  ],
  "Root": [
    { t1: "Cardi/o", t2: "Angi/o", d1: "Heart", d2: "Vessel", diff: "CARDI = HEART. ANGI = VESSELS.", e1: "Cardiology", e2: "Angiography" },
    { t1: "Hepat/o", t2: "Gastr/o", d1: "Liver", d2: "Stomach", diff: "HEPAT = LIVER. GASTR = STOMACH.", e1: "Hepatitis", e2: "Gastritis" },
    { t1: "Nephr/o", t2: "Ureter/o", d1: "Kidney", d2: "Kidney tube", diff: "NEPHR = KIDNEY. URETER = TUBE.", e1: "Nephritis", e2: "Ureteritis" },
    { t1: "Pulmon/o", t2: "Pneum/o", d1: "Lung", d2: "Air/lung", diff: "PULMON = LUNG. PNEUM = AIR.", e1: "Pulmonary", e2: "Pneumonia" },
  ],
  "Confusing": [
    { t1: "Ileum", t2: "Ilium", d1: "Small intestine", d2: "Hip bone", diff: "ILEUM = INTESTINE. ILIUM = HIP.", e1: "Ileitis", e2: "Iliac crest" },
    { t1: "-phagia", t2: "-phasia", d1: "Swallowing", d2: "Speech", diff: "-PHAGIA = SWALLOW. -PHASIA = SPEECH.", e1: "Dysphagia", e2: "Dysphasia" },
    { t1: "Aphagia", t2: "Aphasia", d1: "Cannot swallow", d2: "Cannot speak", diff: "A-PHAGIA = NO SWALLOW. A-PHASIA = NO SPEECH.", e1: "Oropharyngeal aphagia", e2: "Broca's aphasia" },
    { t1: "Peroneal", t2: "Peritoneal", d1: "Fibula nerve", d2: "Abdominal lining", diff: "PERON = FIBULA. PERITON = ABDOMEN.", e1: "Peroneal nerve", e2: "Peritoneal dialysis" },
    { t1: "Ureters", t2: "Urethra", d1: "Kidney tubes", d2: "Bladder tube", diff: "URETERS = KIDNEY. URETHRA = BLADDER.", e1: "Ureteral stones", e2: "Urethral stricture" },
    { t1: "Abduction", t2: "Adduction", d1: "Away from body", d2: "Toward body", diff: "AB = AWAY. AD = TOWARD.", e1: "Arm abduction", e2: "Hip adduction" },
    { t1: "Stenosis", t2: "Sclerosis", d1: "Narrowing", d2: "Hardening", diff: "STENOSIS = NARROW. SCLEROSIS = HARD.", e1: "Mitral stenosis", e2: "Arteriosclerosis" },
    { t1: "Necrosis", t2: "Osmosis", d1: "Cell death", d2: "Water movement", diff: "NECROSIS = DEATH. OSMOSIS = WATER.", e1: "Myocardial necrosis", e2: "Osmotic pressure" },
    { t1: "Ptosis", t2: "Stasis", d1: "Drooping", d2: "Pooling", diff: "PTOSIS = DROOP. STASIS = STOP.", e1: "Eyelid ptosis", e2: "Venous stasis" },
    { t1: "Apnea", t2: "Dyspnea", d1: "No breathing", d2: "Difficult breathing", diff: "APNEA = NO. DYSPNEA = DIFFICULT.", e1: "Sleep apnea", e2: "Exertional dyspnea" },
  ]
};

export default function SimilarTerms() {
  const [comparisons, setComparisons] = useState(() => {
    const saved = localStorage.getItem("similarTerms");
    return saved ? { ...BASE_COMPARISONS, ...JSON.parse(saved) } : BASE_COMPARISONS;
  });
  const [currentSection, setCurrentSection] = useState("Prefix");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ t1: "", t2: "", d1: "", d2: "", diff: "", e1: "", e2: "" });

  const sections = Object.keys(comparisons);
  const current = comparisons[currentSection as keyof typeof comparisons][currentIndex];

  const handleAddComparison = () => {
    if (!formData.t1 || !formData.t2 || !formData.diff) {
      toast.error("Fill all required fields");
      return;
    }
    const newSection = "Custom";
    const updated = { ...comparisons };
    if (!updated[newSection]) updated[newSection] = [];
    updated[newSection].push(formData);
    setComparisons(updated);
    localStorage.setItem("similarTerms", JSON.stringify({ Custom: updated.Custom }));
    setFormData({ t1: "", t2: "", d1: "", d2: "", diff: "", e1: "", e2: "" });
    setShowAddForm(false);
    toast.success("Comparison added!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Similar Terms</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Comparison
          </Button>
        </div>

        {showAddForm && (
          <Card className="p-6 bg-white shadow-lg border-2 border-green-200 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Your Comparison</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Term 1" value={formData.t1} onChange={(e) => setFormData({...formData, t1: e.target.value})} className="p-2 border-2 border-gray-300 rounded-lg" />
              <input placeholder="Term 2" value={formData.t2} onChange={(e) => setFormData({...formData, t2: e.target.value})} className="p-2 border-2 border-gray-300 rounded-lg" />
              <input placeholder="Definition 1" value={formData.d1} onChange={(e) => setFormData({...formData, d1: e.target.value})} className="p-2 border-2 border-gray-300 rounded-lg" />
              <input placeholder="Definition 2" value={formData.d2} onChange={(e) => setFormData({...formData, d2: e.target.value})} className="p-2 border-2 border-gray-300 rounded-lg" />
            </div>
            <textarea placeholder="Key difference (e.g., TERM1 = X. TERM2 = Y.)" value={formData.diff} onChange={(e) => setFormData({...formData, diff: e.target.value})} className="w-full p-2 border-2 border-gray-300 rounded-lg mb-4 h-16" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Example 1" value={formData.e1} onChange={(e) => setFormData({...formData, e1: e.target.value})} className="p-2 border-2 border-gray-300 rounded-lg" />
              <input placeholder="Example 2" value={formData.e2} onChange={(e) => setFormData({...formData, e2: e.target.value})} className="p-2 border-2 border-gray-300 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddComparison} className="bg-green-600 hover:bg-green-700 text-white flex-1">Add</Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </Card>
        )}

        <div className="flex gap-2 mb-8 flex-wrap">
          {sections.map(sec => (
            <Button 
              key={sec}
              onClick={() => { setCurrentSection(sec); setCurrentIndex(0); }}
              className={sec === currentSection ? "bg-cyan-600 text-white" : "bg-gray-200"}
            >
              {sec}
            </Button>
          ))}
        </div>

        <Card className="p-8 bg-white shadow-lg border-2 border-cyan-200 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 text-center">
              <h2 className="text-4xl font-bold text-cyan-600 mb-2">{current.t1}</h2>
              <p className="text-sm text-gray-600">{current.d1}</p>
            </div>
            <div className="text-2xl text-gray-400 mx-4">vs</div>
            <div className="flex-1 text-center">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">{current.t2}</h2>
              <p className="text-sm text-gray-600">{current.d2}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded mb-8">
            <p className="text-yellow-800 font-semibold">{current.diff}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-cyan-50 p-6 rounded-lg border-2 border-cyan-200">
              <p className="font-bold text-cyan-900 mb-2">Example</p>
              <p className="text-cyan-800">{current.e1}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <p className="font-bold text-blue-900 mb-2">Example</p>
              <p className="text-blue-800">{current.e2}</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ← Previous
          </Button>
          <span className="flex items-center px-4 text-gray-600">{currentIndex + 1} of {comparisons[currentSection as keyof typeof comparisons].length}</span>
          <Button 
            onClick={() => setCurrentIndex(Math.min(comparisons[currentSection as keyof typeof comparisons].length - 1, currentIndex + 1))}
            disabled={currentIndex === comparisons[currentSection as keyof typeof comparisons].length - 1}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
