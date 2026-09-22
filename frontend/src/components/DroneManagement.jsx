import { useState, useEffect } from 'react';
import { Plus, Send, XCircle, CheckCircle, Search, Cpu } from 'lucide-react';
import api from '../api/axiosConfig';

const DroneManagement = () => {
  const [activeTab, setActiveTab] = useState('view');
  
  // Registration Form State
  const [droneCode, setDroneCode] = useState('');
  const [model, setModel] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState({ type: '', message: '' });

  // List State
  const [drones, setDrones] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const fetchDrones = async (pageNum = 0) => {
    setListLoading(true);
    try {
      const res = await api.get(`/drone?start=${pageNum}&size=5`);
      setDrones(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch drones', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchDrones(0);
    }
  }, [activeTab]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterStatus({ type: '', message: '' });

    try {
      const res = await api.post('/drone', { droneCode, model });
      setRegisterStatus({ type: 'success', message: res.data });
      setDroneCode('');
      setModel('');
    } catch (err) {
      setRegisterStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to register drone.' 
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="win p-8 fade-up" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title mb-1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu color="var(--emerald)" /> Drone Management
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>Manage your fleet and register new drones.</p>
        </div>
      </div>

      {/* Internal Nav Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-side)',
        paddingBottom: '1rem'
      }}>
        <button 
          onClick={() => setActiveTab('view')}
          className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Search size={16} /> My Drones
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Plus size={16} /> Register Drone
        </button>
      </div>

      {/* Register Tab */}
      {activeTab === 'register' && (
        <div style={{ maxWidth: '500px' }} className="fade-up">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--t1)' }}>Register New Drone</h3>
          
          {registerStatus.message && (
            <div className={`alert ${registerStatus.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {registerStatus.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <span>{registerStatus.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="field">
              <label htmlFor="droneCode" style={{ color: 'var(--t1)', fontWeight: '600' }}>Drone Code</label>
              <input 
                type="text" 
                id="droneCode" 
                className="fi" 
                style={{ padding: '11px 14px' }}
                placeholder="e.g. AERO-X1-001"
                value={droneCode}
                onChange={(e) => setDroneCode(e.target.value)}
                required
              />
            </div>
            
            <div className="field">
              <label htmlFor="model" style={{ color: 'var(--t1)', fontWeight: '600' }}>Drone Model</label>
              <input 
                type="text" 
                id="model" 
                className="fi" 
                style={{ padding: '11px 14px' }}
                placeholder="e.g. DJI Matrice 300 RTK"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={registerLoading} style={{ width: '100%' }}>
                {registerLoading ? 'Registering...' : 'Register Drone'} <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Tab */}
      {activeTab === 'view' && (
        <div className="fade-up">
          {listLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--t2)' }}>Loading drones...</div>
          ) : drones.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-side)' }}>
              <Cpu size={48} color="var(--t3)" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: 'var(--t2)', fontSize: '1.1rem' }}>You haven't registered any drones yet.</p>
              <button onClick={() => setActiveTab('register')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Register Now
              </button>
            </div>
          ) : (
            <div>
              <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-side)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-side)', background: 'rgba(255,255,255,0.5)' }}>
                      <th style={{ padding: '1rem', color: 'var(--t2)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em' }}>DRONE CODE</th>
                      <th style={{ padding: '1rem', color: 'var(--t2)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em' }}>MODEL</th>
                      <th style={{ padding: '1rem', color: 'var(--t2)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drones.map(drone => (
                      <tr key={drone.id} style={{ borderBottom: '1px solid var(--border-side)' }}>
                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--t1)' }}>{drone.droneCode}</td>
                        <td style={{ padding: '1rem', color: 'var(--t2)' }}>{drone.model}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${drone.droneStatus === 'IN_MISSION' ? 'badge-on' : drone.droneStatus === 'BOOT' ? 'badge-off' : ''}`} style={{
                            background: drone.droneStatus === 'READY' ? 'rgba(59, 130, 246, 0.15)' : '',
                            color: drone.droneStatus === 'READY' ? 'var(--blue)' : '',
                            border: drone.droneStatus === 'READY' ? '1px solid rgba(59, 130, 246, 0.3)' : ''
                          }}>
                            {drone.droneStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => fetchDrones(page - 1)} 
                    disabled={page === 0}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--t2)', fontWeight: 500 }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => fetchDrones(page + 1)} 
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DroneManagement;
