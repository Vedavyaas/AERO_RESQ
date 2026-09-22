import { useState, useEffect } from 'react';
import { Target, Send, AlertTriangle, MapPin, Search, Plus, ShieldAlert } from 'lucide-react';
import api from '../api/axiosConfig';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Component to handle map clicks for lat/lon picking
const MapClickHandler = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

const MissionManagement = () => {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [missionName, setMissionName] = useState('');
  const [droneId, setDroneId] = useState('');
  const [altitude, setAltitude] = useState('100');
  const [riskStatus, setRiskStatus] = useState('LOW');
  const [position, setPosition] = useState(null); // {lat, lng}

  // Modal State
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    setLoading(true);
    try {
      // Fetch all drones so they can be selected. Size 50 to get a good chunk without pagination for now
      const res = await api.get(`/drone?start=0&size=50`);
      setDrones(res.data.content);
    } catch (err) {
      console.error('Failed to fetch drones', err);
      setError('Could not load your drones. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!position) {
      setError('Please select a target location on the map.');
      return;
    }
    setError('');
    setShowModal(true);
  };

  const submitMission = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        missionName,
        droneId: parseInt(droneId),
        latitude: position.lat.toString(),
        longitude: position.lng.toString(),
        altitude: altitude.toString(),
        riskStatus
      };

      const res = await api.post('/mission', payload);
      setSuccess(res.data || 'Mission started successfully.');
      
      // Reset form
      setMissionName('');
      setDroneId('');
      setAltitude('100');
      setRiskStatus('LOW');
      setPosition(null);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to start mission', err);
      setError(err.response?.data || 'Failed to start mission. Please try again.');
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Mission Control</h2>
          <p style={{ color: 'var(--t2)' }}>Deploy drones and assign coordinates</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--red)', padding: '1rem', borderRadius: 'var(--r-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--emerald)', padding: '1rem', borderRadius: 'var(--r-md)', marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--t2)', padding: '2rem' }}>Loading system assets...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Form Side */}
          <div className="win" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--t1)' }}>
              <Target size={20} color="var(--emerald)" /> Mission Parameters
            </h3>
            
            <form onSubmit={handleOpenConfirm}>
              <div className="field">
                <label style={{ color: 'var(--t1)', fontWeight: '600' }}>Mission Name</label>
                <input 
                  type="text" 
                  className="fi" 
                  placeholder="e.g. Sector 7 Search"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label style={{ color: 'var(--t1)', fontWeight: '600' }}>Assign Drone</label>
                <select 
                  className="fi" 
                  value={droneId}
                  onChange={(e) => setDroneId(e.target.value)}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" disabled>Select an available drone...</option>
                  {drones.map(d => (
                    <option key={d.id} value={d.id} disabled={d.droneStatus === 'IN_MISSION' || d.droneStatus === 'RETURNING'}>
                      {d.droneCode} ({d.model}) - {d.droneStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="field">
                  <label style={{ color: 'var(--t1)', fontWeight: '600' }}>Flight Altitude (m)</label>
                  <input 
                    type="number" 
                    className="fi" 
                    min="10"
                    max="500"
                    value={altitude}
                    onChange={(e) => setAltitude(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label style={{ color: 'var(--t1)', fontWeight: '600' }}>Risk Assessment</label>
                  <select 
                    className="fi" 
                    value={riskStatus}
                    onChange={(e) => setRiskStatus(e.target.value)}
                    required
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginBottom: '2rem' }}>
                <label style={{ color: 'var(--t1)', fontWeight: '600' }}>Target Coordinates</label>
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border-side)' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--t2)', display: 'block' }}>LATITUDE</span>
                    <span style={{ fontWeight: 500, color: position ? 'var(--t1)' : 'var(--t3)' }}>{position ? position.lat.toFixed(6) : 'Select on map'}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--t2)', display: 'block' }}>LONGITUDE</span>
                    <span style={{ fontWeight: 500, color: position ? 'var(--t1)' : 'var(--t3)' }}>{position ? position.lng.toFixed(6) : 'Select on map'}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                <Send size={18} /> Initialize Deployment
              </button>
            </form>
          </div>

          {/* Map Side */}
          <div className="win" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-side)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--t1)' }}>
                <MapPin size={18} color="var(--emerald)" /> Coordinate Selection
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--t2)', marginTop: '0.25rem' }}>Click anywhere on the map to set the mission target area.</p>
            </div>
            
            <div style={{ flex: 1, minHeight: '400px', width: '100%' }}>
              <MapContainer 
                center={[37.7749, -122.4194]} // Default to SF or change to user pref
                zoom={10} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler setPosition={setPosition} />
                {position && (
                  <Marker position={position}></Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="win fade-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--emerald)' }}>
              <ShieldAlert size={32} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Confirm Dispatch</h3>
            </div>
            
            <p style={{ color: 'var(--t1)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You are about to deploy drone <strong>{drones.find(d => d.id === parseInt(droneId))?.droneCode}</strong> on mission <strong>"{missionName}"</strong>.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: 'var(--r-md)', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><span style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>RISK LEVEL</span><br/><strong>{riskStatus}</strong></div>
                <div><span style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>ALTITUDE</span><br/><strong>{altitude}m</strong></div>
                <div><span style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>LATITUDE</span><br/><strong>{position?.lat.toFixed(4)}</strong></div>
                <div><span style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>LONGITUDE</span><br/><strong>{position?.lng.toFixed(4)}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-ghost" 
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={submitMission} 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? 'Dispatching...' : 'Confirm & Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionManagement;