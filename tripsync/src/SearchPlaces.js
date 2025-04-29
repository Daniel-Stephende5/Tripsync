import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs'; // ✅ Added qs for query serialization
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LandingPage.css';

const Navbar = ({ onTripsClick ,onExpensesClick,handleLogoClick}) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>TripSync</div>
      <ul className="navbar-links">
      <li><button className="navbar-link" onClick={onExpensesClick}>Expenses</button></li>
        <li><button className="navbar-link" onClick={onTripsClick}>Trips</button></li>
        <li><button className="navbar-link">Profile</button></li>
        <li><button className="navbar-link">Settings</button></li>
        <li><button className="navbar-link">Logout</button></li>
      </ul>
    </nav>
  );
};

const SearchPlaces = () => {
  const [query, setQuery] = useState('');
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [error, setError] = useState('');
  const [userReviews, setUserReviews] = useState({});
  const [coordinates, setCoordinates] = useState([51.505, -0.09]);
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);

  const handleTripsClick = () => {
    navigate('/landingpage');
  };
  const handleExpensesClick = () => {
    navigate('/expenses');  // Navigate to the Expenses page
  };
  const handleLogoClick = () => {
    navigate('/landingpage');  // Navigate to landing page when logo is clicked
  };
  const fetchReviews = async (placeIds) => {
    try {
      const response = await axios.get('https://tripsync-1.onrender.com/api/places/reviews', {
        params: { placeIds },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }), // ✅ avoids brackets
      });

      const reviewsMap = response.data.reduce((acc, review) => {
        acc[review.placeId] = review.reviewText;
        return acc;
      }, {});

      setUserReviews(reviewsMap);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSearch = async () => {
    if (!query) return;

    try {
      setError('');
      setPopularPlaces([]);

      const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: query, format: 'json', addressdetails: 1, limit: 1 },
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'TripSyncApp (youremail@example.com)',
        },
      });

      if (!geoResponse.data || geoResponse.data.length === 0) {
        setError('No location found');
        return;
      }

      const { lat, lon } = geoResponse.data[0];
      setCoordinates([parseFloat(lat), parseFloat(lon)]);

      const [placeResponse, weatherResponse] = await Promise.all([
        axios.get('https://tripsync-1.onrender.com/api/places/places', {
          params: {
            lat,
            lon,
            radius: 3000,
            kinds: 'interesting_places,cultural,natural,foods',
            limit: 10,
            format: 'json',
          },
        }),
        axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: lat,
            longitude: lon,
            current_weather: true,
          },
        })
      ]);

      const places = placeResponse.data;

      const detailedPlaces = await Promise.all(
        places.map(async (place) => {
          try {
            const details = await axios.get(`https://opentripmap-places-v1.p.rapidapi.com/en/places/xid/${place.xid}`, {
              headers: {
                'X-RapidAPI-Key': 'a291c92206msh89be76c578fa3d6p15eb77jsnc57a0c27e9ef',
                'X-RapidAPI-Host': 'opentripmap-places-v1.p.rapidapi.com',
              },
            });

            return {
              ...place,
              image: details.data.preview?.source || null,
              description: details.data.wikipedia_extracts?.text || '',
              rating: Math.floor(Math.random() * 3) + 3,
            };
          } catch (err) {
            console.warn(`Details fetch failed for ${place.name}`);
            return place;
          }
        })
      );
      setWeather(weatherResponse.data.current_weather);
      setPopularPlaces(detailedPlaces);
      const placeIds = detailedPlaces.map((place) => place.xid);
      fetchReviews(placeIds);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch data. Try again.');
    }
  };

  const handleReviewChange = (xid, review) => {
    setUserReviews((prevReviews) => ({
      ...prevReviews,
      [xid]: review,
    }));
  };

  const handleSubmitReview = async (place) => {
    try {
      await axios.post('https://tripsync-1.onrender.com/api/places/reviews', {
        placeId: place.xid,
        username: 'testuser',
        rating: place.rating || 5,
        reviewText: userReviews[place.xid],
      });

      alert('Review successfully posted!');
    } catch (error) {
      console.error('Error posting review:', error);
      alert('Failed to post review. Please try again later.');
    }
  };

  const MapUpdater = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(coordinates, 13);
    }, [coordinates, map]);
    return null;
  };

  return (
    <div>
      <Navbar onTripsClick={handleTripsClick} onExpensesClick={handleExpensesClick} handleLogoClick={handleLogoClick} />

      <div className="map-container">
        <MapContainer center={coordinates} zoom={13} style={{ minHeight: '600px', width: '100%' }}>
          <MapUpdater coordinates={coordinates} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {popularPlaces.map((place, index) => (
            <Marker
              key={index}
              position={[place.point.lat, place.point.lon]}
              icon={new L.Icon({
                iconUrl: markerIcon,
                shadowUrl: markerShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>{place.name || 'Unnamed Place'}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ padding: '20px' }}>
        <h1>Explore Popular Places</h1>
        {weather && (
          <div style={{ padding: '12px 16px', backgroundColor: '#e0f7fa', border: '1px solid #b2ebf2', borderRadius: '8px', marginBottom: '20px', fontSize: '16px' }}>
            <strong>Weather:</strong> {weather.temperature}°C, Wind: {weather.windspeed} km/h
          </div>
        )}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city"
            style={{ padding: '8px', marginRight: '10px', width: '300px' }}
          />
          <button onClick={handleSearch} style={{ padding: '8px 16px' }}>Search</button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <h3>Popular Places</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {popularPlaces.map((place, index) => (
            <li key={index} style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
              <strong>{place.name || 'Unnamed Place'}</strong><br />
              <em>{place.kinds.replace(/_/g, ' ')}</em><br />
              {place.image && (
                <img
                  src={place.image}
                  alt={place.name}
                  style={{ width: '300px', height: 'auto', marginTop: '10px', borderRadius: '8px' }}
                />
              )}
              {place.description && (
                <p style={{ maxWidth: '600px', marginTop: '10px' }}>{place.description}</p>
              )}

              <div className="rating-container">
                <p style={{ margin: '10px 0 5px' }}><strong>User Rating:</strong></p>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < place.rating ? 'star filled' : 'star'}>&#9733;</span>
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', color: '#666' }}>"{userReviews[place.xid] || 'No review yet'}</p>
              </div>

              <div style={{ marginTop: '10px' }}>
                <textarea
                  rows="2"
                  placeholder="Write your review here..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                  value={userReviews[place.xid] || ''}
                  onChange={(e) => handleReviewChange(place.xid, e.target.value)}
                />
                <button
                  onClick={() => handleSubmitReview(place)}
                  style={{
                    marginTop: '5px',
                    padding: '6px 12px',
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Submit Review
                </button>
              </div>

              <button
                onClick={() =>
                  navigate('/booktrip', {
                    state: {
                      destination: {
                        name: place.name || 'Unnamed Place',
                        lat: place.point.lat,
                        lon: place.point.lon,
                      },
                    },
                  })
                }
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Book Trip
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPlaces;
