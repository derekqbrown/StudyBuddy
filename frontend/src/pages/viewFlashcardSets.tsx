import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VIEW_FLASHCARD_SET_URL = 'http://localhost:3000/flashcards/all-flashcards';

function ViewFlashcardSet(){
    interface FlashcardSet {
        setName: string;
    }

    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token){
            setError("You are not logged in!");
            return;
        }

        const fetchSets = async () => {
            try{
                const response = await axios.get(
                    VIEW_FLASHCARD_SET_URL,
                    {
                        headers: {Authorization: `Bearer ${token}`}
                    }
                );
        
                setFlashcardSets(response.data);
            }
            catch(err){
                console.log(err);
            }
        }

        fetchSets();
    }, [])
    

    return(
        <div>
            <h1>Your Flashcard Sets</h1>

            {flashcardSets.length === 0 ? (
                <p>No set found</p>
            ) : (
                <ul>
                    {flashcardSets.map((set,index) => (
                        <li key={index} className="mb-2">
                            <strong>{set.setName}</strong>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}


export default ViewFlashcardSet