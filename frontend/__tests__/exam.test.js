import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import GenerateExamsPage from '../src/pages/generateExams'; 
import { act } from 'react';


jest.mock('axios');
const mockedAxios = axios;


describe('Generate exam page', () => {

    test('displays error when no token is found', async () => {
        localStorage.removeItem('token');
        render(<GenerateExamsPage />);

        const textarea = screen.getByPlaceholderText(/paste your notes here/i);
        await userEvent.type(textarea, 'React');

        const submitButton = screen.getByRole('button', { name: /generate exam/i });
        await userEvent.click(submitButton);

        expect(await screen.findByText(/Not logged in/i)).toBeInTheDocument();
    });


    test('displays error if generate response fails', async () => {
        localStorage.setItem('token', 'fake-token');
    
        mockedAxios.post = jest.fn().mockRejectedValueOnce(new Error('Request failed'));
    
        render(<GenerateExamsPage />);
    
        const textarea = screen.getByPlaceholderText(/paste your notes here/i);
        await userEvent.type(textarea, 'Explain quantum computing');
    
        const submitButton = screen.getByRole('button', { name: /generate exam/i });
        await userEvent.click(submitButton);
    
        expect(await screen.findByText(/Failed to generate a response/i)).toBeInTheDocument();
    });


    test('displays reply if generate response succeeds', async () => {
        localStorage.setItem('token', 'fake-token');
      
        const questionObj = {
          question: "What is quantum computing?",
          answers: [
            { text: "A type of classical computing", isCorrect: false },
            { text: "A computing method using qubits", isCorrect: true },
            { text: "Only used in sci-fi", isCorrect: false },
            { text: "Completely fictional", isCorrect: false }
          ]
        };
      
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            reply: "```json\n[" + JSON.stringify(questionObj) + "]\n```"
          }
        });
      
        render(<GenerateExamsPage />);
      
        const textarea = screen.getByPlaceholderText(/paste your notes here/i);
        await userEvent.type(textarea, 'Explain quantum computing');
      
        const submitButton = screen.getByRole('button', { name: /generate exam/i });
      
        await act(async () => {
          await userEvent.click(submitButton);
        });
      
        
        expect(await screen.findByText(/q: what is quantum computing/i)).toBeInTheDocument();
        expect(await screen.findByText(/a computing method using qubits/i)).toBeInTheDocument();
    });
      
})