import { BrowserRouter as Router, Routes, Route, useLocation  } from 'react-router-dom';
import LoginPage from './pages/login.tsx';
import RegisterPage from './pages/register.tsx';
import ProfilePage from './pages/profile.tsx';
import ChatPage from './pages/chat.tsx';
import GenerateFlashcardsPage from './pages/generateFlashcards.tsx'; 
import Homepage from "./pages/homepage.tsx";
import ViewFlashcardSets from "./pages/viewFlashcardSets.tsx";
import ViewDetailedSet from './pages/viewDetailedFlashcardSet.tsx';
import LoggedInNavbar from './components/navigation.tsx';

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== '/' && <LoggedInNavbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/generateflashcards" element={<GenerateFlashcardsPage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/flashcardSets" element={<ViewFlashcardSets />} />
        <Route path="/flashcardSets/:setName" element={<ViewDetailedSet />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;