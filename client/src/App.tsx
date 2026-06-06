import { Toaster } from "@/components/ui/sonner";
import { Route, Switch } from "wouter";
import { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { UserProvider, useUser } from "./contexts/UserContext";
import { FirebaseProvider, useFirebase } from "./contexts/FirebaseContext";
import { PaletteProvider, usePalette } from "./contexts/ThemeContext";
import { useFirebaseSync } from "./hooks/useFirebaseSync";
import { subscribeToTeachers, getTermOverrides, getChapterOverrides, getCustomTerms, getChapterOrder } from "./firebase/firestoreService";
import { applyTermOverrides, applyChapterOverrides, addCustomTerms, applyChapterOrder } from "./data/medicalData";
import LoginGate from "./pages/v2/LoginGate";
import Dashboard from "./pages/v2/Dashboard";
import TeacherDashboard from "./pages/v2/TeacherDashboard";
import DictionarySearch from "./pages/v2/DictionarySearch";
import RootBuilder from "./pages/v2/RootBuilder";
import FlashcardsHub from "./pages/v2/FlashcardsHub";
import GameSelector from "./pages/v2/GameSelector";
import PracticeTest from "./pages/v2/PracticeTest";
import DailyChallenge from "./pages/v2/DailyChallenge";
import ChapterSummary from "./pages/v2/ChapterSummary";
import MultipleChoice from "./pages/v2/games/MultipleChoice";
import LinguisticAutopsy from "./pages/v2/games/LinguisticAutopsy";
import TextbookDefender from "./pages/v2/games/TextbookDefender";
import CombiningFormLinker from "./pages/v2/games/CombiningFormLinker";
import ChartAuditor from "./pages/v2/games/ChartAuditor";
import IschemicCountdown from "./pages/v2/games/IschemicCountdown";
import SpellingBee from "./pages/v2/games/SpellingBee";
import HangmanGame from "./pages/v2/games/HangmanGame";
import MemoryMatch from "./pages/v2/games/MemoryMatch";
import ModeratorDashboard from "./pages/v2/ModeratorDashboard";
import MultiplayerHub from "./pages/v2/multiplayer/MultiplayerHub";
import GameRoom from "./pages/v2/multiplayer/GameRoom";
import SystemExplorer from "./pages/v2/SystemExplorer";
import ChatHub from "./pages/v2/ChatHub";

const IS_HOST = (u: string) => u.toLowerCase() === "anatomixowner";

function AppRoutes() {
  const { user } = useUser();
  const { db, ready } = useFirebase();
  const [teachers, setTeachers] = useState<string[]>([]);

  useEffect(() => {
    if (!db || !ready) return;
    const unsub = subscribeToTeachers(db, setTeachers);
    return unsub;
  }, [db, ready]);

  if (!user) return <LoginGate />;
  const isHost = IS_HOST(user.username);
  const isTeacher = !isHost && teachers.includes(user.username.toLowerCase());

  const HomeComponent = isHost ? ModeratorDashboard : isTeacher ? TeacherDashboard : Dashboard;

  return (
    <Switch>
      <Route path="/" component={HomeComponent} />
      <Route path="/moderator" component={ModeratorDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/multiplayer" component={MultiplayerHub} />
      <Route path="/game-room/:code" component={GameRoom} />
      <Route path="/body-reference" component={SystemExplorer} />
      <Route path="/explorer" component={SystemExplorer} />
      <Route path="/games/spelling-bee" component={SpellingBee} />
      <Route path="/games/hangman" component={HangmanGame} />
      <Route path="/games/memory-match" component={MemoryMatch} />
      <Route path="/dictionary" component={DictionarySearch} />
      <Route path="/root-builder" component={RootBuilder} />
      <Route path="/flashcards" component={FlashcardsHub} />
      <Route path="/games" component={GameSelector} />
      <Route path="/practice-test" component={PracticeTest} />
      <Route path="/daily-challenge" component={DailyChallenge} />
      <Route path="/chapter-summary/:num" component={ChapterSummary} />
      <Route path="/games/multiple-choice" component={MultipleChoice} />
      <Route path="/games/linguistic-autopsy" component={LinguisticAutopsy} />
      <Route path="/games/textbook-defender" component={TextbookDefender} />
      <Route path="/games/combining-linker" component={CombiningFormLinker} />
      <Route path="/games/chart-auditor" component={ChartAuditor} />
      <Route path="/games/ischemic-countdown" component={IschemicCountdown} />
      <Route path="/chat" component={ChatHub} />
      <Route component={HomeComponent} />
    </Switch>
  );
}

function InnerApp() {
  useFirebaseSync();
  const { filter } = usePalette();
  const { db, ready } = useFirebase();

  useEffect(() => {
    if (!db || !ready) return;
    getTermOverrides(db).then(overrides => {
      if (Object.keys(overrides).length > 0) {
        applyTermOverrides(overrides as Record<string, Record<string, never>>);
      }
    });
    getChapterOverrides(db).then(overrides => {
      if (Object.keys(overrides).length > 0) {
        applyChapterOverrides(overrides);
      }
    });
    getCustomTerms(db).then(terms => {
      if (terms.length > 0) addCustomTerms(terms);
    });
    getChapterOrder(db).then(nums => {
      if (nums.length > 0) applyChapterOrder(nums);
    });
  }, [db, ready]);

  return (
    <div style={{ filter, minHeight: "100vh", transition: "filter 0.3s ease" }}>
      <Toaster />
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <FirebaseProvider>
      <ErrorBoundary>
        <UserProvider>
          <PaletteProvider>
            <InnerApp />
          </PaletteProvider>
        </UserProvider>
      </ErrorBoundary>
    </FirebaseProvider>
  );
}

export default App;
