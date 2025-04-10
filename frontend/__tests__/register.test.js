// __tests__/registerPageFunctions.test.js
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock the axios module
jest.mock('axios');

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

const REGISTER_URL = 'http://localhost:3000/users/register';

const TestRegisterComponent = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
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
    <form onSubmit={handleSubmit}>
      {error && <div data-testid="error-message">{error}</div>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        data-testid="username-input"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit" data-testid="submit-button">Register</button>
    </form>
  );
};

describe('RegisterPage handleSubmit Function', () => {
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('calls axios.post and navigates on successful registration', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Registration successful' } });
    render(<TestRegisterComponent />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(axios.post).toHaveBeenCalledWith(REGISTER_URL, {
      username: 'testuser',
      password: 'password123',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(screen.queryByTestId('error-message')).toBeNull();
  });

  test('sets and displays error on failed registration', async () => {
    axios.post.mockRejectedValueOnce(new Error('Registration failed'));
    render(<TestRegisterComponent />);

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.change(usernameInput, { target: { value: 'baduser' } });
      fireEvent.change(passwordInput, { target: { value: 'badpassword' } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(axios.post).toHaveBeenCalledWith(REGISTER_URL, {
      username: 'baduser',
      password: 'badpassword',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Invalid username or password!');
  });
});