import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Thermometer, Users, ShieldAlert } from 'lucide-react';
import api from '../api/axiosConfig';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Rectangle, Polyline } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import { calculateRescuePath } from '../utils/pathfinder';

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

  // Calculate Rescue Path using Bidirectional A* (routes from origin to highest probability, to evac)
  const { rescuePath, teamLandingZone, evacuationZone } = React.useMemo(() => {
    return calculateRescuePath(mission, stats);
  }, [mission, stats]);

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
              {/* Original Mission Origin - Default Blue Pin */}
              <Marker position={[parseFloat(mission.latitude), parseFloat(mission.longitude)]}>
                <Popup><strong>Mission Origin</strong><br/>Drone Start Location</Popup>
              </Marker>
              
              {/* Team Landing Zone - Start Symbol */}
              {teamLandingZone && (
                <CircleMarker 
                  center={[parseFloat(teamLandingZone.latitude), parseFloat(teamLandingZone.longitude)]}
                  radius={8}
                  pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 1, weight: 3 }}
                >
                  <Popup><strong>Team Landing Zone</strong><br/>Safest & Central Start</Popup>
                </CircleMarker>
              )}

              {/* Evacuation Zone - End Symbol */}
              {evacuationZone && (
                <CircleMarker 
                  center={[parseFloat(evacuationZone.latitude), parseFloat(evacuationZone.longitude)]}
                  radius={8}
                  pathOptions={{ color: '#ef4444', fillColor: '#f87171', fillOpacity: 1, weight: 3 }}
                >
                  <Popup><strong>Evacuation Zone</strong><br/>Rescue Extraction Point</Popup>
                </CircleMarker>
              )}
              
              <HeatmapLayer 
                points={heatPoints} 
                options={{ 
                  radius: 35, 
                  blur: 20, 
                  maxZoom: 14, 
                  minOpacity: 0.35,
                  max: 1.0, 
                  gradient: metric === 'temperature' 
                    ? {0.25: 'blue', 0.5: 'cyan', 0.75: 'yellow', 1.0: 'red'}
                    : {0.25: 'purple', 0.5: 'fuchsia', 0.75: 'orange', 1.0: 'lime'}
                }} 
              />


              {/* Main Rescue Route */}
              {rescuePath && rescuePath.length > 1 && (
                <>
                  <Polyline 
                    positions={rescuePath} 
                    pathOptions={{ color: '#0369a1', weight: 14, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }} 
                  />
                  <Polyline 
                    positions={rescuePath} 
                    pathOptions={{ color: '#0f172a', weight: 4, opacity: 0.9, dashArray: '8, 8', lineCap: 'round', lineJoin: 'round' }} 
                  />
                </>
              )}

              {/* No Structural Gap (False) -> Concrete blocks to outline structures/debris */}
              {stats.filter(s => !s.structuralGapFound).map(s => {
                const offset = 0.00003; // Roughly 3x3 meter block
                const bounds = [
                  [s.latitude - offset, s.longitude - offset],
                  [s.latitude + offset, s.longitude + offset]
                ];
                return (
                  <Rectangle 
                    key={s.id}
                    bounds={bounds}
                    // Semi-transparent so the heatmap underneath remains visible
                    pathOptions={{ color: '#1e293b', fillColor: '#334155', fillOpacity: 0.4, weight: 1 }}
                  />
                );
              })}
            </MapContainer>

            {/* Premium Legend */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '16px 20px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              zIndex: 1000,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: '240px',
              color: 'white',
              fontFamily: 'Inter, sans-serif'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1' }}>
                {metric === 'temperature' ? 'Thermal Intensity' : 'Survivor Probability'}
              </h4>
              
              {/* Gradient Scale */}
              <div style={{
                height: '8px',
                width: '100%',
                borderRadius: '4px',
                background: metric === 'temperature' 
                  ? 'linear-gradient(to right, blue, cyan, yellow, red)'
                  : 'linear-gradient(to right, purple, fuchsia, orange, lime)',
                marginBottom: '8px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', marginBottom: '16px' }}>
                <span>Low</span>
                <span>High</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                {/* Obstacle / Rubble Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    border: '1px solid #1e293b',
                    borderRadius: '3px'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#f1f5f9' }}>
                    Obstacle / Debris
                  </span>
                </div>
                
                {/* Rescue Route Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '14px',
                    height: '4px',
                    backgroundColor: '#0f172a',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px #0369a1'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#f1f5f9' }}>
                    Fast Rescue Route
                  </span>
                </div>

                {/* Evacuation Zone Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#f87171',
                    border: '2px solid #ef4444',
                    borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#f1f5f9' }}>
                    Evacuation Zone
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDetails;
