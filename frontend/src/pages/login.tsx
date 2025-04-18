import React, { useState, FormEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

const LOGIN_URL = 'http://34.217.210.224:3000/users/login';

interface LoginPageProps {
  // Add any props if needed (in this case, none are directly passed)
}

interface LoginResponse {
  token: string;
}

function LoginPage(props: LoginPageProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const textInputClasses ="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2";
  const textLabelClasses ="block text-sm font-medium text-gray-700 mb-1";


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(LOGIN_URL, {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-500"> {}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"> {}
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Login</h2> {}
        {error && <p className="text-red-500 font-bold mt-2">{error}</p>} {}
        <form onSubmit={handleSubmit} className="space-y-4"> {}
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
          <button
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2 text-white transition-colors duration-200 rounded-md"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;