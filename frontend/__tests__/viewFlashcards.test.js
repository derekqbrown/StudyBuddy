import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ViewFlashcardsPage from '../src/pages/viewFlashcards';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');
const mockedAxios = axios;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ 
    setName: 'test-set',
    setid: '123'
  }),
}));

describe('ViewFlashcardsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('shows error when not logged in', () => {
    render(
      <MemoryRouter>
        <ViewFlashcardsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/You are not logged in!/i)).toBeInTheDocument();
    expect(screen.getByText(/You are not logged in!/i)).toHaveStyle('color: red');
  });

  test('displays loading state initially', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <ViewFlashcardsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading flashcards.../i)).toBeInTheDocument();
  });

  test('displays flashcards when loaded successfully', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockFlashcards = [
      { question: 'What is React?', answer: 'A JavaScript library' },
      { question: 'What is JSX?', answer: 'JavaScript XML' }
    ];

    mockedAxios.get.mockResolvedValue({
      data: { flashcards: mockFlashcards }
    });

    render(
      <MemoryRouter>
        <ViewFlashcardsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Flashcard Set/i)).toBeInTheDocument();
      expect(screen.getByText(/What is React?/i)).toBeInTheDocument();
      expect(screen.getByText(/A JavaScript library/i)).toBeInTheDocument();
    });
  });
});