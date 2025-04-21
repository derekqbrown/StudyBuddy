import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PROFILE_URL = `${BASE_URL}/users`;

function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
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

    const fetchProfile = async () => {
      try {
        const response = await axios.get(PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("profile data: ", response.data);

        // setProfile(response.data);
        setRole(response.data.role);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch profile");
      }
    };

    fetchProfile();
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
              onClick={() => {
                if (userRole === 'Teacher') {
                  navigate("/assign-exam");
                } else {
                  navigate("/view-exam-set");
                }
              }}
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
