import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const buttonClasses = "bg-blue-500 text-white border-none px-5 py-2 rounded cursor-pointer text-base transition-colors duration-300 focus:outline-none hover:scale-102";

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
          <button className={buttonClasses} onClick={() => navigate('/chat')}>
            Chat
          </button>
          <button className={buttonClasses} onClick={() => navigate('/flashcards')}>
            Flashcard
          </button>
        </>
      ) : (
        <>
          <button className={buttonClasses} onClick={() => navigate('/login')}>
            Login
          </button>
          <button className={buttonClasses} onClick={() => navigate('/register')}>
            Register
          </button>
        </>
      )}
    </div>
  );
}

export default Homepage;
