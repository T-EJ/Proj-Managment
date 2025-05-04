import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false); // Track if the message is an error
    const navigate = useNavigate(); // Hook for navigation

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('Login attempt:', { username, password }); // Debug: Log the input values

        try {
            const response = await axios.post('http://localhost:3001/login', { username, password });
            console.log('Login response:', response.data); // Debug: Log the response from the backend

            localStorage.setItem('token', response.data.token);
            setMessage('Login successful!');
            setIsError(false); // Reset error state
            navigate('/dashboard'); // Redirect to dashboard
        } catch (error) {
            console.error('Login error:', error); // Debug: Log the error object
            console.error('Error response:', error.response); // Debug: Log the error response from the backend

            setMessage(error.response?.data?.error || 'Login failed.');
            setIsError(true); // Set error state
        }
    };

    return (
        <div>
            <style>
                {`
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f8ff;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .login-container {
                        background-color: #ffffff;
                        border: 1px solid #d1d1d1;
                        border-radius: 8px;
                        padding: 20px;
                        width: 300px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .login-container h2 {
                        text-align: center;
                        color: #007bff;
                        margin-bottom: 20px;
                    }
                    .login-container input {
                        width: 100%;
                        padding: 10px;
                        margin: 10px 0;
                        border: 1px solid #d1d1d1;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    .login-container button {
                        width: 100%;
                        padding: 10px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 16px;
                        cursor: pointer;
                    }
                    .login-container button:hover {
                        background-color: #0056b3;
                    }
                    .login-container p {
                        text-align: center;
                        margin-top: 10px;
                        font-size: 14px;
                    }
                `}
            </style>
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                {message && (
                    <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;