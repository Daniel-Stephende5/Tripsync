import React, { useEffect } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const images = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=400&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&h=400&q=80',
  'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&h=400&q=80',
  'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&h=400&q=80',
];

// Navbar component
const Navbar = ({ onTripsClick, onExpensesClick, onLogoutClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">TripSync</div>
      <ul className="navbar-links">
        <li><button className="navbar-link" onClick={onExpensesClick}>Expenses</button></li>
        <li><button className="navbar-link" onClick={onTripsClick}>Trips</button></li>
     
        <li><button className="navbar-link" onClick={onLogoutClick}>Logout</button></li>
      </ul>
    </nav>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  // UseEffect for token check, but NOT redirecting to expenses automatically anymore.
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log("Token from localStorage: ", token);

    // If you have a specific logic to show something when there's a token, you can add it here.
    // But, for now, we aren't redirecting automatically.
  }, []);

  const onExpensesClick = () => {
    navigate('/expenses'); // Explicit redirect when button clicked
  };

  const handleTripsClick = () => {
    navigate('/searchplaces');
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="landing-container">
      <Navbar 
        onTripsClick={handleTripsClick}
        onExpensesClick={onExpensesClick}
        onLogoutClick={handleLogoutClick}
      />
      <h1 className="landing-title">Welcome to TripSync</h1>

      <div className="image-scroll-container">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index}`}
            className="landing-image"
          />
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
