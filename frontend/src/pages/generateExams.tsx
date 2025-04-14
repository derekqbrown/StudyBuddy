import React, { useState } from 'react';
import axios from 'axios';

const GENERATE_EXAM_URL = 'http://localhost:3000/exams/create-exam';
const SAVE_EXAM_URL = 'http://localhost:3000/exams/save';

function GenerateExamPage() {
    const [prompt, setPrompt] = useState('');
    const [reply, setReply] = useState<string>('');
    const [examSet, setExamSet] = useState<string>('');
    const [error, setError] = useState<string | null>('');
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    }

    async function userSetInput(){

    }

    async function saveExam(){

    }
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-400 py-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 id="question-heading" className="text-3xl font-semibold text-gray-800 text-center">
                    Generate Exams
                </h2>
                <p className="text-lg text-gray-700 text-center">
                    Paste your notes below to generate exams.
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
                        Generate Exam
                    </button>
                </form>

                {Array.isArray(reply) && reply.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 text-center">Generated Exam</h3>
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
                                onClick={saveExam}
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

export default GenerateExamPage