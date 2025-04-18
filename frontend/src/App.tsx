import { BrowserRouter as Router, Routes, Route, useLocation  } from 'react-router-dom';
import React, { useEffect } from 'react';
import LoginPage from './pages/login.tsx';
import RegisterPage from './pages/register.tsx';
import ProfilePage from './pages/profile.tsx';
import ChatPage from './pages/chat.tsx';
import GenerateFlashcardsPage from './pages/generateFlashcards.tsx'; 
import Homepage from "./pages/homepage.tsx";
import ViewFlashcardSets from "./pages/viewFlashcardSets.tsx";
import ViewDetailedSet from './pages/viewDetailedFlashcardSet.tsx';
import GenerateExamPage from './pages/generateExams.tsx';
import LoggedInNavbar from './components/navigation.tsx';
import AssignExamSetPage from './pages/assignExamSet.tsx';
import AssignExamPage from './pages/assignExam.tsx';
import TakeExam from './pages/takeExam.tsx';

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Window is closing or navigating away - removing token...');
      localStorage.removeItem('token');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); 

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
        <Route path="/generateExam" element={<GenerateExamPage/>}/>
        <Route path="/assign-exam" element={<AssignExamSetPage />}/>
        <Route path="/exams/take/:examId/:examSetName" element={<TakeExam />} />
        <Route path="/assign-exam/:setName" element={<AssignExamPage />} />
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