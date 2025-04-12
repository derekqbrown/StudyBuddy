import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const VIEW_DETAILED_SET_URL = 'http://localhost:3000/flashcards';

interface Flashcard {
  question: string;
  answer: string;
}

function ViewFlashcardsPage() {
  const { setName } = useParams<{ setName: string }>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in!');
      return;
    }

    async function fetchFlashcards() {
      try {
        const response = await axios.get(
          `${VIEW_DETAILED_SET_URL}/${setName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const nestedFlashcards = response.data;
        const allFlashcards = nestedFlashcards.flatMap((item: { flashcards: Flashcard[] }) => item.flashcards);
        setFlashcards(allFlashcards);
        setFlipped(new Array(allFlashcards.length).fill(false));
      } catch (err) {
        console.error(err);
        setError('Failed to load flashcards.');
      }
    }

    fetchFlashcards();
  }, [setName]);

  const toggleFlip = (index: number) => {
    setFlipped(prev => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  return (
    <div style={styles.container}>
      <h2>Flashcard Set: {setName}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {flashcards.length === 0 && !error ? (
        <p>No flashcards found.</p>
      ) : (
        <div style={styles.flashcardContainer}>
          {flashcards.map((card, index) => (
            <div
              key={index}
              onClick={() => toggleFlip(index)}
              style={styles.flashcard}
            >
              <div
                style={{
                  ...styles.flashcardInner,
                  transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
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
}

// Inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  flashcardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  flashcard: {
    width: '200px',
    height: '150px',
    perspective: '1000px',
    cursor: 'pointer',
  },
  flashcardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
  },
  flashcardFront: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#3498db',
    color: 'white',
    padding: '10px',
    fontSize: '18px',
    textAlign: 'center',
  },
  flashcardBack: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '10px',
    fontSize: '18px',
    transform: 'rotateY(180deg)',
    textAlign: 'center',
  },
};

export default ViewFlashcardsPage;
