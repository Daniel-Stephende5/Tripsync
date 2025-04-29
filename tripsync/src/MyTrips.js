import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // ✅ for consistent styling

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('https://tripsync-1.onrender.com/api/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`https://tripsync-1.onrender.com/api/trips/${id}`);
        setTrips(trips.filter(trip => trip.id !== id));
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const handleEdit = (trip) => {
    navigate(`/editsearchplace/${trip.id}`, { state: { trip } });
  };

  const handleBack = () => {
    navigate('/landingpage');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Booked Trips</h1>

      {trips.length === 0 ? (
        <p>No trips booked yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.headerCell}>Trip ID</th>
                <th style={styles.headerCell}>Destination</th>
                <th style={styles.headerCell}>Travel Date</th>
                <th style={styles.headerCell}>Origin (Lat, Lon)</th>
                <th style={styles.headerCell}>Destination (Lat, Lon)</th>
                <th style={styles.headerCell}>Route Map</th>
                <th style={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
            {trips.map((trip, index) => (
  <tr
    key={trip.id}
    style={{
      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
      transition: 'background-color 0.3s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f7fa')}
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff')
    }
  >
    <td style={styles.cell}>{trip.id}</td>
    <td style={styles.cell}>{trip.destinationName}</td>
    <td style={styles.cell}>{trip.travelDate}</td>
    <td style={styles.cell}>
      ({trip.originLat?.toFixed(4)}, {trip.originLon?.toFixed(4)})
    </td>
    <td style={styles.cell}>
      ({trip.destinationLat?.toFixed(4)}, {trip.destinationLon?.toFixed(4)})
    </td>
    <td style={styles.cell}>
      {trip.mapImage ? (
        <img
          src={trip.mapImage}
          alt="Route Map"
          style={{ width: '100px', height: 'auto', borderRadius: '5px' }}
        />
      ) : (
        'No Image'
      )}
    </td>
    <td style={styles.cell}>
      <button onClick={() => handleEdit(trip)} style={styles.editButton}>
        Edit
      </button>
      <button onClick={() => handleDelete(trip.id)} style={styles.deleteButton}>
        Delete
      </button>
    </td>
  </tr>
))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={handleBack} style={styles.button}>
        Back to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  heading: {
    marginBottom: '20px',
    fontSize: '2rem',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  headerCell: {
    padding: '12px 15px',
    backgroundColor: '#1976d2',
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  cell: {
    padding: '12px 15px',
    borderBottom: '1px solid #eee',
    fontSize: '15px',
    color: '#555',
  },
  button: {
    marginTop: '30px',
    padding: '12px 25px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  editButton: {
    marginRight: '8px',
    backgroundColor: '#0288d1',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default MyTrips;
