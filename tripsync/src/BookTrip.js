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
  const destination = state?.destination || null;
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

  // Redirect if no destination or invalid lat/lon
  useEffect(() => {
    if (!destination || typeof destination.lat !== 'number' || typeof destination.lon !== 'number') {
      alert('No destination selected. Redirecting to Search Places.');
      navigate('/searchplaces');
    }
  }, [destination, navigate]);

  // Fetch user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
      () => setUserLocation([14.5995, 120.9842]) // fallback to Manila
    );
  }, []);

  // Fetch route after user location and destination are available
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('You must be logged in to fetch routes.');
      navigate('/');
      return;
    }

    const fetchRoute = async () => {
      if (!userLocation || !destination || destination.lat === 0 || destination.lon === 0) return;

      try {
        const response = await fetch('http://localhost:8080/api/routes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coordinates: [
              [userLocation[1], userLocation[0]], // long, lat for user
              [destination.lon, destination.lat], // long, lat for destination
            ],
          }),
        });

        if (!response.ok) {
          throw new Error('Error fetching directions.');
        }

        const data = await response.json();
        const coords = data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(coords);
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };
    fetchRoute();
  }, [userLocation, destination, navigate]);

  // Capture map image
  const captureMapImage = async () => {
    if (!mapWrapperRef.current) return;

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

  // Handle trip booking
  const handleBookTrip = async () => {
    if (!userLocation || !destination || destination.lat === 0 || destination.lon === 0) {
      alert('Missing location data.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in to book a trip.');
      navigate('/');
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

      const response = await fetch('http://localhost:8080/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });

      if (response.ok) {
        const savedTrip = await response.json();
        alert(`Trip booked! Trip ID: ${savedTrip.id}`);
        navigate('/mytrips');
      } else {
        const errText = await response.text();
        alert(`Failed to book trip: ${errText}`);
      }
    } catch (error) {
      console.error('Error booking trip:', error);
      alert('An error occurred while booking your trip.');
    }
  };

  return (
    <div className="book-trip-container">
      <h1>Book Your Trip</h1>
      {destination && <p><strong>Destination:</strong> {destination.name}</p>}

      <div>
        <label><strong>Travel Date:</strong></label><br />
        <DatePicker
          selected={travelDate}
          onChange={setTravelDate}
          minDate={new Date()}
          dateFormat="MMMM d, yyyy"
        />
      </div>

      <div ref={mapWrapperRef} className="map-wrapper">
        {userLocation && destination && (
          <MapContainer center={userLocation} zoom={7} style={{ height: '500px', width: '100vh' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={userLocation} icon={icon}>
              <Popup>Your Location</Popup>
            </Marker>
            <Marker position={[destination.lat, destination.lon]} icon={icon}>
              <Popup>{destination.name}</Popup>
            </Marker>
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
          </MapContainer>
        )}
      </div>

      <div className="button-group">
        <button onClick={handleBookTrip} style={{backgroundColor:"green",color:"white",padding:"10px",marginTop:"5px"}}>Book Trip</button>
        <button onClick={() => navigate('/searchplaces')}style={{backgroundColor:"green",color:"white",padding:"10px",marginTop:"5px"}}>Back to Search</button>
        <button onClick={captureMapImage}style={{backgroundColor:"green",color:"white",padding:"10px",marginTop:"5px"}}>Save Route Image</button>
      </div>
    </div>
  );
};

export default BookTrip;
