// __tests__/loginPage.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../src/pages/login';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock the axios module
jest.mock('axios');

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });



  test('shows error message on failed login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login failed'));

    renderWithRouter();

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify that the error message is displayed
    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});
