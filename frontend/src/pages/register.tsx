import React, { FormEvent, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const REGISTER_URL = 'http://34.217.210.224:3000/users/register';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const textInputClasses =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2';
  const textLabelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post(REGISTER_URL, {
        username,
        password,
      });
      navigate('/');
    } catch (err) {
      console.log(err);
      const errorMessage = 'Invalid username or password!';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Register
        </h2>
        {error && <p className="text-red-500 font-bold mt-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={textLabelClasses} htmlFor="username">
              Username:
            </label>
            <input
              className={textInputClasses}
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={textLabelClasses} htmlFor="password">
              Password:
            </label>
            <input
              className={textInputClasses}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <select 
              id="role" 
              value={role}
              onChange={(e) => setRole(e.target.value)}>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>
          <button
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2 text-white transition-colors duration-200 rounded-md"
            type="submit"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;