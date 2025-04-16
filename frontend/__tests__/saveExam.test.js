import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import GenerateExamPage from '../src/pages/generateExams';

jest.mock('axios');
const mockedAxios = axios;

describe('GenerateExamPage Save Functionality', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    mockedAxios.post.mockReset();
  });

  test('saves exam when Save button is clicked', async () => {
    const fakeExam = [
      {
        question: 'What is the capital of France?',
        answers: [
          { text: 'Berlin', isCorrect: false },
          { text: 'Madrid', isCorrect: false },
          { text: 'Paris', isCorrect: true },
          { text: 'Rome', isCorrect: false },
        ],
      },
    ];

    // Mock the generate exam API
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        reply: '```json\n' + JSON.stringify(fakeExam) + '\n```',
      },
    });

    render(<GenerateExamPage />);

    // Fill in prompt and submit
    const textarea = screen.getByPlaceholderText(/paste your notes here/i);
    await userEvent.type(textarea, 'What is the capital of France?');

    const generateBtn = screen.getByRole('button', { name: /generate exam/i });
    await act(async () => {
      await userEvent.click(generateBtn);
    });

    // Fill in "Save As" input
    const input = await screen.findByPlaceholderText(/set name/i);
    await userEvent.type(input, 'Geography Set');

    // Mock save exam API
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      await userEvent.click(saveBtn);
    });

    // Expect axios.post to have been called with correct payload
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/exams/save',
      {
        name: 'Geography Set',
        exam: fakeExam,
      },
      {
        headers: { Authorization: 'Bearer fake-token' },
      }
    );
  });
});
