import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FirebaseProvider } from "./contexts/FirebaseContext";
// Pages
import Home from "./pages/Home";
import StudyDecks from "./pages/StudyDecks";
import Hangman from "./pages/Hangman";
import SpellingBee from "./pages/SpellingBee";
import SimilarTermsQuiz from "./pages/SimilarTermsQuiz";
import GameHub from "./pages/GameHub";
import Matching from "./pages/Matching";
import Memory from "./pages/Memory";
import Trivia from "./pages/Trivia";
import TermBuilder from "./pages/TermBuilder";
import Crossword from "./pages/Crossword";
import WordSearch from "./pages/WordSearch";
import MainMenu from "./pages/MainMenu";
import WordBuilding from "./pages/WordBuilding";
import Dictionary from "./pages/Dictionary";
import Flashcards from "./pages/Flashcards";
import Quizzes from "./pages/Quizzes";
import SimilarTerms from "./pages/SimilarTerms";
import Anatomy from "./pages/Anatomy";
import Progress from "./pages/Progress";
import StudyTips from "./pages/StudyTips";
import UploadSyllabus from "./pages/UploadSyllabus";
import FocusHere from "./pages/FocusHere";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/main-menu" component={MainMenu} />
      <Route path="/word-building" component={WordBuilding} />
      <Route path="/dictionary" component={Dictionary} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/quizzes" component={Quizzes} />
      <Route path="/similar-terms" component={SimilarTerms} />
      <Route path="/anatomy" component={Anatomy} />
      <Route path="/progress" component={Progress} />
      <Route path="/study-tips" component={StudyTips} />
      <Route path="/upload-syllabus" component={UploadSyllabus} />
      <Route path="/focus-here" component={FocusHere} />
      <Route path="/study-decks" component={StudyDecks} />
      <Route path="/game-hub" component={GameHub} />
      <Route path="/hangman" component={Hangman} />
      <Route path="/spelling-bee" component={SpellingBee} />
      <Route path="/matching" component={Matching} />
      <Route path="/memory" component={Memory} />
      <Route path="/trivia" component={Trivia} />
      <Route path="/term-builder" component={TermBuilder} />
      <Route path="/crossword" component={Crossword} />
      <Route path="/word-search" component={WordSearch} />
      <Route path="/similar-terms-quiz" component={SimilarTermsQuiz} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}

export default App;
