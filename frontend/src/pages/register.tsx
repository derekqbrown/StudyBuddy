import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const REGISTER_URL = 'http://localhost:3000/users/register';

function RegisterPage(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try{
            await axios.post(
                REGISTER_URL,
                { 
                    username,
                    password
                }
            );
            navigate('/');
        }
        catch(err){
            console.log(err);
            const errorMessage = "Invalid username or password!";
            setError(errorMessage);
        }
    };

    return(
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}> 
                <div>
                    <label>Username: </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                </div>
                <div>
                    <label> Password: </label>
                        <input
                            id="password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                </div>
                <button type="submit">
                    Register
                </button>
            </form>
            {error && <p className="text-red-500 font-bold mt-2">{error}</p>}
        </div>
        
        
    )
}


export default RegisterPage;