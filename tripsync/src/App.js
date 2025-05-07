import Login from './Login.js';
import './App.css';
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Register from './Register.js';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './LandingPage.js';
import SearchPlaces from './SearchPlaces.js';
import BookTrip from './BookTrip.js';
import MyTrips from './MyTrips.js';
import ExpensesPage from './ExpensesPage.js';
import EditSearchPlace from './EditSearchPlace.js';

const clientId = '757597466268-j5v89k86bp80lstb12veslslqojpva6c.apps.googleusercontent.com'; // Replace with your actual client ID

function App() {
  console.log("App component rendered");

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/searchplaces" element={<SearchPlaces />} />
          <Route path="/booktrip" element={<BookTrip />} />
          <Route path="/mytrips" element={<MyTrips />} />
          <Route path="/editsearchplace/:tripId" element={<EditSearchPlace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;