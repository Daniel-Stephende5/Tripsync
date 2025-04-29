import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // ✅ reuse your styles

const EditSearchPlaces = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trip } = location.state || {};

  const [destinationName, setDestinationName] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [originLat, setOriginLat] = useState('');
  const [originLon, setOriginLon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trip) {
      setDestinationName(trip.destinationName || '');
      setTravelDate(trip.travelDate || '');
      setOriginLat(trip.originLat || '');
      setOriginLon(trip.originLon || '');
    }
  }, [trip]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(`https://tripsync-1.onrender.com/api/trips/${trip.id}`, {
        destinationName,
        travelDate,
        originLat,
        originLon,
      });
      alert('Trip updated successfully!');
      navigate('/mytrips');
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/mytrips');
  };

  const fetchCoordinatesFromPlace = async () => {
    if (!destinationName) {
      alert('Please enter a destination name first.');
      return;
    }
    
    try {
      const response = await axios.get(`https://tripsync-1.onrender.com/api/places/geoname`, {
        params: { name: destinationName },
      });
  
      console.log('Fetched place info:', response.data);
  
      const { lat, lon } = response.data;
      setOriginLat(lat);
      setOriginLon(lon);
  
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      alert('Failed to fetch coordinates for the destination.');
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setOriginLat(e.latlng.lat);
        setOriginLon(e.latlng.lng);
      },
    });
  
    return originLat && originLon ? (
      <Marker position={[originLat, originLon]} />
    ) : null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Trip</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>Destination Name:</label><br />
        <input
          type="text"
          value={destinationName}
          onChange={(e) => setDestinationName(e.target.value)}
          style={styles.input}
        />
        <div style={{ marginBottom: '20px' }}>
          <label>Pick a location on the map:</label><br />
          <MapContainer center={[originLat || 0, originLon || 0]} zoom={2} style={{ height: '300px', width: '100%', marginTop: '10px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker />
          </MapContainer>
        </div>
        <button
          onClick={fetchCoordinatesFromPlace}
          style={{ ...styles.saveButton, backgroundColor: '#2196f3', marginTop: '10px' }}
        >
          Autofill Coordinates
        </button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>Travel Date:</label><br />
        <input
          type="date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>Origin Latitude:</label><br />
        <input
          type="number"
          value={originLat}
          onChange={(e) => setOriginLat(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>Origin Longitude:</label><br />
        <input
          type="number"
          value={originLon}
          onChange={(e) => setOriginLon(e.target.value)}
          style={styles.input}
        />
      </div>

      <button
        onClick={handleSave}
        style={styles.saveButton}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      <button
        onClick={handleBack}
        style={styles.backButton}
      >
        Back to My Trips
      </button>
    </div>
  );
};

const styles = {
  input: {
    width: '300px',
    padding: '8px',
    marginTop: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  saveButton: {
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default EditSearchPlaces;
