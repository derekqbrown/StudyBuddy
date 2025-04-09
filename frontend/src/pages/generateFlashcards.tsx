import React, { useState } from 'react';
import axios from 'axios';

const GENERATE_URL = 'http://localhost:3000/flashcards';
const SAVE_URL = 'http://localhost:3000/flashcards/save';

function GenerateFlashcardsPage(){
    const [prompt, setPrompt] = useState<string>('');
    const [reply, setReply] = useState<string>('');
    const [flashcardSet, setFlashcardSet] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');
    if(!token) {
        setError('You are not logged in!');
        return;
    }

    const handleSubmit = async (event) => {

        event.preventDefault();
        setError('');

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

            let rawData = response.data.reply;
            // console.log("raw: ", rawData);
            const jsonMatch = rawData.match(/```json([\s\S]*?)```/);

            const parsed = JSON.parse(jsonMatch[1].trim());
            setReply(parsed); 
            // setReply(response.data.reply);

        }
        catch(err){
            setError("Failed to generate");
        }
    }

    function userSetInput(event: React.ChangeEvent<HTMLInputElement>){
        setFlashcardSet(event.target.value);
    }


    async function saveFlashcards(){
        try{
            await axios.post(
                SAVE_URL,
                { 
                    name: flashcardSet,
                    flashcards: reply
                },
                {
                    headers:{ Authorization: `Bearer ${token}`}
                }
            );
        }
        catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || err.message || "An error occurred.");
        }
    }

    return (
        <div>
            <h2 id="question-heading">Paste in Your Notes</h2>
            <form onSubmit={handleSubmit}>
                <textarea id="prompt-area"
                    value = { prompt }
                    onChange={(e) => setPrompt(e.target.value)}
                    rows = {4}
                    cols = {50}
                    placeholder = "Paste in your notes here..."
                    required
                />
                <br/>
                <button id="submit-prompt" type='submit'>Submit</button>
            </form>

            {Array.isArray(reply) && (
                <div className="flashcard-container">
                    {reply.map((item, index) => (
                    <div key={index} className="flashcard-block">
                        <h4 className="question">Q: {item.question}</h4>
                        <p className="answer">A: {item.answer}</p>
                    </div>
                    ))}
                </div>
            )}

            <label>
                Save To: <input type="text" onChange={userSetInput} />
            </label>
            <button onClick={saveFlashcards}>Save</button>

            {error && <p className="text-red-500 font-bold mt-2">{error || String(error)}</p>}
        </div>
    );
}


export default GenerateFlashcardsPage