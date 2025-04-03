// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login.tsx';
import RegisterPage from './pages/register.tsx';
import ProfilePage from './pages/profile.tsx';
import ChatPage from './pages/chat.tsx';
import GenerateFlashcardsPage from './pages/generateFlashcards.tsx'; 
import Homepage from "./pages/homepage.tsx";
import ViewFlashcards from "./pages/viewFlashcards.tsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/generateflashcards" element={<GenerateFlashcardsPage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/flashcards/:setid" element={<ViewFlashcards />} />
        </Routes>
    </Router>
  );
}

export default App;
