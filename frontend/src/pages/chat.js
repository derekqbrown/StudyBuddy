import React, { useState } from 'react';
import axios from 'axios';

const CHAT_URL = 'http://localhost:3000/chat';

function ChatPage(){
    const [prompt, setPrompt] = useState('');
    const [reply, setReply] = useState('');
    const [error, setError] = useState(null);


    const handleSubmit = async (event)=> {

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Not logged in');
            return;
        }

        console.log(token);

        event.preventDefault();
        setError(null);

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
          <h2>Ask a Question</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              cols={50}
              placeholder="Type your question here..."
              required
            />
            <br />
            <button type="submit" >
            </button>
          </form>
    
          {reply && (
            <div>
              <h3>Gemini says:</h3>
              <p>{reply}</p>
            </div>
          )}
    
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ChatPage;