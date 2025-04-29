import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import DatePicker from 'react-datepicker';
import { useNavigate, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import 'react-datepicker/dist/react-datepicker.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import html2canvas from 'html2canvas';
import './LandingPage.css';

const BookTrip = () => {
  const { state } = useLocation();
  const destination = state?.destination || { name: 'Unknown Destination', lat: 0, lon: 0 };

  const [userLocation, setUserLocation] = useState(null);
  const [travelDate, setTravelDate] = useState(new Date());
  const [routeCoords, setRouteCoords] = useState([]);
  const navigate = useNavigate();
  const mapWrapperRef = useRef(null);

  const icon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current = [position.coords.latitude, position.coords.longitude];
        setUserLocation(current);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setUserLocation([14.5995, 120.9842]); // Manila fallback
      }
    );
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || destination.lat === 0 || destination.lon === 0) return;
    
      try {
        const response = await fetch('https://tripsync-1.onrender.com/api/routes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [userLocation[1], userLocation[0]],
              [destination.lon, destination.lat],
            ],
          }),
        });
    
        const data = await response.json(); // <-- important
    
        const coords = data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(coords);
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };
    
    fetchRoute();
  }, [userLocation, destination]);

  const handleBackToSearch = () => {
    navigate('/searchplaces');
  };

  const captureMapImage = async () => {
    if (!mapWrapperRef.current) {
      console.error('Map wrapper not found.');
      return;
    }
    try {
      const canvas = await html2canvas(mapWrapperRef.current, { useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'map_route.png';
      link.click();
    } catch (error) {
      console.error('Error capturing map image:', error);
    }
  };

  const handleBookTrip = async () => {
    if (!userLocation || destination.lat === 0 || destination.lon === 0) {
      alert('Missing location data.');
      return;
    }

    try {
      const canvas = await html2canvas(mapWrapperRef.current, { useCORS: true });
      const mapImageBase64 = canvas.toDataURL('image/png');

      const tripData = {
        destinationName: destination.name,
        destinationLat: destination.lat,
        destinationLon: destination.lon,
        originLat: userLocation[0],
        originLon: userLocation[1],
        travelDate: travelDate.toISOString().split('T')[0],
        mapImage: mapImageBase64,
      };

      const response = await fetch('https://tripsync-1.onrender.com/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (response.ok) {
        const savedTrip = await response.json();
        alert(`Trip booked! Trip ID: ${savedTrip.id}`);
        navigate('/mytrips');
      } else {
        alert('Failed to book trip.');
      }
    } catch (error) {
      console.error('Error booking trip:', error);
      alert('An error occurred while booking your trip.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', minHeight: '100vh', minWidth: '200vh' }}>
      <h1 style={{ marginBottom: '20px' }}>Book Your Trip</h1>
      <p style={{ marginBottom: '20px' }}><strong>Destination:</strong> {destination.name}</p>

      <div style={{ marginBottom: '20px' }}>
        <label><strong>Travel Date:</strong></label><br />
        <DatePicker
          selected={travelDate}
          onChange={(date) => setTravelDate(date)}
          minDate={new Date()}
          dateFormat="MMMM d, yyyy"
        />
      </div>

      <div id="map" ref={mapWrapperRef} style={{ width: '100%', maxWidth: '800px', height: '500px', marginBottom: '20px' }}>
        {userLocation && (
          <MapContainer
            center={userLocation}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={userLocation} icon={icon}>
              <Popup>Your Location</Popup>
            </Marker>
            <Marker position={[destination.lat, destination.lon]} icon={icon}>
              <Popup>{destination.name}</Popup>
            </Marker>
            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} color="blue" />
            )}
          </MapContainer>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleBookTrip}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Book Trip
        </button>

        <button
          onClick={handleBackToSearch}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#f5f5f5',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Search
        </button>

        <button
          onClick={captureMapImage}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Save Route Image
        </button>
      </div>
    </div>
  );
};

export default BookTrip;
