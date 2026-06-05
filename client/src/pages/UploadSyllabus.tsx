import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface StudyGoal {
  id: string;
  date: string;
  goal: string;
  completed: boolean;
}

export default function UploadSyllabus() {
  const [goals, setGoals] = useState<StudyGoal[]>(() => {
    const saved = localStorage.getItem("studyGoals");
    return saved ? JSON.parse(saved) : [];
  });
  const [newDate, setNewDate] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const saveGoals = (updated: StudyGoal[]) => {
    setGoals(updated);
    localStorage.setItem("studyGoals", JSON.stringify(updated));
  };

  const handleAddGoal = () => {
    if (!newDate || !newGoal.trim()) {
      toast.error("Please enter both date and goal");
      return;
    }
    const goal: StudyGoal = {
      id: Date.now().toString(),
      date: newDate,
      goal: newGoal,
      completed: false,
    };
    saveGoals([...goals, goal]);
    setNewDate("");
    setNewGoal("");
    toast.success("Goal added!");
  };

  const handleToggleGoal = (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
    toast.success("Goal deleted");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    toast.success(`Extracted ${lines.length} lines. Add them as daily goals manually.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/main-menu">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Main Menu
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Schedule</h1>
        <p className="text-gray-600 mb-8">Set daily study goals and track progress</p>

        <Card className="p-8 bg-white shadow-lg border-2 border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Syllabus (Optional)</h2>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50">
            <Upload className="w-6 h-6 text-green-600" />
            <span className="text-gray-700">Upload PDF, DOC, or image with syllabus</span>
            <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" />
          </label>
        </Card>

        <Card className="p-8 bg-white shadow-lg border-2 border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Daily Goal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Study Goal</label>
              <textarea 
                value={newGoal} 
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., Learn 20 cardiovascular terms from Chapter 3"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 h-24"
              />
            </div>
            <Button onClick={handleAddGoal} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 justify-center">
              <Plus className="w-5 h-5" /> Add Goal
            </Button>
          </div>
        </Card>

        <Card className="p-8 bg-white shadow-lg border-2 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Goals ({goals.length})</h2>
          {goals.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No goals yet. Add one above!</p>
          ) : (
            <div className="space-y-3">
              {goals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(goal => (
                <div key={goal.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input 
                    type="checkbox" 
                    checked={goal.completed}
                    onChange={() => handleToggleGoal(goal.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{goal.date}</p>
                    <p className={goal.completed ? "text-gray-500 line-through" : "text-gray-700"}>{goal.goal}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
