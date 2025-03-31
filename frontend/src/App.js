// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import ProfilePage from './pages/profile';
import ChatPage from './pages/chat';
import GenerateFlashcardsPage from './pages/generateFlashcards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/generateflashcards" element={<GenerateFlashcardsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
