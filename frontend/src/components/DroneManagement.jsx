import { useState, useEffect } from 'react';
import { Loader2, Plus, ShieldAlert, ChevronLeft, ChevronRight, Drone } from 'lucide-react';
import api from '../api/axiosConfig';

const DroneManagement = ({ mode, onDroneCreated }) => {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 8;

  // Create form state
  const [droneCode, setDroneCode] = useState('');
  const [model, setModel] = useState('');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/drone?start=${page}&size=${PAGE_SIZE}`);
      setDrones(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch drones:', err);
      setError('Could not load drones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'view') fetchDrones();
  }, [mode, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateSuccess(false);
    try {
      await api.post('/drone', { droneCode, model });
      setCreateSuccess(true);
      setDroneCode('');
      setModel('');
      setTimeout(() => {
        if (onDroneCreated) onDroneCreated();
      }, 1200);
    } catch (err) {
      console.error('Failed to create drone:', err);
      alert('Failed to register drone. It may already exist.');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (drone) => {
    // Only toggle between BOOT and READY
    const newStatus = drone.droneStatus === 'READY' ? 'BOOT' : 'READY';
    try {
      await api.patch(`/drone?id=${drone.id}&status=${newStatus}`);
      fetchDrones();
    } catch (err) {
      console.error('Failed to toggle drone status:', err);
      alert('Could not update drone status.');
    }
  };

  const statusColor = (status) => {
    if (status === 'READY')      return { bg: 'rgba(4,120,87,0.1)',    color: 'var(--emerald)', border: 'rgba(4,120,87,0.25)' };
    if (status === 'IN_MISSION') return { bg: 'rgba(14,116,144,0.1)',  color: 'var(--cyan)',    border: 'rgba(14,116,144,0.25)' };
    if (status === 'RETURNING')  return { bg: 'rgba(217,119,6,0.1)',   color: 'var(--gold-l)', border: 'rgba(217,119,6,0.25)' };
    if (status === 'BOOT')       return { bg: 'rgba(109,40,217,0.08)', color: 'var(--violet)', border: 'rgba(109,40,217,0.2)' };
    return { bg: 'rgba(180,200,220,0.15)', color: 'var(--t2)', border: 'rgba(180,200,220,0.4)' };
  };


  const statusLabel = (status) => {
    if (status === 'IN_MISSION') return 'In Mission';
    if (status === 'RETURNING')  return 'Returning';
    if (status === 'BOOT')       return 'Booting';
    if (status === 'READY')      return 'Ready';
    return status || 'Unknown';
  };

  // ── VIEW MODE ──────────────────────────────────────────────────────────
  if (mode === 'view') {
    return (
      <div className="fade-up">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.25rem' }}>My Drones</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
            {totalElements} registered {totalElements === 1 ? 'drone' : 'drones'}
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
              <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading drones...
            </div>
          ) : drones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--t2)' }}>
              <Drone size={40} style={{ opacity: 0.25, margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ fontWeight: '600', marginBottom: '0.35rem' }}>No drones registered yet</p>
              <p style={{ fontSize: '0.82rem' }}>Register your first drone from the sidebar.</p>
            </div>
          ) : (
            <table className="gtable">
              <thead>
                <tr>
                  <th>Drone</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {drones.map((drone) => {
                  const sc = statusColor(drone.droneStatus);
                  return (
                    <tr key={drone.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}><Drone size={18} color="var(--blue-l)" /></div>
                          <span style={{ fontWeight: '700', color: 'var(--t1)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                            {drone.droneCode}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--t2)' }}>{drone.model}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700',
                          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                          letterSpacing: '0.04em'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.color, flexShrink: 0 }}></span>
                          {statusLabel(drone.droneStatus)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {(drone.droneStatus === 'BOOT' || drone.droneStatus === 'READY') && (
                          <button
                            onClick={() => toggleStatus(drone)}
                            className={`btn ${drone.droneStatus === 'READY' ? 'btn-danger' : 'btn-primary'}`}
                            style={{ padding: '5px 14px', fontSize: '0.78rem' }}
                          >
                            {drone.droneStatus === 'READY' ? 'Set Boot' : 'Set Ready'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && drones.length > 0 && (
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

  // ── CREATE MODE ────────────────────────────────────────────────────────
  return (
    <div className="fade-up">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.25rem' }}>Register Drone</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>Add a new drone to your fleet</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          {createSuccess ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Drone size={48} color="var(--emerald)" style={{ opacity: 0.8 }} />
            </div>
            <h3 style={{ fontWeight: '700', color: 'var(--emerald)', marginBottom: '0.5rem' }}>Drone Registered!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>Redirecting to your fleet...</p>
            </div>
          ) : (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="field">
                <label>Drone Code</label>
                <input type="text" className="fi" placeholder="e.g. D-101"
                  value={droneCode} onChange={e => setDroneCode(e.target.value)} required
                  style={{ padding: '13px 16px' }} />
              </div>
              <div className="field">
                <label>Model</label>
                <input type="text" className="fi" placeholder="e.g. DJI Mavic 3"
                  value={model} onChange={e => setModel(e.target.value)} required
                  style={{ padding: '13px 16px' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}
                style={{ padding: '14px', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                {creating
                  ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Registering...</>
                  : <><Plus size={18} /> Register Drone</>}
              </button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.4rem', borderRadius: '8px', flexShrink: 0 }}><Drone size={16} color="var(--blue-l)" /></div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Drone Code</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                  A unique short identifier for the drone. Used in missions and logs.
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.4rem', borderRadius: '8px', flexShrink: 0 }}><Plus size={16} color="var(--blue-l)" /></div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Model</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                  The manufacturer model name, e.g. DJI Mavic 3, Parrot Anafi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneManagement;
