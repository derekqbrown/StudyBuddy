import React, { useState } from 'react';
import axios from 'axios';

const GENERATE_URL = 'http://localhost:3000/chat//flashcards';

function GenerateFlashcardsPage(){
    const [prompt, setPrompt] = useState('');
    const [reply, setReply] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        const token = localStorage.getItem('token');
        if(!token) {
            setError('You are not logged in!');
            return;
        }

        event.preventDefault();
        setError(null);

        try{
            const response = await axios.post(
                GENERATE_URL,
                { prompt },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            setReply(response.data.reply);
        }
        catch(err){
            setError(err);
        }
    }

    return (
        <div>
            <h2>Paste in Your Notes</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value = { prompt }
                    onChange={(e) => setPrompt(e.target.value)}
                    rows = {4}
                    cols = {50}
                    placeholder = "Paste in your notes here..."
                    required
                />
                <br/>
                <button type='submit'></button>
            </form>

            {reply && (
                <div>
                    <h3> StudyBuddy Says: </h3>
                    <p>{reply}</p>
                </div>
            )}

            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
}


export default GenerateFlashcardsPage