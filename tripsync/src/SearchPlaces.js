import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LandingPage.css';

const Navbar = ({ onTripsClick, onExpensesClick, handleLogoClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>TripSync</div>
      <ul className="navbar-links">
        <li><button className="navbar-link" onClick={onExpensesClick}>Expenses</button></li>
        <li><button className="navbar-link" onClick={onTripsClick}>Trips</button></li>
       
      </ul>
    </nav>
  );
};
const axiosInstance = axios.create();

// Add an interceptor to attach the token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
const SearchPlaces = () => {
  const [query, setQuery] = useState('');
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [error, setError] = useState('');
  const [userReviews, setUserReviews] = useState({});
  const [coordinates, setCoordinates] = useState([51.505, -0.09]);
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const token = localStorage.getItem('authToken'); 
   //  Get the token
   const [reviewInputs, setReviewInputs] = useState({});
  const handleTripsClick = () => {
      navigate('/landingpage');
  };

  const handleExpensesClick = () => {
      navigate('/expenses');
  };

  const handleLogoClick = () => {
      navigate('/landingpage');
  };

  useEffect(() => {
      if (!token) {
          //  If no token is found, redirect to login page
          navigate('/');
      }
  }, [token, navigate]);

  const fetchReviews = async (placeIds) => {
    try {
      const response = await axiosInstance.get('https://tripsync-1.onrender.com/api/places/reviews', {
        params: { placeIds },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
      });
  
      const reviewsMap = response.data.reduce((acc, review) => {
        if (!acc[review.placeId]) {
          acc[review.placeId] = [];
        }
        acc[review.placeId].push({ id: review.id, text: review.reviewText });
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
  
      // Fetch location data
      const geoResponse = await axiosInstance.get('https://nominatim.openstreetmap.org/search', {
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
  
      // Fetch places and weather in parallel
      const [placeResponse, weatherResponse] = await Promise.all([
        axiosInstance.get('https://tripsync-1.onrender.com/api/places/places', {
          params: {
            lat,
            lon,
            radius: 3000,
            kinds: 'interesting_places,cultural,natural,foods',
            limit: 10,
            format: 'json',
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axiosInstance.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: lat,
            longitude: lon,
            current_weather: true,
          },
        }),
      ]);
  
      const places = placeResponse.data;
  
      // Fetch detailed places data
      const detailedPlaces = await Promise.all(
        places.map(async (place) => {
          try {
            const details = await axiosInstance.get(`https://opentripmap-places-v1.p.rapidapi.com/en/places/xid/${place.xid}`, {
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
            return place; // Return place even if there's an error
          }
        })
      );
  
      // Update weather and popular places state
      setWeather(weatherResponse.data.current_weather);
      setPopularPlaces(detailedPlaces);
  
    } catch (err) {
      console.error('Error:', err);
      if (err.response && err.response.status === 401) {
        setError('You are not authorized. Please log in.');
        navigate('/');  // Or navigate('/login')
      } else {
        setError('Failed to fetch data. Try again.');
      }
    }
  };
  useEffect(() => {
    if (popularPlaces.length > 0) {
      const placeIds = popularPlaces.map((place) => place.xid);
      fetchReviews(placeIds);
    }
  }, [popularPlaces]);
  const handleReviewChange = (xid, review) => {
    setReviewInputs((prevReviews) => ({
          ...prevReviews,
          [xid]: review,
      }));
  };
  const handleUpdateReview = async (placeId, reviewId, newText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(
        `https://tripsync-1.onrender.com/api/places/reviews/${reviewId}`,
        { reviewText: newText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("PUT response:", response.data); // ✅ Log successful response
  
      alert('Review updated!');
      fetchReviews([placeId]); // ✅ This could also throw — wrap it too
    } catch (err) {
      console.error('Error updating review:', err.response?.data || err.message || err);
      alert('Failed to update review.');
    }
  };
  const handleDeleteReview = async (placeId, reviewId) => {
    try {
      await axiosInstance.delete(`https://tripsync-1.onrender.com/api/places/reviews/${reviewId}`);
      alert('Review deleted!');
      fetchReviews([placeId]);
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review.');
    }
  };
  const handleSubmitReview = async (place) => {
    try {
      await axiosInstance.post('https://tripsync-1.onrender.com/api/places/reviews', {
        placeId: place.xid,
        username: 'testuser',
        rating: place.rating || 5,
        reviewText: reviewInputs[place.xid],
      });
  
      alert('Review successfully posted!');
  
      // Clear the input field
      setReviewInputs((prevInputs) => ({
        ...prevInputs,
        [place.xid]: '',
      }));
  
      // Fetch updated reviews
      fetchReviews([place.xid]);
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
  <p style={{ margin: '10px 0 5px' }}><strong>User Reviews:</strong></p>
  
  {Array.isArray(userReviews[place.xid]) && userReviews[place.xid].length > 0 ? (
    userReviews[place.xid].map((review, idx) => (
    <div key={idx} style={{ marginBottom: '8px' }}>
      <p style={{ fontStyle: 'italic', color: '#adff2f ', marginBottom: '4px' }}>
        "{review.text}"
      </p>
      <div>
        <button
          onClick={() => {
            const newText = prompt("Edit your review:", review.text);
            console.log("New review text:", newText);
            if (newText && newText !== review.text) {
              handleUpdateReview(place.xid, review.id, newText);
            }
          }}
          style={{
            marginRight: '10px',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#ffc107',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteReview(place.xid, review.id)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ))
) : (
  <p style={{ fontStyle: 'italic', color: '#d3f8d3' }}>"No reviews yet"</p>
)}
</div>

<div style={{ marginTop: '10px' }}>
  <textarea
    rows="2"
    placeholder="Write your review here..."
    style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
    value={reviewInputs[place.xid] || ''}
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

              <div style={{ marginTop: '15px' }}>
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
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPlaces;
