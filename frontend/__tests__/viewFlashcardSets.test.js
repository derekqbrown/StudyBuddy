import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ViewFlashcardSet from '../src/pages/viewFlashcardSets';
import { MemoryRouter } from 'react-router-dom';

//mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('ViewFlashcardSet Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Displays "No set found" when no sets exist', async () => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <ViewFlashcardSet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No set found')).toBeInTheDocument();
    });
  });

  test('Displays flashcard sets when they exist', async () => {
    localStorage.setItem('token', 'test-token');
    const mockSets = ['React Basics', 'JavaScript Fundamentals', 'CSS Tricks'];
    axios.get.mockResolvedValue({ data: mockSets });

    render(
      <MemoryRouter>
        <ViewFlashcardSet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Flashcard Sets')).toBeInTheDocument();
      mockSets.forEach(set => {
        expect(screen.getByText(set)).toBeInTheDocument();
      });
    });
  });
});