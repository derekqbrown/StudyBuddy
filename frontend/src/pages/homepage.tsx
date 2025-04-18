import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#3B82F6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
    width: "200px",
    margin: "8px 0",
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
    (e.target as HTMLButtonElement).style.backgroundColor = "#2563EB";
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.transform = "scale(1)";
    (e.target as HTMLButtonElement).style.backgroundColor = "#3B82F6";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const timer = setTimeout(() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
      }, 45 * 60 * 1000); // 45 minutes in ms

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: "16px",
        background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "40px",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        Welcome to Study Buddy
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {isLoggedIn ? (
          <>
            <button
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={() => navigate("/chat")}
            >
              Chat
            </button>
            <button
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={() => navigate("/generateflashcards")}
            >
              Flashcard
            </button>
            <button
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={() => navigate("/assign-exam")}
            >
              Exams
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: "#EF4444" }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#DC2626";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.transform = "scale(1)";
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#EF4444";
              }}
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Homepage;
