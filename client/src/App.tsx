import { Toaster } from "@/components/ui/sonner";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { UserProvider, useUser } from "./contexts/UserContext";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { useFirebaseSync } from "./hooks/useFirebaseSync";
import LoginGate from "./pages/v2/LoginGate";
import Dashboard from "./pages/v2/Dashboard";
import SystemExplorer from "./pages/v2/SystemExplorer";
import DictionarySearch from "./pages/v2/DictionarySearch";
import RootBuilder from "./pages/v2/RootBuilder";
import FlashcardsHub from "./pages/v2/FlashcardsHub";
import GameSelector from "./pages/v2/GameSelector";
import PracticeTest from "./pages/v2/PracticeTest";
import DailyChallenge from "./pages/v2/DailyChallenge";
import ChapterSummary from "./pages/v2/ChapterSummary";
import MultipleChoice from "./pages/v2/games/MultipleChoice";
import TypingQuiz from "./pages/v2/games/TypingQuiz";
import LinguisticAutopsy from "./pages/v2/games/LinguisticAutopsy";
import ChartTriage from "./pages/v2/games/ChartTriage";
import TextbookTrap from "./pages/v2/games/TextbookTrap";
import RootRace from "./pages/v2/games/RootRace";
import RootSwap from "./pages/v2/games/RootSwap";
import StructuralHole from "./pages/v2/games/StructuralHole";
import TextbookDefender from "./pages/v2/games/TextbookDefender";
import CombiningFormLinker from "./pages/v2/games/CombiningFormLinker";
import ChartAuditor from "./pages/v2/games/ChartAuditor";
import IschemicCountdown from "./pages/v2/games/IschemicCountdown";
import BossRound from "./pages/v2/games/BossRound";
import SpellingBee from "./pages/v2/games/SpellingBee";
import HangmanGame from "./pages/v2/games/HangmanGame";
import MemoryMatch from "./pages/v2/games/MemoryMatch";
import ModeratorDashboard from "./pages/v2/ModeratorDashboard";
import MultiplayerHub from "./pages/v2/multiplayer/MultiplayerHub";
import GameRoom from "./pages/v2/multiplayer/GameRoom";
import BodyReference from "./pages/v2/BodyReference";

const IS_HOST = (u: string) => u.toLowerCase() === "gameshowhost";

function AppRoutes() {
  const { user } = useUser();
  if (!user) return <LoginGate />;
  const isHost = IS_HOST(user.username);

  return (
    <Switch>
      <Route path="/" component={isHost ? ModeratorDashboard : Dashboard} />
      <Route path="/moderator" component={ModeratorDashboard} />
      <Route path="/multiplayer" component={MultiplayerHub} />
      <Route path="/game-room/:code" component={GameRoom} />
      <Route path="/body-reference" component={BodyReference} />
      <Route path="/boss-round" component={BossRound} />
      <Route path="/games/spelling-bee" component={SpellingBee} />
      <Route path="/games/hangman" component={HangmanGame} />
      <Route path="/games/memory-match" component={MemoryMatch} />
      <Route path="/explorer" component={SystemExplorer} />
      <Route path="/dictionary" component={DictionarySearch} />
      <Route path="/root-builder" component={RootBuilder} />
      <Route path="/flashcards" component={FlashcardsHub} />
      <Route path="/games" component={GameSelector} />
      <Route path="/practice-test" component={PracticeTest} />
      <Route path="/daily-challenge" component={DailyChallenge} />
      <Route path="/chapter-summary/:num" component={ChapterSummary} />
      <Route path="/games/multiple-choice" component={MultipleChoice} />
      <Route path="/games/typing-quiz" component={TypingQuiz} />
      <Route path="/games/linguistic-autopsy" component={LinguisticAutopsy} />
      <Route path="/games/chart-triage" component={ChartTriage} />
      <Route path="/games/textbook-trap" component={TextbookTrap} />
      <Route path="/games/root-race" component={RootRace} />
      <Route path="/games/root-swap" component={RootSwap} />
      <Route path="/games/structural-hole" component={StructuralHole} />
      <Route path="/games/textbook-defender" component={TextbookDefender} />
      <Route path="/games/combining-linker" component={CombiningFormLinker} />
      <Route path="/games/chart-auditor" component={ChartAuditor} />
      <Route path="/games/ischemic-countdown" component={IschemicCountdown} />
      <Route component={isHost ? ModeratorDashboard : Dashboard} />
    </Switch>
  );
}

function InnerApp() {
  useFirebaseSync();
  return (
    <>
      <Toaster />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <FirebaseProvider>
      <ErrorBoundary>
        <UserProvider>
          <InnerApp />
        </UserProvider>
      </ErrorBoundary>
    </FirebaseProvider>
  );
}

export default App;
