import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import GenerateFlashcardPage from '../src/pages/generateFlashcards';

jest.mock('axios');
const mockedAxios = axios;

beforeAll(() => {
  HTMLFormElement.prototype.requestSubmit = function () {
    this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('Generate flashcard page', () => {
  test('displays error when no token is found', async () => {
    localStorage.removeItem('token');
    render(<GenerateFlashcardPage />);

    const textarea = screen.getByPlaceholderText(/paste your notes/i);
    await userEvent.type(textarea, 'React?');

    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/not logged in/i)).toBeInTheDocument();
  });

  test('displays error if generate response fails', async () => {
    localStorage.setItem('token', 'fake-token');

    mockedAxios.post.mockRejectedValueOnce(new Error('Request failed'));

    render(<GenerateFlashcardPage />);

    const textarea = screen.getByPlaceholderText(/paste your notes/i);
    await userEvent.type(textarea, 'quantum computing');

    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/failed to generate/i)).toBeInTheDocument();
  });

  test('displays flashcard if generate response succeeds', async () => {
    localStorage.setItem('token', 'fake-token');

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        reply: `\`\`\`json
[
  {
    "question": "What is quantum computing?",
    "answer": "Quantum computing is a type of computation..."
  }
]
\`\`\``
      }
    });

    render(<GenerateFlashcardPage />);

    const textarea = screen.getByPlaceholderText(/paste your notes/i);
    await userEvent.type(textarea, 'quantum computing');

    const submitButton = screen.getByRole('button', { name: /generate flashcards/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/what is quantum computing/i)).toBeInTheDocument();
    expect(await screen.findByText(/quantum computing is a type of computation/i)).toBeInTheDocument();
  });
});
