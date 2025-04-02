import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const CHAT_URL = 'http://localhost:3000/chat';

function ChatPage(){
    const [prompt, setPrompt] = useState<string>('');
    const [reply, setReply] = useState<string>('');
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (event)=> {

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Not logged in');
            return;
        }

        console.log(token);

        event.preventDefault();
        setError('');

        try{
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
            setError(err.message);
        }
    }

    return (
        <div>
          <h2 id="question-heading">Ask a Question</h2>
          <form onSubmit={handleSubmit}>
            <textarea id="prompt-area"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
              cols={50}
              placeholder="Type your question here..."
              required
            />
            <br />
            <button id="submit-prompt" type="submit">
              Submit
            </button>
          </form>
          {error && <p className="text-red-500 font-bold mt-2">{error}</p>}
    
          {reply && (
            <div id="reply-container">
              <h3 id="reply-block">StudyBuddy Says: </h3>
              <ReactMarkdown>{reply}</ReactMarkdown>
            </div>
          )}
          
        </div>
    );
}

export default ChatPage;