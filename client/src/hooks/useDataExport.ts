export function useDataExport() {
  const exportData = () => {
    const data = {
      terms: localStorage.getItem("customTerms"),
      flashcards: localStorage.getItem("study_sanctuary_flashcard_state"),
      problems: localStorage.getItem("problemTerms"),
      goals: localStorage.getItem("studyGoals"),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-knowledge-backup-${Date.now()}.json`;
    a.click();
  };

  const importData = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.terms) localStorage.setItem("customTerms", data.terms);
          if (data.flashcards) localStorage.setItem("study_sanctuary_flashcard_state", data.flashcards);
          if (data.problems) localStorage.setItem("problemTerms", data.problems);
          if (data.goals) localStorage.setItem("studyGoals", data.goals);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  };

  return { exportData, importData };
}
