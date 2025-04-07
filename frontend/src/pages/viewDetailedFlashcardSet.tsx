import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const VIEW_DETAILED_SET_URL = 'http://localhost:3000/flashcards/flashcardSet';


function ViewDetailedSet(){
    interface Flashcards {
        Key: string;
    }

    const [flashcards, setFlashcards] = useState<Flashcards []>([]);
    const { setName } = useParams<{ setName: string }>();
    const [error, setError] = useState('');
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token){
            setError("You are not logged in!");
            return;
        }

        async function openSet(){
            try{
                const response = await axios.get(
                    `${VIEW_DETAILED_SET_URL}/${setName}`,
                    {headers: {Authorization: `Bearer ${token}`}}
                )

                // console.log(response.data);

                const cards = response.data;

                setFlashcards(cards);

            }catch(err){
                console.log(err);
            }
        }

        openSet();
    }, []);

    return (
        <>
            <h1>{setName}</h1>

            {flashcards.length === 0 ? (
                <p>Empty Set</p>
            ) : (
                <ul>
                    {flashcards.map((card,index) => (
                        <li key={index} className="mb-2">
                            <Link to={`/flashcards/${setName}/${card.Key.split('/').pop()?.replace('.json', '')}`}>
                                {card.Key.split('/').pop()?.replace('.json', '')}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}


export default ViewDetailedSet