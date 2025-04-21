import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
//import viewDetailedSet from './viewDetailedFlashcardSet';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VIEW_FLASHCARD_SET_URL = `${BASE_URL}/flashcards/all-flashcards`;

function ViewFlashcardSet(){
    // interface FlashcardSet {
    //     setName: string;
    // }

    const [flashcardSets, setFlashcardSets] = useState<[]>([]);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    if(!token) {
        setError('Not logged in!');
        return <Navigate to="/login"/>;
    }
    useEffect(() => {

        const fetchSets = async () => {
            try{
                const response = await axios.get(
                    VIEW_FLASHCARD_SET_URL,
                    {
                        headers: {Authorization: `Bearer ${token}`}
                    }
                );
                
                console.log("response: ", response.data);

                setFlashcardSets(response.data);
            }
            catch(err){
                console.log(err);
            }
        }

        fetchSets();
    }, [])
    

    return(
        <div className="mt-6 space-y-4 text-center">
            <h1 className="text-xl font-semibold text-white text-center">Your Flashcard Sets</h1>

            {flashcardSets.length === 0 ? (
                <p className="text-white">No set found</p>
            ) : (
                <ul className="text-purple-700">
                    {flashcardSets.map((set,index) => (
                        <li key={index} className="mb-2">
                            <button className="py-2 px-4 m-2 bg-white hover:bg-blue-300 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2  transition-colors duration-200 rounded-md"
                            >
                            <Link to={`/flashcardSets/${set}`}>{set}</Link>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}


export default ViewFlashcardSet