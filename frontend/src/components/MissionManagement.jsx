import { useState, useEffect } from 'react';
import { Loader2, Plus, ShieldAlert, ChevronLeft, ChevronRight, Navigation } from 'lucide-react';
import api from '../api/axiosConfig';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({ click(e) { setPosition(e.latlng); } });
  return position ? <Marker position={position} /> : null;
};

import MissionDetails from './MissionDetails';

const riskStyle = (risk) => {
  if (risk === 'HIGH')   return { bg: 'rgba(185,28,28,0.1)',  color: '#dc2626',       border: 'rgba(185,28,28,0.25)' };
  if (risk === 'MEDIUM') return { bg: 'rgba(14,116,144,0.1)', color: 'var(--cyan)',   border: 'rgba(14,116,144,0.25)' };
  return                        { bg: 'rgba(4,120,87,0.1)',   color: 'var(--emerald)',border: 'rgba(4,120,87,0.25)' };
};

const MissionManagement = ({ mode, onMissionCreated }) => {
  // ── All hooks at the top — no conditionals ──
  const [selectedMission, setSelectedMission] = useState(null);
  const [missions, setMissions] = useState([]);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 8;

  // Create form state
  const [step, setStep] = useState(1);
  const [missionName, setMissionName] = useState('');
  const [droneId, setDroneId] = useState('');
  const [altitude, setAltitude] = useState('');
  const [riskStatus, setRiskStatus] = useState('LOW');
  const [position, setPosition] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/mission?start=${page}&size=${PAGE_SIZE}`);
      setMissions(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch missions:', err);
      setError('Could not load missions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrones = async () => {
    try {
      const res = await api.get('/drone?start=0&size=100');
      setDrones(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch drones:', err);
    }
  };

  useEffect(() => {
    if (mode === 'view') fetchMissions();
    if (mode === 'create') fetchDrones();
  }, [mode, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!position) { alert('Please click the map to select coordinates.'); return; }
    setCreating(true);
    setCreateSuccess(false);
    try {
      await api.post('/mission', {
        missionName,
        droneId: parseInt(droneId),
        latitude: position.lat.toString(),
        longitude: position.lng.toString(),
        altitude,
        riskStatus
      });
      setCreateSuccess(true);
      setMissionName(''); setDroneId(''); setAltitude(''); setRiskStatus('LOW'); setPosition(null); setStep(1);
      setTimeout(() => { if (onMissionCreated) onMissionCreated(); }, 1200);
    } catch (err) {
      console.error('Failed to create mission:', err);
      alert('Failed to create mission.');
    } finally {
      setCreating(false);
    }
  };

  // ── VIEW MODE ──────────────────────────────────────────────────────────
  if (mode === 'view') {
    if (selectedMission) {
      return <MissionDetails mission={selectedMission} onBack={() => setSelectedMission(null)} />;
    }

    return (
      <div className="fade-up">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.25rem' }}>My Missions</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
            {totalElements} {totalElements === 1 ? 'mission' : 'missions'} logged
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'var(--t2)' }}>
              <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading missions...
            </div>
          ) : missions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--t2)' }}>
              <Navigation size={40} style={{ opacity: 0.25, margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ fontWeight: '600', marginBottom: '0.35rem' }}>No missions yet</p>
              <p style={{ fontSize: '0.82rem' }}>Create your first mission using the sidebar.</p>
            </div>
          ) : (
            <table className="gtable">
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Drone</th>
                  <th>Coordinates</th>
                  <th>Alt</th>
                  <th style={{ textAlign: 'right' }}>Risk</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => {
                  const rs = riskStyle(m.riskStatus);
                  return (
                    <tr key={m.id} onClick={() => setSelectedMission(m)} style={{ cursor: 'pointer' }} className="hover-row">
                      <td style={{ fontWeight: '700', color: 'var(--t1)' }}>{m.missionName}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--t2)' }}>
                          {m.droneCode || `#${m.droneId}`}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--t3)' }}>
                        {parseFloat(m.latitude).toFixed(4)}, {parseFloat(m.longitude).toFixed(4)}
                      </td>
                      <td style={{ color: 'var(--t2)' }}>{m.altitude}m</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700',
                          background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.06em'
                        }}>
                          {m.riskStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && missions.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--border-side)',
              background: 'rgba(59,130,246,0.02)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0} style={{ padding: '5px 12px', fontSize: '0.82rem' }}>
                  <ChevronLeft size={15} /> Prev
                </button>
                <button className="btn btn-primary" onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1} style={{ padding: '5px 12px', fontSize: '0.82rem' }}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CREATE MODE (2-step wizard) ────────────────────────────────────────
  return (
    <div className="fade-up">

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: '700',
              background: step >= s ? 'var(--blue)' : 'rgba(180,200,220,0.25)',
              color: step >= s ? 'white' : 'var(--t3)',
              transition: 'all 0.2s'
            }}>{s}</div>
            <span style={{ fontSize: '0.85rem', fontWeight: step === s ? '700' : '400', color: step === s ? 'var(--t1)' : 'var(--t3)', transition: 'all 0.2s' }}>
              {s === 1 ? 'Pick Location' : 'Mission Details'}
            </span>
            {s < 2 && <div style={{ width: '2rem', height: '1px', background: step > s ? 'var(--blue)' : 'rgba(180,200,220,0.4)', marginLeft: '0.25rem', transition: 'all 0.2s' }} />}
          </div>
        ))}
      </div>

      {createSuccess ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Navigation size={48} color="var(--emerald)" style={{ opacity: 0.8 }} />
          </div>
          <h3 style={{ fontWeight: '700', color: 'var(--emerald)', marginBottom: '0.5rem' }}>Mission Created!</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>Redirecting to your missions...</p>
        </div>

      ) : step === 1 ? (
        /* ── STEP 1: MAP ── */
        <div>
          <div style={{ marginBottom: '0.6rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--t1)', marginBottom: '0.15rem' }}>Select Target Location</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>Click anywhere on the map to drop a pin</p>
          </div>

          <div style={{ borderRadius: '14px', overflow: 'hidden', height: 'calc(100vh - 320px)', minHeight: '280px', maxHeight: '420px', border: '1px solid var(--border-side)', boxShadow: 'var(--shadow-card)', marginBottom: '0.85rem' }}>
            <MapContainer center={[11.0168, 76.9558]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              padding: '0.6rem 0.9rem', borderRadius: '10px',
              background: position ? 'rgba(4,120,87,0.06)' : 'rgba(0,0,0,0.03)',
              border: position ? '1px solid rgba(4,120,87,0.2)' : '1px dashed rgba(180,200,220,0.5)',
              fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '600',
              color: position ? 'var(--emerald)' : 'var(--t3)',
            }}>
              {position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'No location selected yet'}
            </div>
            <button
              className="btn btn-primary"
              disabled={!position}
              onClick={() => setStep(2)}
              style={{ padding: '10px 22px', fontSize: '0.9rem' }}
            >
              Next: Mission Details →
            </button>
          </div>
        </div>

      ) : (
        /* ── STEP 2: DETAILS ── */
        <div style={{ maxWidth: '560px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--t1)', marginBottom: '0.2rem' }}>Mission Details</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
              Location locked at{' '}
              <span style={{ fontFamily: 'monospace', color: 'var(--emerald)', fontWeight: '600' }}>
                {position?.lat.toFixed(4)}, {position?.lng.toFixed(4)}
              </span>
              {' · '}
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--blue-l)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0 }}>
                Change
              </button>
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="field">
                <label>Mission Name</label>
                <input type="text" className="fi" placeholder="e.g. Search Grid Alpha"
                  value={missionName} onChange={e => setMissionName(e.target.value)} required style={{ padding: '13px 16px' }} />
              </div>

              <div className="field">
                <label>Assign Drone</label>
                <select className="fi" value={droneId} onChange={e => setDroneId(e.target.value)} required style={{ padding: '13px 16px' }}>
                  <option value="">— Select a drone —</option>
                  {drones.filter(d => d.droneStatus === 'READY').map(d => (
                    <option key={d.id} value={d.id}>{d.droneCode} · {d.model}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Altitude (m)</label>
                  <input type="number" className="fi" placeholder="100" value={altitude}
                    onChange={e => setAltitude(e.target.value)} required style={{ padding: '13px 16px' }} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Risk Level</label>
                  <select className="fi" value={riskStatus} onChange={e => setRiskStatus(e.target.value)} style={{ padding: '13px 16px' }}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px' }}>
                  ← Back to Map
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 2, padding: '13px', fontSize: '0.95rem' }}>
                  {creating
                    ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                    : <><Plus size={18} /> Launch Mission</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionManagement;