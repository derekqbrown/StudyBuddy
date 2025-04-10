import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ChatPage from '../src/pages/chat'; 

jest.mock('axios');
const mockedAxios = axios;

describe('Chat page', () => {

    test('displays error when no token is found', async () => {
        localStorage.removeItem('token');
        render(<ChatPage />);

        const textarea = screen.getByPlaceholderText(/type your question/i);
        await userEvent.type(textarea, 'What is React?');

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await userEvent.click(submitButton);

        expect(await screen.findByText(/Not logged in/i)).toBeInTheDocument();
    });


    test('displays error if generate response fails', async () => {
        localStorage.setItem('token', 'fake-token');
    
        mockedAxios.post = jest.fn().mockRejectedValueOnce(new Error('Request failed'));
    
        render(<ChatPage />);
    
        const textarea = screen.getByPlaceholderText(/type your question/i);
        await userEvent.type(textarea, 'Explain quantum computing');
    
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await userEvent.click(submitButton);
    
        expect(await screen.findByText(/Request failed/i)).toBeInTheDocument();
    });


    test('displays reply if generate response succeeds', async () => {
        localStorage.setItem('token', 'fake-token');
      
        mockedAxios.post = jest.fn().mockResolvedValueOnce({
          data: {
            reply: 'Sure! Here’s an explanation of quantum computing...',
          },
        });
      
        render(<ChatPage />);
      
        const textarea = screen.getByPlaceholderText(/type your question/i);
        await userEvent.type(textarea, 'Explain quantum computing');
      
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await userEvent.click(submitButton);
      
        // Make sure reply is rendered on screen
        expect(await screen.findByText(/Sure! Here’s an explanation/i)).toBeInTheDocument();
      });
      
    
})