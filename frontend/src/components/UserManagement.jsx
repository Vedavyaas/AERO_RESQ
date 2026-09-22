import { useState, useEffect } from 'react';
import { Users, Power, PowerOff, ShieldAlert, Plus, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../api/axiosConfig';

const UserManagement = ({ mode, onUserCreated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 8;

  // Create Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/all?start=${page}&size=${PAGE_SIZE}`);
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'view') fetchUsers();
  }, [mode, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateSuccess(false);
    try {
      await api.post('/user', { username, password, role });
      setCreateSuccess(true);
      setUsername('');
      setPassword('');
      setRole('USER');
      setTimeout(() => {
        if (onUserCreated) onUserCreated();
      }, 1200);
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('Failed to create user. The username might already exist.');
    } finally {
      setCreating(false);
    }
  };

  const toggleUser = async (userId) => {
    try {
      await api.patch(`/user/${userId}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle user status.');
    }
  };

  // ── VIEW MODE ──────────────────────────────────────────────────────────
  if (mode === 'view') {
    return (
      <div className="fade-up">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.25rem' }}>All Users</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>
              {totalElements} registered {totalElements === 1 ? 'account' : 'accounts'}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {/* Table Card */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'var(--t2)' }}>
              <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 0.8s linear infinite' }} />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--t2)' }}>
              <Users size={40} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>No users found.</p>
            </div>
          ) : (
            <table className="gtable">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600', color: 'var(--t1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: user.role === 'ADMIN'
                            ? 'linear-gradient(135deg, rgba(109,40,217,0.2), rgba(109,40,217,0.1))'
                            : 'linear-gradient(135deg, rgba(29,78,216,0.2), rgba(29,78,216,0.1))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: '700',
                          color: user.role === 'ADMIN' ? 'var(--violet)' : 'var(--blue)'
                        }}>
                          {user.username[0].toUpperCase()}
                        </div>
                        {user.username}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-agent'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.enabled ? 'badge-on' : 'badge-off'}`}>
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleUser(user.id)}
                        className={`btn ${user.enabled ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '5px 14px', fontSize: '0.78rem' }}
                      >
                        {user.enabled
                          ? <><PowerOff size={13} /> Disable</>
                          : <><Power size={13} /> Enable</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && (
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
                <button
                  className="btn btn-ghost"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                >
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
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--t1)', marginBottom: '0.25rem' }}>Create Account</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>Register a new user in the system</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {createSuccess ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem',
                background: 'rgba(4,120,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Power size={28} color="var(--emerald)" />
              </div>
              <h3 style={{ fontWeight: '700', color: 'var(--emerald)', marginBottom: '0.5rem' }}>User Created!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>Redirecting to user list...</p>
            </div>
          ) : (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  className="fi"
                  placeholder="e.g. john_doe"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{ padding: '13px 16px' }}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  className="fi"
                  placeholder="Set a secure password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ padding: '13px 16px' }}
                />
              </div>
              <div className="field">
                <label>Role</label>
                <select
                  className="fi"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{ padding: '13px 16px' }}
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
                style={{ padding: '14px', fontSize: '0.95rem', marginTop: '0.5rem' }}
              >
                {creating ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating...</> : <><Plus size={18} /> Create Account</>}
              </button>
            </form>
          )}
        </div>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(29,78,216,0.1)', padding: '0.5rem', borderRadius: '8px', flexShrink: 0 }}>
                <Users size={18} color="var(--blue)" />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Standard User</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                  Can view drones & missions, create and manage their own missions.
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(109,40,217,0.1)', padding: '0.5rem', borderRadius: '8px', flexShrink: 0 }}>
                <ShieldAlert size={18} color="var(--violet)" />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Administrator</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                  Full system access. Can manage all users, enable/disable accounts.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserManagement;