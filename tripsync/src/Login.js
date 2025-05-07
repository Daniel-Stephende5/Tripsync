import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token && window.location.pathname === '/login') {
            navigate('/landingpage');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('https://tripsync-1.onrender.com/api/auth/login', {
          username,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        // ✅ Store the new JWT token if received
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          console.log('New token stored in localStorage:', response.data.token);
          alert('Login successful!');
          navigate('/landingpage');
        } else {
          setErrorMessage('Login failed: Token not received');
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Login failed!');
      }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            // Decode the Google token to inspect its content (optional, for debugging)
            const decoded = jwtDecode(credentialResponse.credential);
            console.log('Google login success:', decoded);
    
            // Send the Google token to your backend for validation and JWT generation
            const response = await axios.post('https://tripsync-1.onrender.com/api/auth/google', {
                token: credentialResponse.credential // Send the Google token to backend
            });
    
            // Assuming the backend returns a JWT token that you can use for further requests
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token); // Store the JWT from backend
                alert('Google Login successful!');
                navigate('/landingpage');
            } else {
                setErrorMessage('Failed to log in with Google.');
            }
        } catch (err) {
            // Log the error for more information
            console.error('Google login error:', err);
            setErrorMessage('Google login failed on server.');
        }
    };
    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    // Styles
    const containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#7b68ee",
        margin: 0,
    };

    const titleStyle = {
        color: "white",
        position: "absolute",
        top: "10%",
        fontSize: "48px",
    };

    const contentStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    };

    const formStyle = {
        background: "#6a5acd",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        width: "300px",
        textAlign: "center",
        color: "white",
    };

    const buttonContainerStyle = {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "20px",
    };

    const buttonStyle = {
        backgroundColor: "#0000cd",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <h2 style={titleStyle}>TripSync</h2>
                <div style={formStyle}>
                    <h2>Log-In</h2>
                    <form onSubmit={handleLogin}>
                        <div style={{ paddingBottom: "20px" }}>
                            <label>Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                        <div style={buttonContainerStyle}>
                            <button type="submit" style={buttonStyle}>Login</button>
                            <button type="button" onClick={handleRegisterRedirect} style={buttonStyle}>Register</button>
                        </div>
                    </form>
                    <div style={{ marginTop: '20px' }}>
                        <p style={{ color: 'white' }}>Or log in with Google:</p>
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={() => setErrorMessage("Google login failed")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
