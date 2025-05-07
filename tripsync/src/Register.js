import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // useNavigate hook instead of useHistory

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== reenterPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }
    try {
     await axios.post( 'https://tripsync-1.onrender.com/api/auth/register',{
        username,
        email,
        password,
      });
      setSuccessMessage('Registration successful!');
      setTimeout(() => {
        navigate('/'); // Redirect to the login page after successful registration
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data || 'Registration failed!');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h2 style={titleStyle}>TripSync Registration</h2>
        <div style={formStyle}>
          <h2>Sign Up</h2>
          <form onSubmit={handleRegister}>
            <div style={{ paddingBottom: '20px' }}>
              <p style={{margin:"0px"}}>Username:</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={{ paddingBottom: '20px' }}>
              <p style={{margin:"0px"}} >Email:</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ paddingBottom: '20px' }}>
              <p style={{margin:"0px"}}>Password:</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ paddingBottom: '20px' }}>
              <p style={{margin:"0px"}}>Re-enter Password:</p>
              <input
                type="password"
                value={reenterPassword}
                onChange={(e) => setReenterPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            <button type="submit" style={registerButtonStyle}>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#7b68ee',
  position: 'relative',
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const titleStyle = {
  color: 'white',
  position: 'absolute',
  top: '10%',
  fontSize: '32px',
};

const formStyle = {
  background: '#6a5acd',
  padding: '5px',
  borderRadius: '8px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  width: '300px',
  textAlign: 'center',
  color: 'white',
};
const registerButtonStyle = {
  backgroundColor: "#0000cd ", // Green color
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  
};
export default Register;
