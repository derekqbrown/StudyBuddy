import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/homepage.css";


function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      {isLoggedIn ? (
        <>
          <button onClick={() => navigate('/chat')}>Chat</button>
          <button onClick={() => navigate('/flashcards')}>Flashcard</button>
        </>
      ) : (
        <>
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </>
      )}
    </div>
  );
}

export default Homepage;
