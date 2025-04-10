import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ProfilePage from '../src/pages/profile'; 

jest.mock('axios');
const mockedAxios = axios;
describe('Profile page', () => {
    test('displays error when no token is found', () => {
        localStorage.removeItem('token');
        render(<ProfilePage />);
        expect(screen.getByText(/Not logged in/i)).toBeInTheDocument();
    });

    test('fetches and displays profile and picture when token is present', async () => {
    localStorage.setItem('token', 'fake-token');

    mockedAxios.get.mockImplementation((url) => {
        if (url === 'http://localhost:3000/users') {
        return Promise.resolve({
            data: {
            username: 'testuser',
            profilePicture: 'http://example.com/test.jpg',
            },
        });
        }

        if (url === 'http://localhost:3000/users/profile-pic') {
        return Promise.resolve({
            data: {
            url: 'http://example.com/test.jpg',
            },
        });
        }

        return Promise.reject(new Error('unknown endpoint'));
    });

    render(<ProfilePage />);

    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText(/Username: testuser/i)).toBeInTheDocument();
        const img = screen.getByAltText('Profile');
        expect(img).toHaveAttribute('src', 'http://example.com/test.jpg');
    });
    });

    test('displays error if fetching profile fails', async () => {
        localStorage.setItem('token', 'fake-token');
    
        mockedAxios.get.mockImplementation((url) => {
        if (url === 'http://localhost:3000/users') {
            return Promise.reject(new Error('Profile fetch failed'));
        }
    
        if (url === 'http://localhost:3000/users/profile-pic') {
            return Promise.resolve({
            data: {
                url: 'http://example.com/test.jpg',
            },
            });
        }
    
        return Promise.reject(new Error('unknown endpoint'));
        });
    
        render(<ProfilePage />);
    
        await waitFor(() => {
        expect(screen.getByText(/Failed to fetch profile/i)).toBeInTheDocument();
        });
    });

    test('displays error if fetching profile picture fails', async () => {
        localStorage.setItem('token', 'fake-token');
    
        mockedAxios.get.mockImplementation((url) => {
        if (url === 'http://localhost:3000/users') {
            return Promise.resolve({
            data: {
                username: 'testuser',
            },
            });
        }
    
        if (url === 'http://localhost:3000/users/profile-pic') {
            return Promise.reject(new Error('Picture fetch failed'));
        }
    
        return Promise.reject(new Error('unknown endpoint'));
        });
    
        render(<ProfilePage />);
    
        await waitFor(() => {
        expect(screen.getByText(/Failed to fetch profile picture/i)).toBeInTheDocument();
        });
    });

});