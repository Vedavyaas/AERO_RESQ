import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Thermometer, Users, ShieldAlert } from 'lucide-react';
import api from '../api/axiosConfig';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';

const riskStyle = (risk) => {
  if (risk === 'HIGH') return { bg: 'rgba(185,28,28,0.1)', color: '#dc2626', border: 'rgba(185,28,28,0.25)' };
  if (risk === 'MEDIUM') return { bg: 'rgba(14,116,144,0.1)', color: 'var(--cyan)', border: 'rgba(14,116,144,0.25)' };
  return { bg: 'rgba(4,120,87,0.1)', color: 'var(--emerald)', border: 'rgba(4,120,87,0.25)' };
};

const MissionDetails = ({ mission, onBack }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState('survivorProbability'); // 'survivorProbability' or 'temperature'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/mission/${mission.id}/statistics`);
        setStats(res.data || []);
      } catch (err) {
        console.error('Failed to fetch mission statistics:', err);
        setError('Could not load telemetry data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [mission.id]);

  // Transform stats into points array for Heatmap: [lat, lng, intensity]
  const heatPoints = stats.map(s => {
    const lat = s.latitude;
    const lng = s.longitude;
    // Normalize intensity if needed based on metric
    let intensity = 0;
    if (metric === 'survivorProbability') {
      // Assuming survivorProbability is 0.0 to 1.0
      intensity = s.survivorProbability || 0;
    } else {
      // Assuming temperature might be around 20 to 100 degrees C, normalize somewhat
      // This is a naive normalization. Customize based on actual drone output.
      intensity = (s.temperature || 0) / 100.0;
      if (intensity > 1) intensity = 1;
      if (intensity < 0) intensity = 0;
    }
    return [lat, lng, intensity];
  });

  const rs = riskStyle(mission.riskStatus);

  return (
    <div className="fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {mission.missionName}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700',
              background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              {mission.riskStatus} RISK
            </span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
            Drone: {mission.droneCode} | Status: {mission.missionStatus}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          className={`btn ${metric === 'survivorProbability' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMetric('survivorProbability')}
        >
          <Users size={16} /> Survivor Probability
        </button>
        <button 
          className={`btn ${metric === 'temperature' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMetric('temperature')}
          style={{ background: metric === 'temperature' ? 'linear-gradient(135deg, #ef4444, #f97316)' : '', color: metric === 'temperature' ? 'white' : '' }}
        >
          <Thermometer size={16} /> Thermal Signature
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      <div className="glass-card" style={{ flex: 1, minHeight: '65vh', padding: '0.5rem', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--t2)', flex: 1 }}>
             <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} /> Analyzing spatial memory...
           </div>
        ) : (
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <MapContainer 
              center={[parseFloat(mission.latitude), parseFloat(mission.longitude)]} 
              zoom={15} 
              style={{ flex: 1, width: '100%', borderRadius: '10px', minHeight: '500px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[parseFloat(mission.latitude), parseFloat(mission.longitude)]}>
                <Popup>Mission Origin</Popup>
              </Marker>
              
              <HeatmapLayer 
                points={heatPoints} 
                options={{ 
                  radius: 25, 
                  blur: 15, 
                  maxZoom: 17, 
                  max: 1.0, 
                  gradient: metric === 'temperature' 
                    ? {0.4: 'blue', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red'}
                    : {0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'green'}
                }} 
              />

              {stats.filter(s => s.structuralGapFound).map(s => (
                <CircleMarker 
                  key={s.id}
                  center={[s.latitude, s.longitude]} 
                  radius={8} 
                  pathOptions={{ color: 'yellow', fillColor: 'orange', fillOpacity: 0.5 }}
                >
                  <Popup>
                    <strong>Structural Gap Detected</strong><br/>
                    Time: {new Date(s.timestamp).toLocaleTimeString()}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Legend */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.9)',
              padding: '10px 15px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1000,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              minWidth: '200px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>
                {metric === 'temperature' ? 'Thermal Signature' : 'Survivor Probability'}
              </h4>
              <div style={{
                height: '10px',
                width: '100%',
                borderRadius: '5px',
                background: metric === 'temperature' 
                  ? 'linear-gradient(to right, blue, yellow, orange, red)'
                  : 'linear-gradient(to right, cyan, lime, yellow, green)',
                marginBottom: '5px'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555', fontWeight: '600', marginBottom: '10px' }}>
                <span>{metric === 'temperature' ? 'Low Temp' : 'Low Prob'}</span>
                <span>{metric === 'temperature' ? 'High Temp' : 'High Prob'}</span>
              </div>
              
              {/* Structural Gap Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'orange',
                  border: '2px solid yellow',
                  opacity: 0.8
                }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
                  Structural Gap
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDetails;
