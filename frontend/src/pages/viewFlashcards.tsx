import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const FLASHCARD_URL = "http://localhost:3000/flashcards"; 

const ViewFlashcardsPage: React.FC = () => {
  const { setName, setid } = useParams<{ setName: string; setid: string }>();
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<{ [key: number]: boolean }>({});


  useEffect(() => {
    const fetchFlashcards = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in!");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${FLASHCARD_URL}/${setName}/${setid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFlashcards(response.data.flashcards);
      } catch (err) {
        setError("Failed to load flashcards.");
        console.error("Error fetching flashcards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [setid]);

  const toggleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) return <p>Loading flashcards...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
<div style={styles.container}>
  <h2>Flashcard Set</h2>
  {flashcards.length === 0 ? (
    <p>No flashcards found.</p>
  ) : (
    <div style={styles.flashcardContainer}>
      {flashcards.map((card, index) => (
        <div
          key={index}
          onClick={() => toggleFlip(index)}
          style={styles.flashcard}
        >
          <div style={{
            ...styles.flashcardInner,
            transform: flipped[index] ? "rotateY(180deg)" : "rotateY(0deg)"
          }}>
            <div style={styles.flashcardFront}>
              <p><strong>Q:</strong> {card.question}</p>
            </div>
            <div style={styles.flashcardBack}>
              <p><strong>A:</strong> {card.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
  );
};

// Inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    padding: "20px",
  },
  flashcardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
  },
  flashcard: {
    width: "200px",
    height: "150px",
    perspective: "1000px",
    cursor: "pointer",
    transition: "transform 0.6s",
  },
  flashcardInner: {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s",
  },
  flashcardFront: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px",
    fontSize: "18px", 
  },
  flashcardBack: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#2ecc71",
    color: "white",
    padding: "10px",
    fontSize: "18px",
    transform: "rotateY(180deg)",
  },
};

export default ViewFlashcardsPage;
