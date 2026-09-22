import { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../api/axiosConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/user/all?start=${pageNumber}&size=${size}`);
      // Page response structure: { content: [...], totalPages: N, ... }
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(user => user.id === id ? { ...user, enabled: !currentStatus } : user));
      await api.patch(`/user/${id}`);
    } catch (err) {
      console.error('Error toggling status:', err);
      // Revert on failure
      setUsers(prev => prev.map(user => user.id === id ? { ...user, enabled: currentStatus } : user));
      setError('Failed to update user status.');
    }
  };

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="section-label mt-4">Manage System Accounts</p>
        </div>
        <button onClick={() => fetchUsers(page)} className="btn btn-ghost" disabled={loading}>
          {loading ? <Loader2 className="spinner" size={16} /> : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="win mb-6" style={{ overflowX: 'auto' }}>
        <table className="gtable">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{user.username}</span>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-manager'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.enabled ? 'badge-on' : 'badge-off'}`}>
                      {user.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(user.id, user.enabled)}
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title={user.enabled ? 'Disable User' : 'Enable User'}
                    >
                      {user.enabled ? (
                        <ToggleRight size={20} color="var(--emerald)" />
                      ) : (
                        <ToggleLeft size={20} color="var(--t3)" />
                      )}
                      <span style={{ fontSize: '0.75rem' }}>{user.enabled ? 'Disable' : 'Enable'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button 
            className="btn btn-ghost" 
            disabled={page === 0 || loading} 
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            <ChevronLeft size={18} /> Prev
          </button>
          
          <span style={{ color: 'var(--t2)', fontSize: '0.9rem', fontWeight: 500 }}>
            Page {page + 1} of {totalPages}
          </span>
          
          <button 
            className="btn btn-ghost" 
            disabled={page >= totalPages - 1 || loading} 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;