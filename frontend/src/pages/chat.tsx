import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CHAT_URL = `${BASE_URL}/chat`;

function ChatPage(){
    const [prompt, setPrompt] = useState<string>('');
    const [reply, setReply] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');
    if(!token) {
        setError('Not logged in!');
        return <Navigate to="/login"/>;
    }
    const handleSubmit = async (event: { preventDefault: () => void; })=> {

        console.log(token);

        event.preventDefault();
        setError('');

        try{
            if(!prompt){
              throw new Error("Prompt is required");
            }
            const response = await axios.post(
                CHAT_URL,
                { prompt },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setReply(response.data.reply);
        }catch(err){
            setError("Failed to generate a response");
        }
    }

    return (
    <div className="flex flex-col items-center justify-center py-6">
        <div className="top-0 left-0 w-full p-4  z-10 text-center shadow-md mb-5 ">
            <h2 className="text-2xl font-bold text-white">Chat</h2>
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6 pt-1">
          <h3 id="question-heading" className="text-3xl font-semibold text-gray-800 text-center">
              Hello, I'm StudyBuddy AI. 
          </h3>
          <p className="text-lg text-gray-700 text-center">
            I can answer your questions on any topic. Simply type your question and hit the submit button
          </p>
          <form className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4" onSubmit={handleSubmit}>
              <textarea
                  id="prompt-area"
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300 focus:border-blue-500"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3} 
                  placeholder="Type your question here..."
                  required
              />
              <button
                  className="bg-blue-500 h-1/2 place-content-center hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300"
                  id="submit-prompt"
                  type="submit"
              >
                  Submit
              </button>
          </form>
          {error && <p className="text-red-500 font-bold mt-4 text-center">{error}</p>}
  
          {reply && (
              <div id="reply-container" className="bg-gray-50 rounded-md p-4 shadow-inner">
                  <h3 id="reply-block" className="text-lg font-semibold text-blue-600 mb-2">
                      StudyBuddy Says:
                  </h3>
                  <div className="prose prose-sm md:prose">
                      <ReactMarkdown>{reply}</ReactMarkdown>
                  </div>
              </div>
          )}
    </div>
    </div>
    );
}

export default ChatPage;