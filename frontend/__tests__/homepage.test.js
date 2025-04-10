import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import Homepage from '../src/pages/homepage';
import { BrowserRouter } from 'react-router-dom';

//mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const localStorage = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    }
  };
})();

beforeEach(() => {
  localStorage.clear();
  mockedNavigate.mockClear();
});

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Homepage />
    </BrowserRouter>
  );
};

test('renders welcome message', () => {
  renderWithRouter();
  expect(screen.getByText(/welcome to study buddy/i)).toBeInTheDocument();
});

test('shows Login and Register buttons when not logged in', () => {
  renderWithRouter();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});


test('navigates to login on Login button click', () => {
  renderWithRouter();
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(mockedNavigate).toHaveBeenCalledWith('/login');
});

