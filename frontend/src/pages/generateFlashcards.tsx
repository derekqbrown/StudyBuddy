import React, { useState } from 'react';
import { Link, Navigate } from "react-router-dom";
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GENERATE_URL = `${BASE_URL}/flashcards`;
const SAVE_URL = `${BASE_URL}/flashcards/save`;

function GenerateFlashcardsPage(){
    const [prompt, setPrompt] = useState<string>('');
    const [reply, setReply] = useState<string>('');
    const [flashcardSet, setFlashcardSet] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');
    if(!token) {
        setError('Not logged in!');
        return <Navigate to="/login"/>;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
            setPrompt('');
            // setReply(response.data.reply);
            setError('');
        }
        catch(err){
            setError("Failed to generate");
        }
    }

    function userSetInput(event: React.ChangeEvent<HTMLInputElement>){
        setFlashcardSet(event.target.value);
    }

    async function saveFlashcards(){
        const token = localStorage.getItem('token');
        if(!token) {
            setError('Not logged in!');
            return;
        }

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
            alert("Flashcard Set Saved Successfully");
            setFlashcardSet('');
            setReply('');
            setPrompt('');
            setError('');
        }
        catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || err.message || "An error occurred.");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-6">
            <div className="top-0 left-0 w-full p-4 z-10 text-center shadow-md">
                <h2 className="text-2xl font-bold text-white">Flashcards</h2>
            </div>
            <div className="p-6">
                <button
                    className="px-4 py-2 bg-white text-purple-600 rounded shadow hover:bg-blue-300 transition"
                >
                    <Link
                            to="/flashcardSets"
                        >
                        View Flashcard Sets
                    </Link>
                </button>
            </div>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 id="question-heading" className="text-3xl font-semibold text-gray-800 text-center">
                    Generate Flashcards
                </h2>
                <p className="text-lg text-gray-700 text-center">
                    Paste your notes below to generate flashcards.
                </p>
                <form className="flex flex-col items-center space-y-4" onSubmit={handleSubmit}>
                    <textarea
                        id="prompt-area"
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300 focus:border-blue-500"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6} 
                        placeholder="Paste your notes here..."
                        required
                    />
                    <button
                        id="submit-prompt"
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 m-3 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Generate Flashcards
                    </button>
                </form>

                {Array.isArray(reply) && reply.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 text-center">Generated Flashcards</h3>
                        <div className="rounded-md shadow-sm divide-y divide-gray-200">
                            {reply.map((item, index) => (
                                <div key={index} className="p-4">
                                    <h4 className="font-semibold text-blue-600">Q: {item.question}</h4>
                                    <p className="text-gray-700 mt-1">A: {item.answer}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4 mt-4">
                            <label htmlFor="set-name" className="block text-gray-700 text-sm font-bold">
                                Save As:
                            </label>
                            <input
                                type="text"
                                id="set-name"
                                onChange={userSetInput}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
                                placeholder="Set Name"
                            />
                            <button
                                onClick={saveFlashcards}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-500 font-bold mt-6 text-center">{error}</p>}
            </div>
        </div>
    );
}

export default GenerateFlashcardsPage