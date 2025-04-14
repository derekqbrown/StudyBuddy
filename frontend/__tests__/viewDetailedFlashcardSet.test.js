import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ViewDetailedSet from '../src/pages/viewDetailedFlashcardSet';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');
const mockedAxios = axios;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ setName: 'test-set' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('ViewDetailedSet Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('displays error when no token is found', () => {
    localStorage.removeItem('token');
    render(
        <MemoryRouter>
          <ViewDetailedSet />
        </MemoryRouter>
      );
    expect(screen.getByText(/Empty Set/i)).toBeInTheDocument();
  });

  test('fetches and displays flashcards when token is present', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockFlashcards = [
      { Key: 'path/to/flashcard1.json' },
      { Key: 'path/to/flashcard2.json' }
    ];

    mockedAxios.get.mockResolvedValue({
      data: mockFlashcards
    });

    render(
      <MemoryRouter>
        <ViewDetailedSet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-set')).toBeInTheDocument();
      expect(screen.getByText('flashcard1')).toBeInTheDocument();
      expect(screen.getByText('flashcard2')).toBeInTheDocument();
    });
  });

  test('displays empty set message when no flashcards exist', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedAxios.get.mockResolvedValue({
      data: []
    });

    render(
      <MemoryRouter>
        <ViewDetailedSet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-set')).toBeInTheDocument();
      expect(screen.getByText(/Empty Set/i)).toBeInTheDocument();
    });
  });

});